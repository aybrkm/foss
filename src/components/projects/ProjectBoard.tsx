"use client";

import { useMemo, useState } from "react";
import type { ProjectItem, ProjectStage } from "./types";

const stageLabels: Record<ProjectStage, string> = {
  idea: "Fikir",
  active: "Calisiliyor",
  follow_up: "Takipte",
  archive: "Arsivde",
};

const statusStyles = {
  on_track: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
  at_risk: "border-amber-400/40 bg-amber-500/10 text-amber-100",
  blocked: "border-rose-400/40 bg-rose-500/10 text-rose-100",
};

const statusLabel = {
  on_track: "Rahat",
  at_risk: "Odakta",
  blocked: "Blok",
};

export function ProjectBoard({ projects }: { projects: ProjectItem[] }) {
  const [activeStage, setActiveStage] = useState<ProjectStage | "all">("all");
  const columns = useMemo(() => {
    const base = {
      idea: [] as ProjectItem[],
      active: [] as ProjectItem[],
      follow_up: [] as ProjectItem[],
      archive: [] as ProjectItem[],
    };

    const list =
      activeStage === "all" ? projects : projects.filter((project) => project.stage === activeStage);

    return list.reduce((acc, project) => {
      acc[project.stage] = [...acc[project.stage], project];
      return acc;
    }, base);
  }, [projects, activeStage]);

  const stageOrder: ProjectStage[] = ["idea", "active", "follow_up", "archive"];
  const stagesToRender = activeStage === "all" ? stageOrder : [activeStage];
  const gridColumnsClass =
    stagesToRender.length >= 4
      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
      : stagesToRender.length === 3
        ? "grid-cols-1 md:grid-cols-3"
        : stagesToRender.length === 2
          ? "grid-cols-1 md:grid-cols-2"
          : "grid-cols-1";

  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-2xl shadow-black/20">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-fuchsia-200">Is Paneli</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Durum ve destek notlari</h2>
          <p className="text-sm text-slate-400">Calismalarini fikirden arsive kadar tek bakista filtrele.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
          {["all", ...stageOrder].map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setActiveStage(stage as ProjectStage | "all")}
              className={`rounded-full border px-4 py-1 transition ${
                activeStage === stage
                  ? "border-fuchsia-300 bg-fuchsia-500/10 text-white"
                  : "border-white/10 text-slate-400 hover:border-fuchsia-400/60 hover:text-white"
              }`}
            >
              {stage === "all" ? "Hepsi" : stageLabels[stage as ProjectStage]}
            </button>
          ))}
        </div>
      </header>

      <div className={`mt-6 grid gap-4 ${gridColumnsClass}`}>
        {stagesToRender.map((stage) => (
          <div key={stage} className="space-y-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
              <span>{stageLabels[stage]}</span>
              <span className="text-slate-400">{columns[stage].length}</span>
            </div>
            {columns[stage].length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-4 text-sm text-slate-500">
                Kayit yok
              </div>
            ) : (
              columns[stage].map((project) => (
                <article
                  key={project.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Alan: {project.owner}</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{project.name}</h3>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs ${statusStyles[project.status]}`}>
                      {statusLabel[project.status]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{project.summary}</p>

                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Ilerleme</span>
                      <span className="text-white">{project.progress}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
                      <div
                        className={`h-1.5 rounded-full ${
                          project.status === "blocked"
                            ? "bg-rose-400"
                            : project.status === "at_risk"
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-slate-950/30 p-3 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Enerji</span>
                      <span className="text-white">{project.budgetUsedPercentage}%</span>
                    </div>
                    <p className="mt-1 text-slate-300">Sonraki not: {project.nextStep}</p>
                    <p className="mt-1 text-slate-500">
                      Hedef:{" "}
                      <span className="text-slate-200">
                        {new Date(project.dueDate).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                    {project.focus.map((item) => (
                      <span key={item} className="rounded-full bg-slate-800/70 px-3 py-1 text-white/80">
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
