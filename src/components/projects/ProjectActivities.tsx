"use client";

import type { CapacityItem, FollowUpItem } from "./types";

const severityTone: Record<FollowUpItem["severity"], string> = {
  low: "bg-slate-800/40 text-slate-200 border-white/10",
  medium: "bg-amber-500/10 text-amber-100 border-amber-400/40",
  high: "bg-rose-500/10 text-rose-100 border-rose-400/40",
};

const typeLabel: Record<FollowUpItem["type"], string> = {
  approval: "Onay",
  risk: "Risk",
  handoff: "Devret",
};

export function ProjectActivities({
  followUps,
  capacity,
}: {
  followUps: FollowUpItem[];
  capacity: CapacityItem[];
}) {
  return (
    <div className="space-y-6">
      <article className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Bekleyen</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Takip notlari</h3>
        <div className="mt-5 space-y-4">
          {followUps.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.project}</p>
                  <p className="text-base font-semibold text-white">{typeLabel[item.type]}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs ${severityTone[item.severity]}`}>
                  {item.owner}
                </span>
              </div>
              <p className="mt-2 text-slate-300">{item.notes}</p>
              <p className="mt-2 text-xs text-slate-500">
                Tarih:{" "}
                <span className="text-slate-200">
                  {new Date(item.dueDate).toLocaleDateString("en-GB", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">Enerji</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Rutine ayrilan zaman</h3>
        <div className="mt-5 space-y-4">
          {capacity.map((item) => {
            const ratio = Math.min(100, Math.round((item.loadPercentage / item.limitPercentage) * 100));
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
                  <span>{item.team}</span>
                  <span className="text-slate-300">{item.lead}</span>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-lg font-semibold text-white">{item.loadPercentage}s</p>
                  <p className="text-xs text-slate-400">Limit {item.limitPercentage}s</p>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/10">
                  <div
                    className={`h-1.5 rounded-full ${
                      ratio > 95 ? "bg-rose-400" : ratio > 85 ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${ratio}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                  {item.focus.map((focus) => (
                    <span key={focus} className="rounded-full bg-slate-800/70 px-3 py-1 text-white/80">
                      {focus}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}
