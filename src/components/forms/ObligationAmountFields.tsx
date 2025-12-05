"use client";

import { ChangeEvent, FormEvent, KeyboardEvent, useState } from "react";

type Props = {
  currencyOptions: readonly string[];
  defaultAmount?: number | null;
  defaultCurrency?: string | null;
  defaultUnknown?: boolean;
};

export function ObligationAmountFields({
  currencyOptions,
  defaultAmount = null,
  defaultCurrency = null,
  defaultUnknown = false,
}: Props) {
  const [isUnknown, setIsUnknown] = useState(defaultUnknown);
  const [amount, setAmount] = useState(defaultAmount ? defaultAmount.toString() : "");
  const [currency, setCurrency] = useState(defaultCurrency ?? currencyOptions[0]);

  const sanitizeAmount = (value: string) => {
    const normalized = value.replace(",", ".");
    if (normalized === "") return "";
    if (/^\d*\.?\d*$/.test(normalized)) {
      return normalized;
    }
    return amount;
  };

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAmount(sanitizeAmount(event.target.value));
  };

  const handleAmountKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const allowedControlKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Enter",
    ];

    if (allowedControlKeys.includes(event.key)) {
      return;
    }
    if (event.key === "." || event.key === ",") {
      if (amount.includes(".")) {
        event.preventDefault();
      }
      return;
    }
    if (/^[0-9]$/.test(event.key)) {
      return;
    }
    event.preventDefault();
  };

  const handleAmountBeforeInput = (event: FormEvent<HTMLInputElement>) => {
    const native = event.nativeEvent as InputEvent;
    const data = native.data;
    if (!data) return;
    if (!/^[0-9.,]+$/.test(data)) {
      event.preventDefault();
      return;
    }
    const { selectionStart, selectionEnd, value } = event.currentTarget;
    if (selectionStart === null || selectionEnd === null) return;
    const proposed = value.slice(0, selectionStart) + data + value.slice(selectionEnd);
    const normalized = proposed.replace(",", ".");
    if (!/^\d*\.?\d*$/.test(normalized)) {
      event.preventDefault();
    }
  };

  const handleUnknownToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.checked;
    setIsUnknown(next);
    if (next) {
      setAmount("");
    }
  };

  return (
    <div className="md:col-span-2 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[180px]">
        <input
          type="number"
          name="amount"
          min="0"
          step="0.01"
          placeholder="Tutar (tutarsız bir yükümlülük ise boş bırakın ve yandaki kutucuğu işaretlemeyin)"
          value={amount}
          onChange={handleAmountChange}
          onKeyDown={handleAmountKeyDown}
          onBeforeInput={handleAmountBeforeInput}
          disabled={isUnknown}
          inputMode="decimal"
          pattern="\\d*\\.?\\d*"
          className={`w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 ${
            isUnknown ? "opacity-50" : ""
          }`}
        />
        {isUnknown && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-black/70 text-[10px] uppercase tracking-[0.25em] text-slate-200">
            Belirtilmeyecek
          </div>
        )}
      </div>
      <select
        name="currency"
        className={`min-w-[90px] rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white ${
          isUnknown ? "opacity-50" : ""
        }`}
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
        disabled={isUnknown}
      >
        {currencyOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-200 whitespace-nowrap">
        <input
          type="checkbox"
          name="amountUnknown"
          className="size-4 accent-rose-500"
          checked={isUnknown}
          onChange={handleUnknownToggle}
        />
        Tutar hen&uuml;z belli değil
      </label>
    </div>
  );
}
