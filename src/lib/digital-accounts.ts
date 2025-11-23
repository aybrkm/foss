import { ObligationFrequency, SubscriptionPeriod } from "@prisma/client";
import prisma from "@/lib/prisma";
import { computeNextDue } from "@/lib/recurrence";

type RecurrenceMeta = {
  isRecurring: boolean;
  recurrenceInterval: number | null;
  recurrenceUnit: "month" | null;
  frequency: ObligationFrequency;
};

type SyncArgs = {
  accountId: string;
  userId: string;
  providerName: string;
  accountIdentifier: string;
  amount: number;
  currency: string;
  period: SubscriptionPeriod;
  firstDue: Date;
  notes?: string | null;
};

export async function syncSubscriptionForAccount({
  accountId,
  userId,
  providerName,
  accountIdentifier,
  amount,
  currency,
  period,
  firstDue,
  notes,
}: SyncArgs) {
  const recurrence = getRecurrenceMeta(period);
  const nextDue = computeNextDue({
    baseDate: firstDue,
    recurrenceInterval: recurrence.recurrenceInterval,
    recurrenceUnit: recurrence.recurrenceUnit,
  });

  await prisma.digitalSubscription.upsert({
    where: { digitalAccountId: accountId },
    create: {
      digitalAccountId: accountId,
      userId,
      amount,
      currency,
      period,
      firstDue,
    },
    update: {
      amount,
      currency,
      period,
      firstDue,
      userId,
    },
  });

  const activeObligations = await prisma.obligation.findMany({
    where: { digitalAccountId: accountId, userId },
    orderBy: { nextDue: "asc" },
  });

  const [primary, ...duplicates] = activeObligations;
  if (duplicates.length > 0) {
    await prisma.obligation.deleteMany({
      where: { id: { in: duplicates.map((item) => item.id) } },
    });
  }

  const obligationPayload = {
    name: `${providerName} otomatik ödeme`,
    category: "payment" as const,
    amount,
    currency,
    frequency: recurrence.frequency,
    isRecurring: recurrence.isRecurring,
    recurrenceInterval: recurrence.isRecurring ? recurrence.recurrenceInterval : null,
    recurrenceUnit: recurrence.isRecurring ? recurrence.recurrenceUnit : null,
    nextDue,
    notes:
      notes ??
      `${providerName} (${accountIdentifier}) aboneliği için otomatik oluşturuldu.`,
    isActive: true,
    isDone: false,
    digitalAccountId: accountId,
    userId,
  };

  if (primary) {
    await prisma.obligation.update({
      where: { id: primary.id },
      data: obligationPayload,
    });
  } else {
    await prisma.obligation.create({
      data: obligationPayload,
    });
  }
}

export async function removeSubscriptionForAccount(accountId: string, userId: string) {
  await prisma.obligation.deleteMany({
    where: { digitalAccountId: accountId, userId },
  });
  await prisma.digitalSubscription.deleteMany({
    where: { digitalAccountId: accountId, userId },
  });
}

function getRecurrenceMeta(period: SubscriptionPeriod): RecurrenceMeta {
  switch (period) {
    case "monthly":
      return {
        isRecurring: true,
        recurrenceInterval: 1,
        recurrenceUnit: "month",
        frequency: "monthly",
      };
    case "quarterly":
      return {
        isRecurring: true,
        recurrenceInterval: 3,
        recurrenceUnit: "month",
        frequency: "quarterly",
      };
    case "semiannual":
      return {
        isRecurring: true,
        recurrenceInterval: 6,
        recurrenceUnit: "month",
        frequency: "custom",
      };
    case "yearly":
      return {
        isRecurring: true,
        recurrenceInterval: 12,
        recurrenceUnit: "month",
        frequency: "yearly",
      };
    case "lifetime":
    default:
      return {
        isRecurring: false,
        recurrenceInterval: null,
        recurrenceUnit: null,
        frequency: "once",
      };
  }
}
