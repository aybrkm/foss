"use client";

import { useRef, useState } from "react";
import { encryptWithMasterCode, isValidMasterCode } from "@/lib/client-crypto";

type SubscriptionDefaults = {
  amount?: number | null;
  currency?: string | null;
  period?: string | null;
  firstDue?: string | null;
};

type DefaultValues = {
  providerName?: string;
  accountIdentifier?: string;
  loginUrl?: string | null;
  category?: string | null;
  isPremium?: boolean;
  notes?: string | null;
  passwordHint?: string | null;
  encryptedPassword?: string | null;
  subscription?: SubscriptionDefaults | null;
};

type Props = {
  action: (formData: FormData) => void;
  categories: readonly string[];
  currencies: readonly string[];
  periods: readonly { value: string; label: string }[];
  defaultValues?: DefaultValues;
  submitLabel: string;
};

export function DigitalAccountForm({
  action,
  categories,
  currencies,
  periods,
  defaultValues,
  submitLabel,
}: Props) {
  const [isPremium, setIsPremium] = useState(defaultValues?.isPremium ?? false);
  const [error, setError] = useState<string | null>(null);
  const hiddenPasswordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (form.dataset.encrypted === "1") {
      form.dataset.encrypted = "";
      return;
    }
    const passwordInput = form.elements.namedItem("password") as HTMLInputElement | null;
    const clearPassword = (form.elements.namedItem("clearPassword") as HTMLInputElement | null)?.checked ?? false;
    const passwordValue = passwordInput?.value?.trim() ?? "";

    if (!passwordValue || clearPassword) {
      form.dataset.encrypted = "1";
      return;
    }

    event.preventDefault();
    const masterCode = window.prompt("Master kodunu gir (6 hane)")?.trim() ?? "";
    if (!isValidMasterCode(masterCode)) {
      setError("Master kod 6 haneli olmalı ve art arda 3 aynı rakam içeremez.");
      return;
    }
    try {
      const encrypted = await encryptWithMasterCode(passwordValue, masterCode);
      if (hiddenPasswordRef.current) {
        hiddenPasswordRef.current.value = encrypted;
      }
      if (passwordInput) {
        passwordInput.value = "";
      }
      setError(null);
      form.dataset.encrypted = "1";
      form.requestSubmit();
    } catch (encryptionError) {
      console.error(encryptionError);
      setError("Şifreleme başarısız oldu. Lütfen tekrar dene.");
    }
  };

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-3"
    >
      <input
        name="providerName"
        defaultValue={defaultValues?.providerName}
        placeholder="Sağlayıcı (ör: Google, Netflix)"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        required
      />
      <input
        name="accountIdentifier"
        defaultValue={defaultValues?.accountIdentifier}
        placeholder="Hesap kimliği (email / kullanıcı adı)"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        required
      />
      <select
        name="category"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        defaultValue={defaultValues?.category ?? ""}
      >
        <option value="">Kategori (opsiyonel)</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <input
        name="loginUrl"
        defaultValue={defaultValues?.loginUrl ?? ""}
        placeholder="Giriş URL'si (opsiyonel)"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
      />
      <input
        name="passwordHint"
        defaultValue={defaultValues?.passwordHint ?? ""}
        placeholder="Şifre ipucu (opsiyonel)"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
      />

      <div className="md:col-span-2 space-y-2">
        <input
          type="password"
          name="password"
          placeholder="Şifre"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        />
        {(defaultValues?.encryptedPassword || defaultValues?.passwordHint) && (
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              name="clearPassword"
              className="size-4 accent-fuchsia-500"
            />
            Kaydedilmiş şifreyi temizle
          </label>
        )}
        <input ref={hiddenPasswordRef} type="hidden" name="encryptedPassword" />
      </div>

      <textarea
        name="notes"
        defaultValue={defaultValues?.notes ?? ""}
        placeholder="Not (opsiyonel)"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 md:col-span-1 md:row-span-2"
        rows={4}
      />

      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-200">
        <input
          type="checkbox"
          name="isPremium"
          className="size-4 accent-fuchsia-500"
          checked={isPremium}
          onChange={(event) => setIsPremium(event.target.checked)}
        />
        Premium / abonelik var mı?
      </label>

      <div className={`md:col-span-3 grid gap-3 md:grid-cols-4 ${isPremium ? "" : "hidden"}`}>
        <input
          type="number"
          name="subscriptionAmount"
          min="0"
          step="0.01"
          defaultValue={defaultValues?.subscription?.amount ?? ""}
          placeholder="Abonelik tutarı"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          required={isPremium}
        />
        <select
          name="subscriptionCurrency"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          defaultValue={defaultValues?.subscription?.currency ?? currencies[0]}
        >
          {currencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <select
          name="subscriptionPeriod"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          defaultValue={defaultValues?.subscription?.period ?? ""}
          required={isPremium}
        >
          <option value="">Periyot seç</option>
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          min="1000-01-01"
          max="5000-12-31"
          name="subscriptionFirstDue"
          defaultValue={defaultValues?.subscription?.firstDue ?? ""}
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          required={isPremium}
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-fuchsia-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-400 md:col-span-3"
      >
        {submitLabel}
      </button>
      {error && (
        <p className="md:col-span-3 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}
    </form>
  );
}
