"use client";

type IncomeDefaults = {
  title?: string;
  category?: string;
  amount?: number;
  currency?: string;
  occurredAt?: string;
  notes?: string | null;
};

type Props = {
  action: (formData: FormData) => void;
  categories: readonly string[];
  currencies: readonly string[];
  categoryLabels: Record<string, string>;
  defaultValues?: IncomeDefaults;
  submitLabel: string;
};

export function IncomeForm({
  action,
  categories,
  currencies,
  categoryLabels,
  defaultValues,
  submitLabel,
}: Props) {
  return (
    <form
      action={action}
      className="grid gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-3"
    >
      <input
        name="title"
        defaultValue={defaultValues?.title ?? ""}
        placeholder="Başlık (ör: Maaş, Freelance)"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        required
      />
      <select
        name="category"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        defaultValue={defaultValues?.category ?? ""}
        required
      >
        <option value="" disabled>
          Kategori
        </option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {categoryLabels[category] ?? category}
          </option>
        ))}
      </select>
      <input
        type="date"
        min="1000-01-01"
        max="5000-12-31"
        name="occurredAt"
        defaultValue={defaultValues?.occurredAt ?? ""}
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        required
      />
      <input
        type="number"
        name="amount"
        min="0"
        step="0.01"
        defaultValue={defaultValues?.amount ?? ""}
        placeholder="Tutar"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        required
      />
      <select
        name="currency"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        defaultValue={defaultValues?.currency ?? currencies[0]}
      >
        {currencies.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
      <input
        name="notes"
        defaultValue={defaultValues?.notes ?? ""}
        placeholder="Not (opsiyonel)"
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 md:col-span-2"
      />
      <button
        type="submit"
        className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 md:col-span-1"
      >
        {submitLabel}
      </button>
    </form>
  );
}
