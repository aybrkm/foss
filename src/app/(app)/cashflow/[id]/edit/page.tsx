import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { IncomeForm } from "@/components/cashflow/IncomeForm";
import { requireUserId } from "@/lib/auth";

const currencyOptions = ["TRY", "USD", "AED", "EUR"] as const;
const incomeCategories = ["maas", "freelance", "yatirim", "kira", "diger"] as const;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditIncomePage({ params }: Props) {
  const { id } = await params;
  const userId = await requireUserId();

  const income =
    (await prisma.cashflowIncome.findFirst({
      where: { id, userId },
    })) ?? notFound();

  const defaultValues = {
    title: income.title,
    category: income.category,
    amount: Number(income.amount),
    currency: income.currency,
    occurredAt: income.occurredAt.toISOString().split("T")[0],
    notes: income.notes,
  };

  async function updateIncome(formData: FormData) {
    "use server";
    const userId = await requireUserId();
    if (income.userId !== userId) {
      throw new Error("Bu kaydı güncelleme yetkin yok");
    }
    const title = formData.get("title")?.toString().trim();
    const category = formData.get("category")?.toString().trim();
    const occurredAtRaw = formData.get("occurredAt")?.toString();
    const amountRaw = formData.get("amount")?.toString();
    const currency = formData.get("currency")?.toString() || currencyOptions[0];
    const notes = formData.get("notes")?.toString().trim() || null;

    const amount = amountRaw ? Number(amountRaw) : NaN;
    const occurredAt = occurredAtRaw ? new Date(occurredAtRaw) : null;

    if (!title || !category || !occurredAt || Number.isNaN(amount) || amount <= 0) {
      throw new Error("Gelir için başlık, kategori, tarih ve tutar gerekli");
    }

    await prisma.cashflowIncome.updateMany({
      where: { id: income.id, userId },
      data: {
        title,
        category,
        occurredAt,
        amount,
        currency,
        notes,
      },
    });

    revalidatePath("/cashflow");
    revalidatePath("/dashboard");
    redirect("/cashflow");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">Nakit Akışı</p>
          <h1 className="text-3xl font-semibold text-white">Geliri düzenle</h1>
          <p className="text-slate-300">{income.title}</p>
        </div>
        <Link
          href="/cashflow"
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60"
        >
          &larr; Listeye dön
        </Link>
      </div>

      <IncomeForm
        action={updateIncome}
        categories={incomeCategories}
        currencies={currencyOptions}
        defaultValues={defaultValues}
        submitLabel="Geliri güncelle"
      />
    </div>
  );
}
