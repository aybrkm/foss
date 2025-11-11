import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { computeNextDue } from "@/lib/recurrence";
import { ObligationForm } from "@/components/forms/ObligationForm";

const categories = ["payment", "legal", "other"] as const;
const recurrenceUnits = ["week", "month"] as const;
const currencyOptions = ["TRY", "USD", "AED", "EUR"] as const;

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
  const baseDate = nextDueRaw ? new Date(nextDueRaw) : null;

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

export default async function ObligationsPage() {
  const obligations = await prisma.obligation.findMany({
    orderBy: [
      { nextDue: "asc" },
      { createdAt: "desc" },
    ],
  });
  type ObligationRow = (typeof obligations)[number];

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.4em] text-rose-300">Obligations</p>
        <h2 className="text-3xl font-semibold text-white">Odemeler + yasal sorumluluklar</h2>
        <p className="max-w-2xl text-slate-300">
          obligations tablosu: category, amount, currency, next_due_date, end_date, is_active, notes +
          tekrar interval/birim alanlari.
        </p>
      </header>

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
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {obligations.map((obligation: ObligationRow) => (
              <tr key={obligation.id} className="hover:bg-white/5">
                <td className="px-5 py-4">
                  <p className="font-semibold text-white">{obligation.name}</p>
                  <p className="text-xs text-slate-400">
                    {obligation.isActive ? "Aktif" : "Pasif"}
                  </p>
                </td>
                <td className="px-5 py-4 capitalize text-slate-300">{obligation.category}</td>
                <td className="px-5 py-4 text-slate-300">{formatRecurrence(obligation)}</td>
                <td className="px-5 py-4 text-right font-semibold text-white">
                  {obligation.amount
                    ? formatCurrency(Number(obligation.amount), obligation.currency ?? "TRY")
                    : "-"}
                </td>
                <td className="px-5 py-4 text-right text-slate-400">
                  {obligation.nextDue ? new Date(obligation.nextDue).toLocaleDateString("tr-TR") : ""}
                </td>
              </tr>
            ))}
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

