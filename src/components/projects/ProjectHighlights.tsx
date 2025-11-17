"use client";

type Highlight = {
  label: string;
  value: string;
  hint: string;
  accent?: "fuchsia" | "emerald" | "amber" | "sky";
};

const accentClassMap: Record<NonNullable<Highlight["accent"]>, string> = {
  fuchsia: "text-fuchsia-200",
  emerald: "text-emerald-200",
  amber: "text-amber-200",
  sky: "text-sky-200",
};

export function ProjectHighlights({ items }: { items: Highlight[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-200"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{item.label}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
          <p
            className={`text-xs ${
              item.accent ? accentClassMap[item.accent] : "text-slate-400"
            }`}
          >
            {item.hint}
          </p>
        </article>
      ))}
    </section>
  );
}
