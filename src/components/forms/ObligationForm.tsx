"use client";

import { useState } from "react";

type Props = {
  action: (formData: FormData) => void;
  categories: readonly string[];
  currencies: readonly string[];
  recurrenceUnits: readonly string[];
};

export function ObligationForm({
  action,
  categories,
  currencies,
  recurrenceUnits,
}: Props) {
  const [isRecurring, setIsRecurring] = useState(false);

  const showRecurrence = isRecurring;

  return (
    <form
      action={action}
      className="grid gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-3"
    >
      <input
        name="name"
        placeholder="Yukumluluk adi"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        required
      />
      <select
        name="category"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        defaultValue=""
        required
      >
        <option value="" disabled>
          Kategori
        </option>
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
        step="100"
        placeholder="Tutar (opsiyonel)"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
      />
      <select
        name="currency"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        defaultValue={currencies[0]}
      >
        {currencies.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
      <input
        type="date"
        name="nextDue"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
      />
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300">
        <input
          type="checkbox"
          name="isRecurring"
          className="size-4 accent-rose-500"
          checked={isRecurring}
          onChange={(event) => setIsRecurring(event.target.checked)}
        />
        Tekrar eden yukumluluk?
      </label>
      <div className={`md:col-span-3 grid gap-3 md:grid-cols-2 ${showRecurrence ? "" : "hidden"}`}>
        <select
          name="recurrenceUnit"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          defaultValue=""
          disabled={!showRecurrence}
        >
          <option value="">
            {showRecurrence ? "Birim sec (hafta/ay)" : "Birim (aktif degil)"}
          </option>
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
          placeholder="Kac hafta/ayda bir?"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          disabled={!showRecurrence}
        />
      </div>
      <input
        name="notes"
        placeholder="Not (opsiyonel)"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 md:col-span-2"
      />
      <button
        type="submit"
        className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 md:col-span-1"
      >
        Yukumluluk ekle
      </button>
    </form>
  );
}
