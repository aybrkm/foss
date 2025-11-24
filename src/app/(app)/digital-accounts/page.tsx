import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getExchangeRates, convertToTry } from "@/lib/exchange";
import { formatCurrency } from "@/lib/format";
import { requireUserId } from "@/lib/auth";
import { DigitalAccountForm } from "@/components/forms/DigitalAccountForm";
import { DigitalAccountTable } from "@/components/digital-accounts/DigitalAccountTable";
import { MasterKeyGate } from "@/components/digital-accounts/MasterKeyGate";
import { syncSubscriptionForAccount } from "@/lib/digital-accounts";
import type { SubscriptionPeriod, DigitalAccountCategory } from "@prisma/client";

const categoryOptions = ["email", "cloud", "streaming", "social", "dev_tool", "other"] as const;
const currencyOptions = ["TRY", "USD", "AED", "EUR"] as const;
const periodOptions = [
  { value: "monthly", label: "Aylık" },
  { value: "quarterly", label: "3 aylık" },
  { value: "semiannual", label: "6 aylık" },
  { value: "yearly", label: "Yıllık" },
  { value: "lifetime", label: "Lifetime / tek sefer" },
] as const;

const adjustDateInput = (value?: string | null) => {
  if (!value) {
    return null;
  }
  return new Date(value);
};

async function createDigitalAccount(formData: FormData) {
  "use server";
  const userId = await requireUserId();
  const providerName = formData.get("providerName")?.toString().trim();
  const accountIdentifier = formData.get("accountIdentifier")?.toString().trim();
  const category = formData.get("category")?.toString().trim() || null;
  const loginUrl = formData.get("loginUrl")?.toString().trim() || null;
  const passwordHint = formData.get("passwordHint")?.toString().trim() || null;
  const notes = formData.get("notes")?.toString().trim() || null;
  const isPremium = formData.get("isPremium") === "on";
  const encryptedPassword = formData.get("encryptedPassword")?.toString() || null;

  if (!providerName || !accountIdentifier) {
    throw new Error("Eksik dijital hesap bilgisi");
  }

  const subscriptionInput = isPremium ? parseSubscription(formData) : null;
  const resolvedPasswordChanged = encryptedPassword ? new Date() : null;

  const account = await prisma.digitalAccount.create({
    data: {
      providerName,
      accountIdentifier,
      category: category ? (category as DigitalAccountCategory) : null,
      loginUrl,
      passwordHint,
      passwordLastChanged: resolvedPasswordChanged,
      notes,
      isPremium,
      encryptedPassword,
      userId,
    },
  });

  if (subscriptionInput) {
    await syncSubscriptionForAccount({
      accountId: account.id,
      userId,
      providerName,
      accountIdentifier,
      amount: subscriptionInput.amount,
      currency: subscriptionInput.currency,
      period: subscriptionInput.period,
      firstDue: subscriptionInput.firstDue,
      notes,
    });
  }

  revalidatePath("/digital-accounts");
  revalidatePath("/obligations");
  revalidatePath("/dashboard");
}

async function deleteDigitalAccount(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  const userId = await requireUserId();
  if (!id) {
    throw new Error("Hesap bulunamadı");
  }

  const account = await prisma.digitalAccount.findFirst({ where: { id, userId } });
  if (!account) {
    throw new Error("Bu hesaba erişim yok");
  }

  await prisma.$transaction([
    prisma.obligation.deleteMany({ where: { digitalAccountId: id, userId } }),
    prisma.digitalSubscription.deleteMany({ where: { digitalAccountId: id, userId } }),
    prisma.digitalAccount.delete({ where: { id } }),
  ]);

  revalidatePath("/digital-accounts");
  revalidatePath("/obligations");
  revalidatePath("/dashboard");
}

export default async function DigitalAccountsPage() {
  const userId = await requireUserId();

  const [user, accounts, rates] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { masterKeyHash: true },
    }),
    prisma.digitalAccount.findMany({
      where: { userId },
      include: {
        subscription: true,
        obligations: {
          where: { isDone: false },
          orderBy: { nextDue: "asc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    getExchangeRates(),
  ]);

  const mappedAccounts = accounts.map((account) => {
    const nextObligation = account.obligations[0] ?? null;
    const subscription =
      account.subscription && {
        amount: Number(account.subscription.amount),
        currency: account.subscription.currency,
        period: account.subscription.period,
        firstDue: account.subscription.firstDue.toISOString(),
        nextDue: nextObligation?.nextDue?.toISOString() ?? account.subscription.firstDue.toISOString(),
      };

    return {
      id: account.id,
      providerName: account.providerName,
      accountIdentifier: account.accountIdentifier,
      loginUrl: account.loginUrl,
      category: account.category,
      isPremium: account.isPremium,
      notes: account.notes,
      passwordHint: account.passwordHint,
      passwordLastChanged: account.passwordLastChanged?.toISOString() ?? null,
      encryptedPassword: account.encryptedPassword,
      subscription,
    };
  });

  const subscriptionItems = mappedAccounts.filter((account) => account.subscription);

  const monthlyTotalTry = subscriptionItems.reduce((sum, account) => {
    const sub = account.subscription;
    if (!sub) return sum;
    const monthly = normalizeToMonthlyTry(sub.amount, sub.currency, sub.period, rates);
    return sum + monthly;
  }, 0);

  const subscriptionsCount = subscriptionItems.length;
  const monthlyAverageTry =
    subscriptionsCount > 0 ? monthlyTotalTry / subscriptionsCount : 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime() - 1;
  const monthlyDueTry = subscriptionItems.reduce((sum, account) => {
    const sub = account.subscription;
    if (!sub?.nextDue) return sum;
    const dueTime = new Date(sub.nextDue).getTime();
    if (dueTime >= startOfMonth && dueTime <= endOfMonth) {
      return sum + convertToTry(sub.amount, sub.currency, rates);
    }
    return sum;
  }, 0);

  const annualProjectionTry = monthlyTotalTry * 12;

  const highlights = [
    { title: "Toplam hesap", value: `${mappedAccounts.length}`, hint: "dijital profil" },
    { title: "Normalize aylık gider", value: formatCurrency(monthlyAverageTry, "TRY"), hint: "aboneliklerin aylık eşdeğeri" },
    { title: "Bu ay kalan ödeme", value: formatCurrency(monthlyDueTry, "TRY"), hint: "abonelik vade toplamı" },
    { title: "Yıllık projeksiyon", value: formatCurrency(annualProjectionTry, "TRY"), hint: "aboneliklerin yıllık karşılığı" },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="rounded-3xl border border-fuchsia-400/50 bg-fuchsia-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-fuchsia-200">Dijital Hesaplar</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Abonelik ve giriş bilgilerini topla</h1>
          <p className="mt-2 max-w-4xl text-sm text-fuchsia-100/80">
            Hesap kimliklerini, premium durumunu ve şifrelerini tek panelde şifreli şekilde tut. Premium hesaplar için otomatik ödeme yükümlülüğü oluşur, kapatıldığında temizlik yapılır.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-200"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">{item.title}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              <p className="text-xs text-slate-400">{item.hint}</p>
            </article>
          ))}
        </div>
      </section>

      <DigitalAccountForm
        action={createDigitalAccount}
        categories={categoryOptions}
        currencies={currencyOptions}
        periods={periodOptions}
        submitLabel="Dijital hesap ekle"
      />

      <DigitalAccountTable accounts={mappedAccounts} deleteAction={deleteDigitalAccount} />

      <MasterKeyGate hasMasterKey={Boolean(user?.masterKeyHash)} />
    </div>
  );
}

function parseSubscription(formData: FormData) {
  const amountRaw = formData.get("subscriptionAmount")?.toString();
  const amount = amountRaw ? Number(amountRaw) : NaN;
  const currency = formData.get("subscriptionCurrency")?.toString() || currencyOptions[0];
  const period = formData.get("subscriptionPeriod")?.toString() as SubscriptionPeriod | undefined;
  const firstDueRaw = formData.get("subscriptionFirstDue")?.toString();
  const firstDue = adjustDateInput(firstDueRaw);

  if (!period || !firstDue || Number.isNaN(amount) || amount <= 0) {
    throw new Error("Premium hesap için tutar, periyot ve ilk ödeme tarihi gerekli");
  }

  return { amount, currency, period, firstDue };
}

function normalizeToMonthlyTry(
  amount: number,
  currency: string,
  period: SubscriptionPeriod,
  rates: Awaited<ReturnType<typeof getExchangeRates>>,
) {
  const amountTry = convertToTry(amount, currency, rates);
  switch (period) {
    case "monthly":
      return amountTry;
    case "quarterly":
      return amountTry / 3;
    case "semiannual":
      return amountTry / 6;
    case "yearly":
      return amountTry / 12;
    case "lifetime":
    default:
      return amountTry / 120; // 10 yıla yayarak aylık ortalama
  }
}
