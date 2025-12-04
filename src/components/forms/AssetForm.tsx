"use client";

import { useState } from "react";

type Props = {
  action: (formData: FormData) => void;
  currencies: readonly string[];
};

export function AssetForm({ action, currencies }: Props) {
  const [mode, setMode] = useState<"liquid" | "stable" | "personal_valuable">("liquid");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 text-sm text-white">
        {(["liquid", "stable", "personal_valuable"] as const).map((option) => {
          const label =
            option === "liquid" ? "Likit Varlık" : option === "stable" ? "Sabit Varlık" : "Personal Valuable";
          return (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`rounded-xl px-4 py-2 transition ${
                mode === option ? "bg-indigo-500 text-white" : "bg-transparent text-slate-300"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <AssetFormFields
        key={mode}
        action={action}
        currencies={currencies}
        assetKind={mode}
      />
    </div>
  );
}

type FieldsProps = {
  action: (formData: FormData) => void;
  currencies: readonly string[];
  assetKind: "liquid" | "stable" | "personal_valuable";
};

function AssetFormFields({ action, currencies, assetKind }: FieldsProps) {
  const isLiquid = assetKind === "liquid";
  const isPersonal = assetKind === "personal_valuable";
  return (
    <form
      action={action}
      className="grid gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-3"
    >
      <input type="hidden" name="assetKind" value={assetKind} />
      <input
        name="name"
        placeholder={
          isLiquid ? "Likit varlık adı" : isPersonal ? "Personal valuable adı" : "Sabit varlık adı"
        }
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        required
      />
      <input
        name="assetType"
        placeholder="Tip (ör: Eurobond, Kiralık ev, Personal Valuables)"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        required
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
        type="number"
        name="value"
        min="0"
        step="0.01"
        placeholder="Toplam değer"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        required
      />
      {isLiquid ? (
        <input
          name="notes"
          placeholder="Not (opsiyonel)"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 md:col-span-2"
        />
      ) : (
        <>
          <input
            type="date" min="1000-01-01" max="5000-12-31"
            name="acquisitionDate"
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          />
          <input
            name="notes"
            placeholder={isPersonal ? "Personal valuable notu (opsiyonel)" : "Not (opsiyonel)"}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          />
        </>
      )}
      <button
        type="submit"
        className="rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 md:col-span-1"
      >
        {isLiquid ? "Likit varlık ekle" : isPersonal ? "Personal valuable ekle" : "Sabit varlık ekle"}
      </button>
    </form>
  );
}
