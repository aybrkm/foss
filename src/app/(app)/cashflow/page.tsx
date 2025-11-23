import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { convertToTry, getExchangeRates } from "@/lib/exchange";
import { formatCurrency } from "@/lib/format";
import { IncomeForm } from "@/components/cashflow/IncomeForm";
import { IncomeTable } from "@/components/cashflow/IncomeTable";
import { requireUserId } from "@/lib/auth";

const currencyOptions = ["TRY", "USD", "AED", "EUR"] as const;
const incomeCategories = ["maas", "freelance", "yatirim", "kira", "diger"] as const;

async function createIncome(formData: FormData) {
  "use server";
  const userId = await requireUserId();
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

  await prisma.cashflowIncome.create({
    data: {
      title,
      category,
      occurredAt,
      amount,
      currency,
      notes,
      userId,
    },
  });

  revalidatePath("/cashflow");
  revalidatePath("/dashboard");
}

async function deleteIncome(formData: FormData) {
  "use server";
  const userId = await requireUserId();
  const id = formData.get("id")?.toString();
  if (!id) {
    throw new Error("Gelir bulunamadı");
  }
  await prisma.cashflowIncome.deleteMany({
    where: { id, userId },
  });

  revalidatePath("/cashflow");
  revalidatePath("/dashboard");
}

export default async function CashflowPage() {
  const userId = await requireUserId();
  const [incomes, rates] = await Promise.all([
    prisma.cashflowIncome.findMany({
      where: { userId },
      orderBy: { occurredAt: "desc" },
    }),
    getExchangeRates(),
  ]);

  const enriched = incomes.map((income) => {
    const amountNumber = Number(income.amount);
    return {
      ...income,
      amountNumber,
      amountTry: convertToTry(amountNumber, income.currency, rates),
    };
  });

  const now = new Date();
  const nowMs = now.getTime();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime() - 1;
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1).getTime() - 1;

  const incomeByWindow = (predicate: (time: number) => boolean) =>
    enriched
      .filter((income) => predicate(new Date(income.occurredAt).getTime()))
      .reduce((sum, income) => sum + income.amountTry, 0);

  const monthExpected = incomeByWindow((time) => time >= nowMs && time <= endOfMonth);
  const yearToDateRealized = incomeByWindow((time) => time >= startOfYear && time <= nowMs);
  const yearRemainingExpected = incomeByWindow((time) => time > nowMs && time <= endOfYear);

  const highlights = [
    { title: "Bu ay beklenen gelir", value: formatCurrency(monthExpected, "TRY"), hint: "ay sonuna kadar plan" },
    { title: "Yılbaşından bugüne", value: formatCurrency(yearToDateRealized, "TRY"), hint: "gerçekleşen toplam" },
    { title: "Yıl sonuna kadar beklenen", value: formatCurrency(yearRemainingExpected, "TRY"), hint: "planlanan giriş" },
  ];

  const tableRows = enriched.map((income) => ({
    id: income.id,
    title: income.title,
    category: income.category,
    amount: income.amountNumber,
    currency: income.currency,
    occurredAt: income.occurredAt.toISOString(),
    notes: income.notes,
  }));

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="rounded-3xl border border-emerald-400/50 bg-emerald-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">NAKİT AKIŞI</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Gelir akışını yönet</h1>
          <p className="mt-1 text-sm text-emerald-100/80">
            Bu ekranda sadece gelir kalemlerini topluyoruz. Giderler Yükümlülükler sekmesinde otomatik ödemelerle takip ediliyor.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-200"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">{item.title}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              <p className="text-xs text-slate-400">{item.hint}</p>
            </article>
          ))}
        </div>
      </section>

      <IncomeForm
        action={createIncome}
        categories={incomeCategories}
        currencies={currencyOptions}
        submitLabel="Gelir ekle"
      />

      <IncomeTable incomes={tableRows} deleteAction={deleteIncome} />
    </div>
  );
}
