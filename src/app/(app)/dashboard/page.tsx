import prisma from "@/lib/prisma";
import { convertToTry, getExchangeRates } from "@/lib/exchange";
import { formatCurrency } from "@/lib/format";
import { SummaryKpis } from "@/components/dashboard/SummaryKpis";
import { requireUserId } from "@/lib/auth";

const DAY_MS = 1000 * 60 * 60 * 24;

const horizonLabels = {
  week: "Bu Hafta",
  month: "Bu Ay",
  year: "Bu Sene",
} as const;

const horizonOrder = ["week", "month", "year"] as const;
type HorizonKey = (typeof horizonOrder)[number];

type HorizonItem = {
  id: string;
  title: string;
  dueDate: string;
  daysLeft: number;
  kind: "OBLIGATION" | "REMINDER" | "INCOME";
};

type HorizonBuckets = Record<HorizonKey, HorizonItem[]>;
const kindLabels: Record<HorizonItem["kind"], string> = {
  OBLIGATION: "Yükümlülük",
  REMINDER: "Hatırlatma",
  INCOME: "Gelir",
};

export default async function DashboardPage() {
  const userId = await requireUserId();
  const [assetRows, obligationRows, reminderRows, journalRows, incomeRows, rates] = await Promise.all([
    prisma.asset.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
    prisma.obligation.findMany({
      where: { userId },
      orderBy: { nextDue: "asc" },
    }),
    prisma.reminder.findMany({
      where: { userId },
      orderBy: { dueAt: "asc" },
    }),
    prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { entryDate: "desc" },
      take: 4,
    }),
    prisma.cashflowIncome.findMany({
      where: { userId },
      orderBy: { occurredAt: "asc" },
    }),
    getExchangeRates(),
  ]);
  type ObligationRow = (typeof obligationRows)[number];
  type ReminderRow = (typeof reminderRows)[number];
  type AssetRow = (typeof assetRows)[number];
  type JournalRow = (typeof journalRows)[number];
  type IncomeRow = (typeof incomeRows)[number];
  type AssetWithConversion = AssetRow & { valueTry: number; numericValue: number };
  const now = new Date();
  const nowMs = now.getTime();
  const assetsWithRates: AssetWithConversion[] = assetRows.map((asset: AssetRow) => {
    const numericValue = Number(asset.currentValue);
    return {
      ...asset,
      numericValue,
      valueTry: convertToTry(numericValue, asset.currency, rates),
    };
  });

  const totalAssetValue = assetsWithRates.reduce(
    (sum: number, asset: AssetWithConversion) => sum + asset.valueTry,
    0,
  );
  const liquidAssetValue = assetsWithRates
    .filter((asset: AssetWithConversion) => asset.isLiquid)
    .reduce((sum: number, asset: AssetWithConversion) => sum + asset.valueTry, 0);

  const obligationNameMap = new Map(
    obligationRows.map((obligation: ObligationRow) => [obligation.id, obligation.name] as const),
  );

  const activeObligationRows = obligationRows.filter(
    (obligation: ObligationRow) => !obligation.isDone,
  );
  const activeReminderRows = reminderRows.filter((reminder: ReminderRow) => !reminder.isDone);
  const totalLiquidPercent = totalAssetValue > 0 ? (liquidAssetValue / totalAssetValue) * 100 : 0;
  const totalIlliquidPercent = totalAssetValue > 0 ? 100 - totalLiquidPercent : 0;
  const categoryTotals = assetsWithRates.reduce((acc: Record<string, number>, asset) => {
    acc[asset.assetType] = (acc[asset.assetType] ?? 0) + asset.valueTry;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key, value]) => ({
      name: key,
      value,
      percent: totalAssetValue > 0 ? (value / totalAssetValue) * 100 : 0,
    }));
  const breakdownByLiquidity = (isLiquid: boolean) => {
    const totals = assetsWithRates
      .filter((asset) => asset.isLiquid === isLiquid)
      .reduce((acc: Record<string, number>, asset) => {
        acc[asset.assetType] = (acc[asset.assetType] ?? 0) + asset.valueTry;
        return acc;
      }, {});
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, value]) => ({
        name: key,
        value,
        percent:
          (isLiquid ? liquidAssetValue : totalAssetValue - liquidAssetValue) > 0
            ? (value / (isLiquid ? liquidAssetValue : totalAssetValue - liquidAssetValue)) * 100
            : 0,
      }));
  };
  const liquidSlices = breakdownByLiquidity(true);
  const illiquidSlices = breakdownByLiquidity(false);

  const reminderDetails = activeReminderRows.map((reminder: ReminderRow) => ({
    id: reminder.id,
    title: reminder.title,
    description: reminder.description,
    dueAt: reminder.dueAt.toISOString(),
    isVeryImportant: reminder.isVeryImportant,
    related: reminder.relatedObligationId
      ? obligationNameMap.get(reminder.relatedObligationId) ?? null
      : null,
  }));

type ReminderDetail = (typeof reminderDetails)[number];

const importantReminders = reminderDetails.filter(
  (reminder: ReminderDetail) => reminder.isVeryImportant,
);

  const upcomingIncomes = incomeRows
    .filter((income: IncomeRow) => new Date(income.occurredAt).getTime() > nowMs)
    .map((income: IncomeRow) => ({
      id: income.id,
      title: income.title,
      dueDate: income.occurredAt.toISOString(),
      daysLeft: calculateDaysLeft(income.occurredAt.toISOString(), nowMs),
      kind: "INCOME" as const,
    }));

  const upcomingObligations = activeObligationRows
    .filter((obligation: ObligationRow) => {
      if (!obligation.nextDue) {
        return false;
      }
      return new Date(obligation.nextDue).getTime() > nowMs;
    })
    .sort((a: ObligationRow, b: ObligationRow) => {
      return new Date(a.nextDue ?? 0).getTime() - new Date(b.nextDue ?? 0).getTime();
    });

  const summaryObligations = upcomingObligations.map((obligation: ObligationRow) => {
    const amountNumber = obligation.amount ? Number(obligation.amount) : null;
    return {
      id: obligation.id,
      name: obligation.name,
      category: obligation.category,
      frequency: obligation.frequency,
      amount: amountNumber,
      amountTry: amountNumber ? convertToTry(amountNumber, obligation.currency, rates) : null,
      currency: obligation.currency,
      nextDue: obligation.nextDue ? obligation.nextDue.toISOString() : null,
      notes: obligation.notes,
      isRecurring: obligation.isRecurring,
      recurrenceUnit: obligation.recurrenceUnit,
      recurrenceInterval: obligation.recurrenceInterval,
    };
  });

  const assetDetails = assetsWithRates.map((asset: AssetWithConversion) => ({
    id: asset.id,
    name: asset.name,
    assetType: asset.assetType,
    isLiquid: asset.isLiquid,
    value: asset.numericValue,
    valueTry: asset.valueTry,
    currency: asset.currency,
    updatedAt: asset.updatedAt.toISOString(),
  }));

  const horizonBuckets = getHorizonBuckets(
    reminderDetails.map((reminder: ReminderDetail) => ({
      id: reminder.id,
      title: reminder.title,
      dueDate: reminder.dueAt,
      daysLeft: calculateDaysLeft(reminder.dueAt, nowMs),
      kind: "REMINDER" as const,
    })),
    activeObligationRows
      .filter(
        (
          obligation: ObligationRow,
        ): obligation is ObligationRow & { nextDue: NonNullable<ObligationRow["nextDue"]> } =>
          Boolean(obligation.nextDue),
      )
      .map((obligation: ObligationRow & { nextDue: NonNullable<ObligationRow["nextDue"]> }) => ({
        id: obligation.id,
        title: obligation.name,
        dueDate: obligation.nextDue.toISOString(),
        daysLeft: calculateDaysLeft(obligation.nextDue.toISOString(), nowMs),
        kind: "OBLIGATION" as const,
      })),
    upcomingIncomes,
  );

  return (
    <div className="flex flex-col gap-6">
      <SummaryKpis
        totalAssetValue={totalAssetValue}
        liquidAssetValue={liquidAssetValue}
        assets={assetDetails}
        upcomingObligations={summaryObligations}
        importantReminders={importantReminders.map((reminder: ReminderDetail) => ({
          id: reminder.id,
          title: reminder.title,
          description: reminder.description,
          dueAt: reminder.dueAt,
          related: reminder.related,
        }))}
      />

      <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {horizonOrder.map((key) => (
            <div key={key} className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {horizonLabels[key]}
              </p>
              <div className="space-y-3">
                {horizonBuckets[key].length === 0 && (
                  <p className="text-sm text-slate-500">Gorev yok.</p>
                )}
                {horizonBuckets[key].map((item) => {
                  const { label: dayLabel, className: dayClass } = getDayDisplay(item.daysLeft);
                  const toneStyle =
                    item.kind === "OBLIGATION"
                      ? { backgroundColor: "rgba(244, 63, 94, 0.08)" }
                      : item.kind === "REMINDER"
                        ? { backgroundColor: "rgba(251, 191, 36, 0.08)" }
                        : { backgroundColor: "rgba(16, 185, 129, 0.08)" };
                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-white/10 p-4"
                      style={toneStyle}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                            {kindLabels[item.kind]}
                          </p>
                        </div>
                        <p className={`text-xs ${dayClass}`}>{dayLabel}</p>
                      </div>
                      <p className="text-xs text-slate-400">
                        {new Date(item.dueDate).toLocaleString("tr-TR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Kuşbakışı Finans Radarı</p>
            <p className="text-lg font-semibold text-white">Likit/illikit dağılımı ve varlık kompozisyonu</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-slate-200">
              <p className="text-xs uppercase tracking-[0.25em] text-indigo-200">Net varlık</p>
              <p className="text-base font-semibold text-white">{formatCurrency(totalAssetValue, "TRY")}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-slate-200">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Likit</p>
              <p className="text-base font-semibold text-white">{totalLiquidPercent.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-slate-200">
              <p className="text-xs uppercase tracking-[0.25em] text-rose-200">İllikit</p>
              <p className="text-base font-semibold text-white">{totalIlliquidPercent.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">En büyük 4 kategori</p>
            <div className="space-y-2">
              {topCategories.map((cat) => (
                <div key={cat.name} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>{cat.name}</span>
                    <span className="font-semibold">{formatCurrency(cat.value, "TRY")}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-indigo-400"
                      style={{ width: `${Math.min(100, cat.percent)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{cat.percent.toFixed(1)}% portföy</p>
                </div>
              ))}
              {topCategories.length === 0 && (
                <p className="text-sm text-slate-500">Henüz varlık eklenmemiş.</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Likit kırılım</p>
              {liquidSlices.length === 0 && <p className="text-sm text-slate-500">Kayıt yok.</p>}
              {liquidSlices.map((slice) => (
                <div key={slice.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>{slice.name}</span>
                    <span className="font-semibold">{slice.percent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-emerald-400"
                      style={{ width: `${Math.min(100, slice.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-200">İllikit kırılım</p>
              {illiquidSlices.length === 0 && <p className="text-sm text-slate-500">Kayıt yok.</p>}
              {illiquidSlices.map((slice) => (
                <div key={slice.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>{slice.name}</span>
                    <span className="font-semibold">{slice.percent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-rose-400"
                      style={{ width: `${Math.min(100, slice.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          İleride: bankada/EMT’lerde, vadeli mevduatta, hisse/ETF’de ve gayrimenkulde anlık dağılım; BIST ve ABD
          hisselerini doğrudan platformdan al/sat entegrasyonu.
        </p>
      </section>
    </div>
  );
}

function getDayDisplay(daysLeft: number) {
  if (daysLeft < 0) {
    return { label: `${Math.abs(daysLeft)} gün gecikti`, className: "text-rose-400 font-bold animate-pulse" };
  }
  if (daysLeft === 0) {
    return { label: "Bugün", className: "text-amber-400 font-bold animate-pulse" };
  }
  if (daysLeft <= 14) {
    return { label: `${daysLeft} gün kaldı`, className: "text-rose-300 font-bold animate-pulse" };
  }
  return { label: `${daysLeft} gün kaldı`, className: "text-emerald-300 font-semibold" };
}

function getHorizonBuckets(
  reminderItems: HorizonItem[],
  obligationItems: HorizonItem[],
  incomeItems: HorizonItem[],
): HorizonBuckets {
  const buckets: HorizonBuckets = { week: [], month: [], year: [] };
  const sortBucket = (items: HorizonItem[]) =>
    items.sort((a, b) => {
      if (a.daysLeft !== b.daysLeft) {
        return a.daysLeft - b.daysLeft;
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const assign = (item: HorizonItem) => {
    if (item.daysLeft < 0) {
      return;
    }
    if (item.daysLeft <= 7) {
      buckets.week.push(item);
    } else if (item.daysLeft <= 30) {
      buckets.month.push(item);
    } else if (item.daysLeft <= 365) {
      buckets.year.push(item);
    }
  };

  reminderItems.forEach(assign);
  obligationItems.forEach(assign);
  incomeItems.forEach(assign);

  return {
    week: sortBucket(buckets.week),
    month: sortBucket(buckets.month),
    year: sortBucket(buckets.year),
  };
}

function calculateDaysLeft(target: string, referenceMs: number) {
  const diff = new Date(target).getTime() - referenceMs;
  return Math.ceil(diff / DAY_MS);
}
