import prisma from "@/lib/prisma";
import { convertToTry, getExchangeRates } from "@/lib/exchange";
import { DashboardWidgets } from "@/components/dashboard/DashboardWidgets";
import { SummaryKpis } from "@/components/dashboard/SummaryKpis";

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
  kind: "OBLIGATION" | "REMINDER";
};

type HorizonBuckets = Record<HorizonKey, HorizonItem[]>;
const kindLabels: Record<HorizonItem["kind"], string> = {
  OBLIGATION: "Yükümlülük",
  REMINDER: "Hatırlatma",
};

export default async function DashboardPage() {
  const [assetRows, obligationRows, reminderRows, journalRows, rates] = await Promise.all([
    prisma.asset.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.obligation.findMany({
      orderBy: { nextDue: "asc" },
    }),
    prisma.reminder.findMany({
      where: { isDone: false },
      orderBy: { dueAt: "asc" },
    }),
    prisma.journalEntry.findMany({
      orderBy: { entryDate: "desc" },
      take: 4,
    }),
    getExchangeRates(),
  ]);
  type ObligationRow = (typeof obligationRows)[number];
  type ReminderRow = (typeof reminderRows)[number];
  type AssetRow = (typeof assetRows)[number];
  type JournalRow = (typeof journalRows)[number];
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

  const totalAssetValue = assetsWithRates.reduce((sum: number, asset: { valueTry: number }) => sum + asset.valueTry, 0);
  const liquidAssetValue = assetsWithRates
    .filter((asset: { isLiquid: any }) => asset.isLiquid)
    .reduce((sum: number, asset: { valueTry: number }) => sum + asset.valueTry, 0);

  const obligationNameMap = new Map(
    obligationRows.map((obligation: { id: any; name: any; }) => [obligation.id, obligation.name]),
  );

const reminderDetails = reminderRows.map((reminder: ReminderRow) => ({
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

  const upcomingObligations = obligationRows
    .filter((obligation: ObligationRow) => {
      if (!obligation.nextDue) {
        return false;
      }
      return new Date(obligation.nextDue).getTime() > nowMs;
    })
    .sort(
      (a: { nextDue: any; }, b: { nextDue: any; }) =>
        new Date(a.nextDue ?? 0).getTime() - new Date(b.nextDue ?? 0).getTime(),
    );

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
    obligationRows
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
                  <p className="text-sm text-slate-500">Görev yok.</p>
                )}
                {horizonBuckets[key].map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                          {kindLabels[item.kind]}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-white">
                        {item.daysLeft} gün
                      </p>
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
                ))}
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

function getHorizonBuckets(
  reminderItems: HorizonItem[],
  obligationItems: HorizonItem[],
): HorizonBuckets {
  const buckets: HorizonBuckets = {
    week: [],
    month: [],
    year: [],
  };

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

  return buckets;
}

function calculateDaysLeft(target: string, referenceMs: number) {
  const diff = new Date(target).getTime() - referenceMs;
  return Math.ceil(diff / DAY_MS);
}
