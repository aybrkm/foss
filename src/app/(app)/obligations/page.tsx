import Link from "next/link";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { convertToTry, getExchangeRates } from "@/lib/exchange";
import { formatCurrency } from "@/lib/format";
import { computeNextDue } from "@/lib/recurrence";
import { ObligationForm } from "@/components/forms/ObligationForm";
import { ConfirmDoneButton } from "@/components/forms/ConfirmDoneButton";

const categories = ["payment", "legal", "other"] as const;
const recurrenceUnits = ["week", "month"] as const;
const currencyOptions = ["TRY", "USD", "AED", "EUR"] as const;
const DAY_MS = 24 * 60 * 60 * 1000;

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
}) {
  if (!obligation.recurrenceInterval || !obligation.recurrenceUnit) {
    return null;
  }
  const base = obligation.nextDue ? new Date(obligation.nextDue) : new Date();
  const next = new Date(base);
  if (obligation.recurrenceUnit === "week") {
    next.setDate(next.getDate() + 7 * obligation.recurrenceInterval);
    return next;
  }
  const originalDay = next.getDate();
  next.setMonth(next.getMonth() + obligation.recurrenceInterval, 1);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(originalDay, lastDay));
  return next;
}

async function createObligation(formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString().trim();
  const category = formData.get("category")?.toString() as (typeof categories)[number] | undefined;
  const amountRaw = formData.get("amount")?.toString();
  const currency = formData.get("currency")?.toString() || currencyOptions[0];
  const nextDueRaw = formData.get("nextDue")?.toString();
  const notes = formData.get("notes")?.toString().trim() || null;
  const isRecurring = formData.get("isRecurring") === "on";
  const recurrenceUnit = formData.get("recurrenceUnit")?.toString() as
    | (typeof recurrenceUnits)[number]
    | undefined;
  const recurrenceIntervalRaw = formData.get("recurrenceInterval")?.toString();
  const recurrenceInterval =
    recurrenceIntervalRaw && recurrenceIntervalRaw.length > 0
      ? Number(recurrenceIntervalRaw)
      : null;
  const baseDate = adjustDateInput(nextDueRaw);

  if (!name || !category) {
    throw new Error("Eksik yukumluluk bilgisi");
  }

  const requiresInterval = isRecurring;
  if (requiresInterval) {
    if (
      !recurrenceUnit ||
      !recurrenceInterval ||
      Number.isNaN(recurrenceInterval) ||
      recurrenceInterval <= 0
    ) {
      throw new Error("Tekrar eden yukumluluk icin aralik ve birim belirtmelisin");
    }
    if (!baseDate) {
      throw new Error("Tekrar eden yukumluluklerde bir baslangic tarihi girilmelidir");
    }
  }

  const nextDue = computeNextDue({
    baseDate,
    recurrenceUnit: requiresInterval ? recurrenceUnit ?? null : null,
    recurrenceInterval: requiresInterval ? recurrenceInterval ?? null : null,
  });

  await prisma.obligation.create({
    data: {
      name,
      category,
      frequency: "custom",
      amount: amountRaw ? Number(amountRaw) : null,
      currency: amountRaw ? currency : null,
      nextDue,
      isRecurring: requiresInterval,
      recurrenceUnit: requiresInterval ? recurrenceUnit : null,
      recurrenceInterval: requiresInterval ? recurrenceInterval : null,
      isActive: true,
      notes,
    },
  });

  revalidatePath("/obligations");
  revalidatePath("/dashboard");
}

async function markObligationDone(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) {
    throw new Error("Yükümlülük bulunamadı");
  }
  const obligation = await prisma.obligation.findUnique({
    where: { id },
  });
  if (!obligation) {
    throw new Error("Yükümlülük bulunamadı");
  }

  const shouldClone =
    obligation.isRecurring &&
    obligation.recurrenceInterval &&
    obligation.recurrenceUnit &&
    !obligation.isDone;

  if (shouldClone) {
    const nextDue = calculateNextRecurringDate(obligation);
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
          recurrenceInterval: obligation.recurrenceInterval,
          recurrenceUnit: obligation.recurrenceUnit,
          nextDue,
          notes: obligation.notes,
          isActive: obligation.isActive,
          userId: obligation.userId,
        },
      }),
    ]);
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
  const id = formData.get("id")?.toString();
  if (!id) {
    throw new Error("Yükümlülük bulunamadı");
  }
  await prisma.obligation.delete({
    where: { id },
  });
  revalidatePath("/obligations");
  revalidatePath("/dashboard");
}

export default async function ObligationsPage() {
  const obligations = await prisma.obligation.findMany({
    orderBy: [
      { isDone: "asc" },
      { nextDue: "asc" },
      { createdAt: "desc" },
    ],
  });
  type ObligationRow = (typeof obligations)[number];
  const rates = await getExchangeRates();
  const enrichedObligations = obligations.map((obligation: ObligationRow) => {
    const amount = obligation.amount ? Number(obligation.amount) : null;
    return {
      ...obligation,
      amountNumber: amount,
      amountTry: amount ? convertToTry(amount, obligation.currency, rates) : null,
    };
  });
  const nowMs = Date.now();
  const upcomingWindowMs = nowMs + 30 * DAY_MS;
  const activeCount = enrichedObligations.filter((obligation) => !obligation.isDone).length;
  const dueSoonCount = enrichedObligations.filter((obligation) => {
    if (!obligation.nextDue) {
      return false;
    }
    const dueMs = new Date(obligation.nextDue).getTime();
    return dueMs >= nowMs && dueMs <= upcomingWindowMs && !obligation.isDone;
  }).length;
  const yearEndDeadlineMs = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999).getTime();
  const yearEndAmountTry = enrichedObligations.reduce((sum, obligation) => {
    if (obligation.isDone || !obligation.amountTry || !obligation.nextDue) {
      return sum;
    }
    const dueMs = new Date(obligation.nextDue).getTime();
    if (dueMs >= nowMs && dueMs <= yearEndDeadlineMs) {
      return sum + obligation.amountTry;
    }
    return sum;
  }, 0);
  const sortedObligations = [...enrichedObligations].sort((a, b) => {
    const aDue = a.nextDue ? new Date(a.nextDue).getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.nextDue ? new Date(b.nextDue).getTime() : Number.MAX_SAFE_INTEGER;
    return aDue - bDue;
  });
  const obligationHighlights = [
    {
      title: "Aktif yükümlülük",
      value: `${activeCount}`,
      hint: "takip edilen kayıt",
    },
    {
      title: "30 günde vade",
      value: `${dueSoonCount}`,
      hint: "yaklaşan ödeme",
    },
    {
      title: "Bu yıl kalan ödeme",
      value: formatCurrency(yearEndAmountTry, "TRY"),
      hint: "kesinleşmiş tutar",
    },  ];

  return (
    <div className="space-y-6">
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

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-5 py-4">Yukumluluk</th>
              <th className="px-5 py-4">Kategori</th>
              <th className="px-5 py-4">Tekrar</th>
              <th className="px-5 py-4 text-right">Tutar</th>
              <th className="px-5 py-4 text-right">Next Due</th>
              <th className="px-5 py-4 text-right">Düzenle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedObligations.map((obligation: ObligationRow & { amountNumber: number | null; amountTry: number | null }) => {
              const textClass = obligation.isDone ? "text-xs line-through" : "";
              const statusColor = obligation.isDone ? "text-slate-500" : "text-white";
              let isOverdue = false;
              if (obligation.nextDue) {
                isOverdue = new Date(obligation.nextDue).getTime() < nowMs && !obligation.isDone;
              }
              return (
                <tr
                  key={obligation.id}
                  className={`hover:bg-white/5 ${isOverdue ? "bg-rose-950/40" : ""} ${
                    obligation.isDone ? "text-slate-500" : "text-white"
                  }`}
                >
                  <td className="px-5 py-4">
                    <p className={`font-semibold ${statusColor} ${textClass}`}>{obligation.name}</p>
                    <p className={`text-xs ${obligation.isDone ? "text-slate-500 line-through" : "text-slate-400"}`}>
                      {obligation.isActive ? "Aktif" : "Pasif"}
                    </p>
                  </td>
                  <td className={`px-5 py-4 capitalize text-slate-300 ${textClass}`}>
                    {obligation.category}
                  </td>
                  <td className={`px-5 py-4 text-slate-300 ${textClass}`}>{formatRecurrence(obligation)}</td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {obligation.amountNumber
                      ? (
                        <>
                          <span className={`${statusColor} ${textClass}`}>
                            {formatCurrency(obligation.amountNumber, obligation.currency ?? "TRY")}
                          </span>
                          <span className="block text-xs font-normal text-slate-400">
                            ≈ {formatCurrency(obligation.amountTry ?? 0, "TRY")}
                          </span>
                        </>
                      )
                      : "-"}
                </td>
                  <td className={`px-5 py-4 text-right ${textClass || "text-slate-400"}`}>
                    {obligation.nextDue ? new Date(obligation.nextDue).toLocaleDateString("tr-TR") : ""}
                  </td>
                  <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                    {!obligation.isDone && (
                      <Link
                        href={`/obligations/${obligation.id}/edit`}
                        className="inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-1 text-xs text-white transition hover:border-white/60"
                        aria-label="Yükümlülüğü düzenle"
                      >
                        ✏️
                      </Link>
                    )}
                    {!obligation.isDone && (
                      <ConfirmDoneButton
                        action={markObligationDone}
                        id={obligation.id}
                        description="Tamamlandı olarak işaretlenen yeniden geri alınamaz."
                      />
                    )}
                    <form action={deleteObligation}>
                      <input type="hidden" name="id" value={obligation.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full border border-rose-400/40 px-3 py-1 text-xs text-rose-200 transition hover:border-rose-300 hover:text-white"
                      >
                        ✕
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatRecurrence(obligation: {
  isRecurring: boolean;
  recurrenceInterval: number | null;
  recurrenceUnit: string | null;
}) {
  if (!obligation.isRecurring || !obligation.recurrenceInterval || !obligation.recurrenceUnit) {
    return "Tek sefer";
  }
  const unitLabel = obligation.recurrenceUnit === "week" ? "hafta" : "ay";
  return `${obligation.recurrenceInterval} ${unitLabel}`;
}
