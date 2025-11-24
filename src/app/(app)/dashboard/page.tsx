import prisma from "@/lib/prisma";
import { convertToTry, getExchangeRates } from "@/lib/exchange";
import { DashboardWidgets } from "@/components/dashboard/DashboardWidgets";
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

  const assetsForWidgets = assetsWithRates.slice(0, 3).map((asset: AssetWithConversion) => ({
    id: asset.id,
    name: asset.name,
    assetType: asset.assetType,
    isLiquid: asset.isLiquid,
    value: asset.numericValue,
    valueTry: asset.valueTry,
    currency: asset.currency,
  }));

  const obligationsForWidgets = upcomingObligations.slice(0, 2).map((obligation: ObligationRow) => {
    const amountNumber = obligation.amount ? Number(obligation.amount) : null;
    return {
      id: obligation.id,
      name: obligation.name,
      category: obligation.category,
      status: obligation.isActive ? "Aktif" : "Pasif",
      amount: amountNumber,
      amountTry: amountNumber ? convertToTry(amountNumber, obligation.currency, rates) : null,
      currency: obligation.currency,
      nextDue: obligation.nextDue ? obligation.nextDue.toISOString() : null,
    };
  });

const remindersForWidgets = importantReminders.slice(0, 3).map((reminder: ReminderDetail) => ({
  id: reminder.id,
  title: reminder.title,
  dueAt: reminder.dueAt,
}));

  const journalForWidgets = journalRows.slice(0, 2).map((entry: JournalRow) => ({
    id: entry.id,
    title: entry.title ?? "Not",
    body: entry.body,
    date: entry.entryDate.toISOString(),
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

      <DashboardWidgets
        assets={assetsForWidgets}
        obligations={obligationsForWidgets}
        reminders={remindersForWidgets}
        journal={journalForWidgets}
      />
    </div>
  );
}

function getDayDisplay(daysLeft: number) {
  if (daysLeft < 0) {
    return { label: `${Math.abs(daysLeft)} gun gecikti`, className: "text-rose-400 font-bold animate-pulse" };
  }
  if (daysLeft === 0) {
    return { label: "Bugun", className: "text-amber-400 font-bold animate-pulse" };
  }
  if (daysLeft <= 14) {
    return { label: `${daysLeft} gun kaldi`, className: "text-rose-300 font-bold animate-pulse" };
  }
  return { label: `${daysLeft} gun kaldi`, className: "text-emerald-300 font-semibold" };
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
