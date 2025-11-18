import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { computeNextDue } from "@/lib/recurrence";

const DAY_MS = 24 * 60 * 60 * 1000;

const adjustDateInput = (value?: string | null) => {
  if (!value) {
    return null;
  }
  return new Date(value);
};

const categories = ["payment", "legal", "other"] as const;
const recurrenceUnits = ["week", "month"] as const;
const currencyOptions = ["TRY", "USD", "AED", "EUR"] as const;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditObligationPage({ params }: Props) {
  const { id } = await params;
  const obligation =
    (await prisma.obligation.findUnique({
      where: { id },
    })) ?? notFound();

  const nextDueValue = obligation.nextDue ? obligation.nextDue.toISOString().split("T")[0] : "";

  async function updateObligation(formData: FormData) {
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
        throw new Error("Tekrar eden yükümlülükte aralık ve birim gerekli");
      }
      if (!baseDate) {
        throw new Error("Tekrar eden yükümlülüklerde başlangıç tarihi gerekli");
      }
    }

    const nextDue = computeNextDue({
      baseDate,
      recurrenceUnit: requiresInterval ? recurrenceUnit ?? null : null,
      recurrenceInterval: requiresInterval ? recurrenceInterval ?? null : null,
    });

    await prisma.obligation.update({
      where: { id: obligation.id },
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
        notes,
      },
    });

    revalidatePath("/obligations");
    revalidatePath("/dashboard");
    redirect("/obligations");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-rose-300">Obligations</p>
          <h1 className="text-3xl font-semibold text-white">Yükümlülüğü düzenle</h1>
          <p className="text-slate-300">{obligation.name}</p>
        </div>
        <Link
          href="/obligations"
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60"
        >
          &larr; Listeye dön
        </Link>
      </div>

      <form
        action={updateObligation}
        className="grid gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-3"
      >
        <input
          name="name"
          defaultValue={obligation.name}
          placeholder="Yükümlülük adı"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          required
        />
        <select
          name="category"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          defaultValue={obligation.category}
          required
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="amount"
          min="0"
          step="0.01"
          defaultValue={obligation.amount ? obligation.amount.toString() : ""}
          placeholder="Tutar"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        />
        <select
          name="currency"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          defaultValue={obligation.currency ?? currencyOptions[0]}
        >
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <input
          type="date" min="1000-01-01" max="5000-12-31"
          name="nextDue"
          defaultValue={nextDueValue}
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        />
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-200">
          <input type="checkbox" name="isRecurring" defaultChecked={obligation.isRecurring} />
          Tekrar eden
        </label>
        <select
          name="recurrenceUnit"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          defaultValue={obligation.recurrenceUnit ?? ""}
        >
          <option value="">Birim yok</option>
          {recurrenceUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="recurrenceInterval"
          min="1"
          step="1"
          defaultValue={obligation.recurrenceInterval ?? ""}
          placeholder="Aralık"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        />
        <textarea
          name="notes"
          defaultValue={obligation.notes ?? ""}
          placeholder="Not (opsiyonel)"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 md:col-span-3"
          rows={4}
        />
        <button
          type="submit"
          className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 md:col-span-3"
        >
          Yükümlülüğü güncelle
        </button>
      </form>
    </div>
  );
}
