'use client';

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { decryptWithMasterCode, isValidMasterCode } from "@/lib/client-crypto";

type SubscriptionInfo = {
  amount: number;
  currency: string;
  period: string;
  firstDue: string;
  nextDue: string | null;
};

export type DigitalAccountRow = {
  id: string;
  providerName: string;
  accountIdentifier: string;
  loginUrl: string | null;
  category: string | null;
  isPremium: boolean;
  notes: string | null;
  passwordHint: string | null;
  passwordLastChanged: string | null;
  encryptedPassword: string | null;
  subscription: SubscriptionInfo | null;
};

type Props = {
  accounts: DigitalAccountRow[];
  deleteAction: (formData: FormData) => Promise<void> | void;
};

export function DigitalAccountTable({ accounts, deleteAction }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
          <tr>
            <th className="px-5 py-4">Hesap</th>
            <th className="px-5 py-4">Kategori</th>
            <th className="px-5 py-4">Premium</th>
            <th className="px-5 py-4">Otomatik ödeme</th>
            <th className="px-5 py-4">Şifre</th>
            <th className="px-5 py-4 text-right">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {accounts.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                Henüz dijital hesap eklenmedi.
              </td>
            </tr>
          ) : (
            accounts.map((account) => (
              <tr key={account.id} className="hover:bg-white/5 text-white">
                <td className="px-5 py-4">
                  <p className="font-semibold text-white">{account.providerName}</p>
                  <p className="text-xs text-slate-300">{account.accountIdentifier}</p>
                  {account.loginUrl && (
                    <Link
                      href={account.loginUrl}
                      className="text-[11px] text-fuchsia-200 underline decoration-dotted underline-offset-4"
                    >
                      Giriş linki
                    </Link>
                  )}
                  {account.notes && (
                    <p className="text-xs text-slate-400">Not: {account.notes}</p>
                  )}
                </td>
                <td className="px-5 py-4 text-slate-300 capitalize">
                  {account.category ?? "-"}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      account.isPremium
                        ? "bg-fuchsia-500/20 text-fuchsia-100 border border-fuchsia-300/60"
                        : "bg-white/5 text-slate-300 border border-white/10"
                    }`}
                  >
                    {account.isPremium ? "Premium" : "Standart"}
                  </span>
                  {account.passwordLastChanged && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Şifre güncelleme: {formatDate(account.passwordLastChanged)}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4">
                  {account.subscription ? (
                    <div className="space-y-1 text-sm text-white">
                      <p className="font-semibold">
                        {formatCurrency(account.subscription.amount, account.subscription.currency)}
                      </p>
                      <p className="text-xs text-slate-300">{formatPeriod(account.subscription.period)}</p>
                      <p className="text-xs text-slate-400">
                        İlk ödeme: {formatDate(account.subscription.firstDue)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Sıradaki: {account.subscription.nextDue ? formatDate(account.subscription.nextDue) : "—"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Premium değil</p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <PasswordViewer encryptedPassword={account.encryptedPassword} />
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/digital-accounts/${account.id}/edit`}
                      className="inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-1 text-xs text-white transition hover:border-white/60"
                    >
                      Düzenle
                    </Link>
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={account.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full border border-rose-400/40 px-3 py-1 text-xs text-rose-200 transition hover:border-rose-300 hover:text-white"
                      >
                        Sil
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("tr-TR");
}

function formatPeriod(period: string) {
  switch (period) {
    case "monthly":
      return "Aylık";
    case "quarterly":
      return "3 ayda bir";
    case "semiannual":
      return "6 ayda bir";
    case "yearly":
      return "Yıllık";
    case "lifetime":
    default:
      return "Tek sefer";
  }
}

type PasswordProps = {
  encryptedPassword: string | null;
};

function PasswordViewer({ encryptedPassword }: PasswordProps) {
  const [open, setOpen] = useState(false);
  const [masterCode, setMasterCode] = useState("");
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = async () => {
    if (!isValidMasterCode(masterCode)) {
      setError("Master kod 6 haneli olmalı ve art arda 3 aynı rakam içeremez.");
      return;
    }
    setLoading(true);
    setError(null);
    setValue(null);
    try {
      const password = await decryptWithMasterCode(encryptedPassword, masterCode);
      setValue(password);
    } catch (decryptionError) {
      console.error(decryptionError);
      setError("Şifre çözülemedi. Master kodu kontrol et.");
    }
    setLoading(false);
  };

  if (!encryptedPassword) {
    return <p className="text-xs text-slate-500">{hint ? "Şifre şifreli değil" : "Şifre yok"}</p>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-fuchsia-300/40 px-3 py-1 text-xs text-fuchsia-100 transition hover:border-fuchsia-200"
      >
        Şifreyi Göster
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-slate-900/90 p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-sm font-semibold text-white text-left">Master kod ile şifreyi çöz</p>
            <input
              type="text"
              value={masterCode}
              onChange={(event) => setMasterCode(event.target.value.replace(/\\D/g, "").slice(0, 6))}
              placeholder="123456"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
            inputMode="numeric"
            maxLength={6}
          />
            {error && <p className="text-sm text-rose-300">{error}</p>}
            {value && (
              <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm font-mono text-emerald-100">
                {value}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={request}
                disabled={loading || masterCode.length === 0}
                className="flex-1 rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Çözülüyor..." : "Şifreyi çöz"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
