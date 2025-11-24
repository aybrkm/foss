"use client";

import { useState } from "react";

export type ProductType = "personal" | "business" | "both";

export type Integration = {
  region: string;
  items: {
    name: string;
    description: string;
    product: ProductType;
  }[];
};

const productLabel: Record<ProductType, string> = {
  personal: "Floss Personal",
  business: "Floss Business",
  both: "Personal & Business",
};

const productColor: Record<ProductType, string> = {
  personal: "bg-sky-500/30 text-sky-100 border-sky-400/50",
  business: "bg-emerald-500/30 text-emerald-100 border-emerald-400/50",
  both: "bg-indigo-500/30 text-indigo-100 border-indigo-400/50",
};

export function IntegrationInfoCard({
  title,
  description,
  integrations,
}: {
  title: string;
  description: string;
  integrations: Integration[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_10px_40px_rgba(2,6,23,0.4)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Entegrasyon Planı</p>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/50 hover:bg-white/10"
          aria-expanded={open}
        >
          {open ? "Planı gizle" : "Planı göster"}
        </button>
      </div>
      <div
        className={`mt-4 overflow-hidden transition-all duration-500 ease-out ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((integration) => (
            <div key={integration.region} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{integration.region}</p>
              <ul className="mt-3 space-y-2">
                {integration.items.map((item) => (
                  <li key={item.name}>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                    <span
                      className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${productColor[item.product]}`}
                    >
                      {productLabel[item.product]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
