"use client";

import type { TimelineItem } from "./types";

const statusStyle: Record<TimelineItem["status"], string> = {
  planned: "border-slate-500/40 bg-slate-800/50 text-slate-200",
  "due-soon": "border-amber-400/40 bg-amber-500/10 text-amber-100",
  completed: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
};

const confidenceLabel = {
  high: "Hazir",
  medium: "Takip",
  low: "Belirsiz",
};

export function ProjectTimeline({ items, currentDate }: { items: TimelineItem[]; currentDate: Date }) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-sky-200">Yaklasan</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Hatirlatma notlari</h3>
      <div className="mt-5 space-y-4">
        {items.map((item) => {
          const due = new Date(item.dueDate);
          const diffDays = Math.max(
            0,
            Math.round((due.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          );
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-200"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.project}</p>
                  <p className="text-base font-semibold text-white">{item.label}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>
                    {due.toLocaleDateString("en-GB", { month: "short", day: "numeric" })},{" "}
                    {due.getFullYear()}
                  </p>
                  <p>{diffDays === 0 ? "Bugun" : `T-${diffDays} gun`}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className={`rounded-full border px-3 py-1 ${statusStyle[item.status]}`}>
                  {item.status === "planned"
                    ? "Planlandi"
                    : item.status === "completed"
                      ? "Tamamlandi"
                      : "Oncelikli"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                  {confidenceLabel[item.confidence]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
