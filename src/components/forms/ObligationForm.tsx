"use client";

import { useState, FormEvent } from "react";
import { ObligationAmountFields } from "./ObligationAmountFields";

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
  const [isRecurrenceEndless, setIsRecurrenceEndless] = useState(true);
  const [recurrenceCount, setRecurrenceCount] = useState("");
  const [recurrenceUnitValue, setRecurrenceUnitValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const getMaxRecurrenceCount = (unit: string | null) => {
    if (unit === "week") return 52;
    if (unit === "month") return 24;
    return null;
  };
  const maxRecurrenceCount = getMaxRecurrenceCount(recurrenceUnitValue) ?? undefined;

  const showRecurrence = isRecurring;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!showRecurrence) {
      setError(null);
      return;
    }
    const form = event.currentTarget;
    const nextDue = (form.elements.namedItem("nextDue") as HTMLInputElement | null)?.value;
    const recurrenceCountInput = form.elements.namedItem("recurrenceCount") as HTMLInputElement | null;
    const recurrenceCountValue = Number(
      (form.elements.namedItem("recurrenceCount") as HTMLInputElement | null)?.value ?? "",
    );
    const maxAllowed = getMaxRecurrenceCount(recurrenceUnitValue);

    if (!nextDue) {
      event.preventDefault();
      setError("Tekrar eden yükümlülükler için başlangıç tarihi seçmelisin.");
      return;
    }
    if (!isRecurrenceEndless) {
      if (!recurrenceCount || Number.isNaN(recurrenceCountValue) || recurrenceCountValue <= 0) {
        event.preventDefault();
        setError("Tekrar sayısını gir veya 'Sonu yok' seçeneğini işaretle.");
        return;
      }
      if (maxAllowed && recurrenceCountValue > maxAllowed) {
        const clamped = maxAllowed;
        if (recurrenceCountInput) {
          recurrenceCountInput.value = String(clamped);
        }
        setRecurrenceCount(String(clamped));
      }
    }
    setError(null);
  };

  const handleRecurrenceCountChange = (value: string) => {
    if (value === "") {
      setRecurrenceCount("");
      return;
    }
    if (/^\d+$/.test(value)) {
      const numeric = Number(value);
      const maxAllowed = getMaxRecurrenceCount(recurrenceUnitValue);
      if (maxAllowed && numeric > maxAllowed) {
        setRecurrenceCount(String(maxAllowed));
        return;
      }
      setRecurrenceCount(value);
    }
  };

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-2"
    >
      <input
        name="name"
        placeholder="Yükümlülük adı"
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
      <ObligationAmountFields
        currencyOptions={currencies}
      />
      <input
        type="date"
        min="1000-01-01"
        max="5000-12-31"
        name="nextDue"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        required={showRecurrence}
      />
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-300">
        <input
          type="checkbox"
          name="isRecurring"
          className="size-4 accent-rose-500"
          checked={isRecurring}
          onChange={(event) => {
            setIsRecurring(event.target.checked);
            if (!event.target.checked) {
              setIsRecurrenceEndless(true);
              setRecurrenceCount("");
              setRecurrenceUnitValue("");
            }
          }}
        />
        Tekrar eden yükümlülük?
      </label>
      <div className={`md:col-span-2 grid gap-3 md:grid-cols-3 ${showRecurrence ? "" : "hidden"}`}>
        <select
          name="recurrenceUnit"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          defaultValue=""
          disabled={!showRecurrence}
          onChange={(event) => {
            const nextUnit = event.target.value;
            setRecurrenceUnitValue(nextUnit);
            const maxAllowed = getMaxRecurrenceCount(nextUnit);
            if (maxAllowed && recurrenceCount) {
              const numeric = Number(recurrenceCount);
              if (!Number.isNaN(numeric) && numeric > maxAllowed) {
                setRecurrenceCount(String(maxAllowed));
              }
            }
          }}
        >
          <option value="">
            {showRecurrence ? "Birim seç (hafta/ay)" : "Birim (aktif değil)"}
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
          placeholder="Kaç hafta/ayda bir?"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          disabled={!showRecurrence}
        />
        <div className="flex flex-col gap-2">
          <input
            type="number"
            name="recurrenceCount"
            min="1"
            step="1"
            max={showRecurrence ? maxRecurrenceCount : undefined}
            value={recurrenceCount}
            onChange={(event) => handleRecurrenceCountChange(event.target.value)}
            inputMode="numeric"
            pattern="\\d*"
            placeholder="Toplam kaç tekrar?"
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
            disabled={!showRecurrence || isRecurrenceEndless}
          />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              name="recurrenceEndless"
              className="size-4 accent-rose-500"
              checked={isRecurrenceEndless}
              onChange={(event) => {
                const checked = event.target.checked;
                setIsRecurrenceEndless(checked);
                if (checked) {
                  setRecurrenceCount("");
                }
              }}
              disabled={!showRecurrence}
            />
            Sonu yok
          </label>
        </div>
      </div>
      <input
        name="notes"
        placeholder="Not (opsiyonel)"
        className="md:col-span-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
      />
      {error && (
        <p className="md:col-span-2 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="md:col-span-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
      >
        Yükümlülük ekle
      </button>
    </form>
  );
}
