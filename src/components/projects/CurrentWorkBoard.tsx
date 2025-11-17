"use client";

import { useMemo } from "react";
import type { CurrentWorkItem } from "./types";

const statusLabels: Record<CurrentWorkItem["status"], string> = {
  planned: "Plan",
  "in-progress": "Yapiliyor",
  review: "Kontrol",
  blocked: "Blok",
  done: "Bitti",
};

const statusColors: Record<CurrentWorkItem["status"], string> = {
  planned: "border-sky-400/40 bg-sky-500/10 text-sky-100",
  "in-progress": "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
  review: "border-indigo-400/40 bg-indigo-500/10 text-indigo-100",
  blocked: "border-rose-400/40 bg-rose-500/10 text-rose-100",
  done: "border-slate-600/60 bg-slate-800/70 text-slate-200",
};

const priorityLabels: Record<CurrentWorkItem["priority"], string> = {
  low: "Sakin",
  medium: "Orta",
  high: "Onemli",
  asap: "ACIL",
};

const priorityStyles: Record<CurrentWorkItem["priority"], string> = {
  low: "text-slate-400",
  medium: "text-amber-200",
  high: "text-orange-200",
  asap: "text-rose-200",
};

export function CurrentWorkBoard({ items }: { items: CurrentWorkItem[] }) {
  const grouped = useMemo(() => {
    return items.reduce<Record<string, CurrentWorkItem[]>>((acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = [];
      }
      acc[item.status] = [...acc[item.status], item];
      return acc;
    }, {});
  }, [items]);

  const statusOrder: CurrentWorkItem["status"][] = ["planned", "in-progress", "review", "blocked", "done"];

  return (
    <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      <header>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">Guncel liste</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Bugunku odak</h3>
      </header>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {statusOrder.map((status) => (
          <article key={status} className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
              <span>{statusLabels[status]}</span>
              <span>{grouped[status]?.length ?? 0}</span>
            </div>
            <div className="space-y-3">
              {(grouped[status] ?? []).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm text-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-semibold text-white">{item.title}</p>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] ${statusColors[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{item.project}</p>
                  <p className="mt-2 text-slate-300">{item.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                    <span className="text-slate-400">Alan {item.owner}</span>
                    <span className={priorityStyles[item.priority]}>{priorityLabels[item.priority]}</span>
                    <span className="text-slate-400">Efor {item.effort}</span>
                    <span className="text-slate-300">
                      Tarih{" "}
                      {new Date(item.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
              {(grouped[status] ?? []).length === 0 && (
                <p className="text-xs text-slate-500">Kayit yok.</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
