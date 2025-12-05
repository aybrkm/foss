import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { convertToTry, getExchangeRates } from "@/lib/exchange";
import { formatCurrency } from "@/lib/format";
import { computeNextDue } from "@/lib/recurrence";
import { ObligationForm } from "@/components/forms/ObligationForm";
import { ObligationsTable } from "@/components/obligations/ObligationsTable";
import { IntegrationInfoCard } from "@/components/common/IntegrationInfoCard";
import type { Integration } from "@/components/common/IntegrationInfoCard";
import { requireUserId } from "@/lib/auth";

const categories = ["payment", "legal", "other"] as const;
const recurrenceUnits = ["week", "month"] as const;
const currencyOptions = ["TRY", "USD", "AED", "EUR"] as const;
const DAY_MS = 24 * 60 * 60 * 1000;

const obligationIntegrations: Integration[] = [
  {
    region: "Türkiye",
    items: [
      { name: "Paraşüt", description: "Fatura ve taksit verisini çekip yükümlülük kaydı oluşturma.", product: "both" },
      { name: "Logo Netsis", description: "ERP ödeme planlarını Workspace listesine eşitleme.", product: "business" },
      { name: "Mikro Yazılım", description: "Cari hesap taksitlerini otomatik çekme.", product: "business" },
      { name: "Nebim V3", description: "Mağaza tedarik borçlarını iş kartına dönüştürmek.", product: "business" },
      { name: "BizimHesap", description: "Serbest meslek fatura tahsilatlarını izlemek.", product: "personal" },
      { name: "Kolay IK Bordro", description: "Maaş ve yan hak ödemelerini yükümlülükler olarak işlemek.", product: "business" },
      { name: "Kuveyt Türk Kurumsal", description: "Leasing ve taksitli borçları senkronize etmek.", product: "business" },
      { name: "Akbank Kurumsal Ödeme", description: "Kredi taksitlerini otomatik planlamak.", product: "business" },
      { name: "Vodafone Business Cloud", description: "Operasyonel abonelikleri kartlaştırmak.", product: "business" },
      { name: "Türk Telekom Kurumsal", description: "Periyodik telekom ödemelerini takibe almak.", product: "business" },
    ],
  },
  {
    region: "ABD",
    items: [
      { name: "QuickBooks Online", description: "Bills modülündeki ödemeleri vadeleriyle içeri aktarma.", product: "business" },
      { name: "Stripe Billing", description: "Abonelik planlarını otomatik izleme.", product: "business" },
      { name: "Xero Bills", description: "Vendor invoice’larını Workspace’de göstermek.", product: "business" },
      { name: "Bill.com", description: "AP süreçlerini aktararak onay takibi yapmak.", product: "business" },
      { name: "Chargebee", description: "SaaS faturalarını görev olarak işlemek.", product: "business" },
      { name: "Gusto Payroll", description: "Bordro ödeme tarihlerini yükümlülüğe dönüştürmek.", product: "business" },
      { name: "Rippling", description: "Personel yan hak ödemelerini otomatik hatırlatmak.", product: "business" },
      { name: "Sage Intacct", description: "Kurumsal borç planlarını senkronize etme.", product: "business" },
      { name: "FreshBooks", description: "Serbest meslek faturalarını otomatik takip etmek.", product: "personal" },
      { name: "Oracle NetSuite", description: "Global AP kalemlerini Workspace’e bağlamak.", product: "business" },
    ],
  },
];

const adjustDateInput = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  date.setTime(date.getTime() + DAY_MS);
  return date;
};

function calculateNextRecurringDate(obligation: {
  nextDue: Date | null;
  recurrenceInterval: number | null;
  recurrenceUnit: "week" | "month" | null;
  endDate?: Date | null;
}) {
  if (!obligation.recurrenceInterval || !obligation.recurrenceUnit || !obligation.nextDue) {
    return null;
  }
  const next = new Date(obligation.nextDue);
  if (obligation.recurrenceUnit === "week") {
    next.setDate(next.getDate() + 7 * obligation.recurrenceInterval);
  } else {
    const originalDay = next.getDate();
    next.setMonth(next.getMonth() + obligation.recurrenceInterval, 1);
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(originalDay, lastDay));
  }
  if (obligation.endDate && next.getTime() > new Date(obligation.endDate).getTime()) {
    return null;
  }
  return next;
}

function calculateRecurrenceEndDate({
  startDate,
  interval,
  unit,
  count,
}: {
  startDate: Date;
  interval: number;
  unit: "week" | "month";
  count: number;
}) {
  const end = new Date(startDate);
  end.setHours(0, 0, 0, 0);
  if (count <= 1) {
    return end;
  }
  for (let i = 1; i < count; i += 1) {
    if (unit === "week") {
      end.setDate(end.getDate() + 7 * interval);
    } else {
      const originalDay = end.getDate();
      end.setMonth(end.getMonth() + interval, 1);
      const lastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
      end.setDate(Math.min(originalDay, lastDay));
    }
  }
  return end;
}

async function createObligation(formData: FormData) {
  "use server";
  const userId = await requireUserId();
  const name = formData.get("name")?.toString().trim();
  const category = formData.get("category")?.toString() as (typeof categories)[number] | undefined;
  const amountRaw = formData.get("amount")?.toString();
  const amountUnknown = formData.get("amountUnknown") === "on";
  const currency = formData.get("currency")?.toString() || currencyOptions[0];
  const nextDueRaw = formData.get("nextDue")?.toString();
  const notes = formData.get("notes")?.toString().trim() || null;
  const isRecurring = formData.get("isRecurring") === "on";
  const recurrenceUnit = formData.get("recurrenceUnit")?.toString() as
    | (typeof recurrenceUnits)[number]
    | undefined;
  const recurrenceIntervalRaw = formData.get("recurrenceInterval")?.toString();
  const recurrenceCountRaw = formData.get("recurrenceCount")?.toString();
  const recurrenceEndless = formData.get("recurrenceEndless") === "on";
  const recurrenceInterval =
    recurrenceIntervalRaw && recurrenceIntervalRaw.length > 0
      ? Number(recurrenceIntervalRaw)
      : null;
  const recurrenceCount =
    recurrenceCountRaw && recurrenceCountRaw.length > 0 ? Number(recurrenceCountRaw) : null;
  const baseDate = adjustDateInput(nextDueRaw);

  if (!name || !category) {
    throw new Error("Eksik yükümlülük bilgisi");
  }

  const requiresInterval = isRecurring;
  if (requiresInterval) {
    if (
      !recurrenceUnit ||
      !recurrenceInterval ||
      Number.isNaN(recurrenceInterval) ||
      recurrenceInterval <= 0
    ) {
      throw new Error("Tekrar eden yükümlülük için aralık ve birim belirtmelisin");
    }
    if (!baseDate) {
      throw new Error("Tekrar eden yükümlülüklerde bir başlangıç tarihi girilmelidir");
    }
    if (!recurrenceEndless) {
      if (!recurrenceCount || Number.isNaN(recurrenceCount) || recurrenceCount <= 0) {
        throw new Error("Tekrar sayısını gir veya 'sonu yok' işaretle");
      }
      const maxAllowed = recurrenceUnit === "week" ? 52 : recurrenceUnit === "month" ? 24 : null;
      if (maxAllowed && recurrenceCount > maxAllowed) {
        throw new Error(
          `Tekrar sayısı ${recurrenceUnit === "week" ? "haftalık" : "aylık"} plan için en fazla ${maxAllowed}.`,
        );
      }
    }
  }

  let endDate: Date | null = null;
  let occurrences: Date[] = [];
  if (isRecurring && recurrenceInterval && recurrenceUnit && baseDate) {
    if (!recurrenceEndless && recurrenceCount) {
      occurrences = Array.from({ length: recurrenceCount }).reduce((list: Date[], _, index) => {
        if (index === 0) {
          return [baseDate];
        }
        const prev = list[index - 1];
        const next = calculateRecurrenceEndDate({
          startDate: prev,
          interval: recurrenceInterval,
          unit: recurrenceUnit,
          count: 2,
        });
        return [...list, next];
      }, []);
      endDate = occurrences[occurrences.length - 1] ?? null;
    } else {
      const computed = computeNextDue({
        baseDate,
        recurrenceUnit: requiresInterval ? recurrenceUnit ?? null : null,
        recurrenceInterval: requiresInterval ? recurrenceInterval ?? null : null,
      });
      if (computed) {
        occurrences = [computed];
      }
    }
  }
  const nextDue = occurrences[0] ?? baseDate;
  const parsedAmount = amountRaw && amountRaw.length > 0 ? Number(amountRaw) : null;
  const amount = amountUnknown ? null : parsedAmount && parsedAmount > 0 ? parsedAmount : null;
  const isBelli = !amountUnknown;

  const baseData = {
    name,
    category,
    frequency: "custom" as const,
    amount,
    currency: amount !== null ? currency : null,
    isBelli,
    isRecurring: requiresInterval,
    recurrenceUnit: requiresInterval ? recurrenceUnit : null,
    recurrenceInterval: requiresInterval ? recurrenceInterval : null,
    endDate,
    isActive: true,
    notes,
    userId,
  };

  if (occurrences.length > 1) {
    const operations = occurrences.map((date) =>
      prisma.obligation.create({
        data: {
          ...baseData,
          nextDue: date,
        },
      }),
    );
    await prisma.$transaction(operations);
  } else {
    await prisma.obligation.create({
      data: {
        ...baseData,
        nextDue,
      },
    });
  }

  revalidatePath("/obligations");
  revalidatePath("/dashboard");
}

async function markObligationDone(formData: FormData) {
  "use server";
  const userId = await requireUserId();
  const id = formData.get("id")?.toString();
  if (!id) {
    throw new Error("Yükümlülük bulunamadı");
  }
  const obligation = await prisma.obligation.findFirst({
    where: { id, userId },
  });
  if (!obligation) {
    throw new Error("Yükümlülük bulunamadı");
  }
  if (!obligation.isBelli) {
    throw new Error("Tutar belli olmadan tamamlandı olarak işaretlenemez");
  }

  const shouldClone =
    obligation.isRecurring &&
    obligation.recurrenceInterval &&
    obligation.recurrenceUnit &&
    !obligation.isDone &&
    !obligation.endDate;

  if (shouldClone) {
    const nextDue = calculateNextRecurringDate(obligation);
    if (nextDue) {
      await prisma.$transaction([
        prisma.obligation.update({
          where: { id },
          data: { isDone: true },
        }),
        prisma.obligation.create({
          data: {
            name: obligation.name,
            category: obligation.category,
            amount: obligation.amount,
            currency: obligation.currency,
            frequency: obligation.frequency,
            isRecurring: obligation.isRecurring,
            isBelli: obligation.isBelli,
            recurrenceInterval: obligation.recurrenceInterval,
            recurrenceUnit: obligation.recurrenceUnit,
            endDate: obligation.endDate,
            nextDue,
            notes: obligation.notes,
            isActive: obligation.isActive,
            userId: obligation.userId,
            digitalAccountId: obligation.digitalAccountId,
          },
        }),
      ]);
    } else {
      await prisma.obligation.update({
        where: { id },
        data: { isDone: true },
      });
    }
  } else {
    await prisma.obligation.update({
      where: { id },
      data: { isDone: true },
    });
  }
  revalidatePath("/obligations");
  revalidatePath("/dashboard");
}

async function deleteObligation(formData: FormData) {
  "use server";
  const userId = await requireUserId();
  const id = formData.get("id")?.toString();
  if (!id) {
    throw new Error("Yükümlülük bulunamadı");
  }
  await prisma.obligation.deleteMany({
    where: { id, userId },
  });
  revalidatePath("/obligations");
  revalidatePath("/dashboard");
}

async function quickSetObligationAmount(formData: FormData) {
  "use server";
  const userId = await requireUserId();
  const id = formData.get("id")?.toString();
  const amountRaw = formData.get("amount")?.toString();
  const currency = formData.get("currency")?.toString() || currencyOptions[0];
  if (!id || !amountRaw) {
    throw new Error("Tutar veya kayıt bulunamadı");
  }
  const amount = Number(amountRaw);
  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error("Geçerli ve sıfırdan büyük bir tutar girilmelidir");
  }

  await prisma.obligation.updateMany({
    where: { id, userId },
    data: { amount, currency, isBelli: true },
  });
  revalidatePath("/obligations");
  revalidatePath("/dashboard");
}

export default async function ObligationsPage() {
  const userId = await requireUserId();
  const obligations = await prisma.obligation.findMany({
    where: { userId },
    include: {
      digitalAccount: {
        select: { providerName: true, accountIdentifier: true },
      },
    },
    orderBy: [
      { isDone: "asc" },
      { nextDue: "asc" },
      { createdAt: "desc" },
    ],
  });
  type ObligationRow = (typeof obligations)[number];
  type EnrichedObligation = ObligationRow & { amountNumber: number | null; amountTry: number | null };
  const rates = await getExchangeRates();
  const enrichedObligations: EnrichedObligation[] = obligations.map((obligation: ObligationRow) => {
    const amountValue = obligation.amount !== null ? Number(obligation.amount) : null;
    const amount = amountValue && amountValue > 0 ? amountValue : null;
    return {
      ...obligation,
      amountNumber: amount,
      amountTry: amount ? convertToTry(amount, obligation.currency, rates) : null,
      isBelli: obligation.isBelli,
    };
  });
  const now = new Date();
  const nowMs = now.getTime();
  const upcomingWindowMs = nowMs + 30 * DAY_MS;
  const activeCount = enrichedObligations.filter(
    (obligation: EnrichedObligation) => !obligation.isDone,
  ).length;
  const dueSoonCount = enrichedObligations.filter((obligation: EnrichedObligation) => {
    if (!obligation.nextDue) {
      return false;
    }
    const dueMs = new Date(obligation.nextDue).getTime();
    return dueMs >= nowMs && dueMs <= upcomingWindowMs && !obligation.isDone;
  }).length;
  const yearEndDeadlineMs = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999).getTime();
  const yearEndAmountTry = enrichedObligations.reduce(
    (sum: number, obligation: EnrichedObligation) => {
      if (obligation.isDone || !obligation.amountTry || !obligation.nextDue) {
        return sum;
      }
      const dueMs = new Date(obligation.nextDue).getTime();
      if (dueMs >= nowMs && dueMs <= yearEndDeadlineMs) {
        return sum + obligation.amountTry;
      }
      return sum;
    },
    0,
  );
  const sortedObligations = [...enrichedObligations].sort((a, b) => {
    const aDue = a.nextDue ? new Date(a.nextDue).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.nextDue ? new Date(b.nextDue).getTime() : Number.MAX_SAFE_INTEGER;
    return aDue - bDue;
  });
  const tableObligations = sortedObligations.map((obligation: EnrichedObligation) => ({
    id: obligation.id,
    name: obligation.name,
    category: obligation.category,
    amountNumber: obligation.amountNumber,
    amountTry: obligation.amountTry,
    currency: obligation.currency,
    isBelli: obligation.isBelli,
    isRecurring: obligation.isRecurring,
    recurrenceInterval: obligation.recurrenceInterval,
    recurrenceUnit: obligation.recurrenceUnit,
    nextDue: obligation.nextDue ? obligation.nextDue.toISOString() : null,
    isActive: obligation.isActive,
    isDone: obligation.isDone,
    daysLeft: obligation.nextDue ? Math.ceil((new Date(obligation.nextDue).getTime() - nowMs) / DAY_MS) : null,
    digitalAccountName: obligation.digitalAccount?.providerName ?? null,
    digitalAccountIdentifier: obligation.digitalAccount?.accountIdentifier ?? null,
  }));
  const obligationHighlights = [
    {
      title: "Aktif yükümlülük",
      value: `${activeCount}`,
      hint: "takip edilen kayıt",
    },
    {
      title: "30 günde vade",
      value: `${dueSoonCount}`,
      hint: "yaklaşan yükümlülük",
    },
    {
      title: "Bu yıl kalan ödeme",
      value: formatCurrency(yearEndAmountTry, "TRY"),
      hint: "kesinleşmiş tutar",
    },  ];

  return (
    <div className="space-y-6">
      <IntegrationInfoCard
        title="Yükümlülükler için planlanan entegrasyonlar"
        description="Muhasebe ve abonelik sağlayıcılarından otomatik veri çekerek ödeme planlarını güncel tutma."
        integrations={obligationIntegrations}
      />
      <section className="space-y-4">
        <div className="rounded-3xl border border-rose-400/50 bg-rose-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-rose-200">Yükümlülükler</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Ödemeler ve sorumluluk planı</h2>
          <p className="mt-2 max-w-3xl text-sm text-rose-100/80">
            Tek seferlik ya da tekrar eden görevleri aynı yerden yönet, yaklaşan vadeleri ve toplam yükü
            renkli kartlarla takip et.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {obligationHighlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-200"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-rose-200">{item.title}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              <p className="text-xs text-slate-400">{item.hint}</p>
            </article>
          ))}
        </div>
      </section>

      <ObligationForm
        action={createObligation}
        categories={categories}
        currencies={currencyOptions}
        recurrenceUnits={recurrenceUnits}
      />

      <ObligationsTable
        obligations={tableObligations}
        nowMs={nowMs}
        markObligationDone={markObligationDone}
        deleteObligation={deleteObligation}
        quickSetAmount={quickSetObligationAmount}
        currencies={currencyOptions}
      />
    </div>
  );
}
