import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SubscriptionPeriod } from "@prisma/client";
import prisma from "@/lib/prisma";
import { DigitalAccountForm } from "@/components/forms/DigitalAccountForm";
import { requireUserId } from "@/lib/auth";
import { removeSubscriptionForAccount, syncSubscriptionForAccount } from "@/lib/digital-accounts";

const categoryOptions = ["email", "cloud", "streaming", "social", "dev_tool", "other"] as const;
const currencyOptions = ["TRY", "USD", "AED", "EUR"] as const;
const periodOptions = [
  { value: "monthly", label: "Aylık" },
  { value: "quarterly", label: "3 aylık" },
  { value: "semiannual", label: "6 aylık" },
  { value: "yearly", label: "Yıllık" },
  { value: "lifetime", label: "Lifetime / tek sefer" },
] as const;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditDigitalAccountPage({ params }: Props) {
  const { id } = await params;
  const userId = await requireUserId();

  const account =
    (await prisma.digitalAccount.findFirst({
      where: { id, userId },
      include: { subscription: true },
    })) ?? notFound();

  const defaultValues = {
    providerName: account.providerName,
    accountIdentifier: account.accountIdentifier,
    loginUrl: account.loginUrl,
    category: account.category,
    isPremium: account.isPremium,
    notes: account.notes,
    passwordHint: account.passwordHint,
    encryptedPassword: account.encryptedPassword,
    subscription: account.subscription
      ? {
          amount: Number(account.subscription.amount),
          currency: account.subscription.currency,
          period: account.subscription.period,
          firstDue: account.subscription.firstDue.toISOString().split("T")[0],
        }
      : null,
  };

  async function updateDigitalAccount(formData: FormData) {
    "use server";
    const userId = await requireUserId();
    const providerName = formData.get("providerName")?.toString().trim();
    const accountIdentifier = formData.get("accountIdentifier")?.toString().trim();
    const category = formData.get("category")?.toString().trim() || null;
    const loginUrl = formData.get("loginUrl")?.toString().trim() || null;
    const passwordHint = formData.get("passwordHint")?.toString().trim() || null;
    const notes = formData.get("notes")?.toString().trim() || null;
    const isPremium = formData.get("isPremium") === "on";
    const encryptedPasswordInput = formData.get("encryptedPassword")?.toString() || null;
    const clearPassword = formData.get("clearPassword") === "on";

    if (!providerName || !accountIdentifier) {
      throw new Error("Eksik dijital hesap bilgisi");
    }

    let encryptedPassword = account.encryptedPassword;
    let resolvedPasswordChanged = account.passwordLastChanged;
    if (clearPassword) {
      encryptedPassword = null;
      resolvedPasswordChanged = null;
    } else if (encryptedPasswordInput) {
      encryptedPassword = encryptedPasswordInput;
      resolvedPasswordChanged = new Date();
    }

    const subscriptionInput = isPremium ? parseSubscription(formData) : null;

    await prisma.digitalAccount.update({
      where: { id: account.id },
      data: {
        providerName,
        accountIdentifier,
        category: category || null,
        loginUrl,
        passwordHint,
        passwordLastChanged: resolvedPasswordChanged,
        notes,
        isPremium,
        encryptedPassword,
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
    } else {
      await removeSubscriptionForAccount(account.id, userId);
    }

    revalidatePath("/digital-accounts");
    revalidatePath("/obligations");
    revalidatePath("/dashboard");
    redirect("/digital-accounts");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-fuchsia-300">Dijital Hesaplar</p>
          <h1 className="text-3xl font-semibold text-white">Hesabı düzenle</h1>
          <p className="text-slate-300">{account.providerName}</p>
        </div>
        <Link
          href="/digital-accounts"
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60"
        >
          &larr; Listeye dön
        </Link>
      </div>

      <DigitalAccountForm
        action={updateDigitalAccount}
        categories={categoryOptions}
        currencies={currencyOptions}
        periods={periodOptions}
        defaultValues={defaultValues}
        submitLabel="Hesabı güncelle"
      />
    </div>
  );
}

function parseSubscription(formData: FormData) {
  const amountRaw = formData.get("subscriptionAmount")?.toString();
  const amount = amountRaw ? Number(amountRaw) : NaN;
  const currency = formData.get("subscriptionCurrency")?.toString() || currencyOptions[0];
  const period = formData.get("subscriptionPeriod")?.toString() as SubscriptionPeriod | undefined;
  const firstDueRaw = formData.get("subscriptionFirstDue")?.toString();
  const firstDue = firstDueRaw ? new Date(firstDueRaw) : null;

  if (!period || !firstDue || Number.isNaN(amount) || amount <= 0) {
    throw new Error("Premium hesap için tutar, periyot ve ilk ödeme tarihi gerekli");
  }

  return { amount, currency, period, firstDue };
}
