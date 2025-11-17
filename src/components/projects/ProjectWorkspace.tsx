"use client";

import { useMemo, useState } from "react";
import { CurrentWorkBoard } from "./CurrentWorkBoard";
import { ProjectActivities } from "./ProjectActivities";
import { ProjectBoard } from "./ProjectBoard";
import { ProjectHighlights } from "./ProjectHighlights";
import { ProjectTimeline } from "./ProjectTimeline";
import type {
  CapacityItem,
  CurrentWorkItem,
  FollowUpItem,
  ProjectItem,
  TimelineItem,
} from "./types";

type ViewMode = "projects" | "current-work";

export function ProjectWorkspace({
  projects,
  highlights,
  timelineItems,
  followUps,
  capacity,
  currentWork,
  now,
}: {
  projects: ProjectItem[];
  highlights: { label: string; value: string; hint: string; accent?: "fuchsia" | "emerald" | "amber" | "sky" }[];
  timelineItems: TimelineItem[];
  followUps: FollowUpItem[];
  capacity: CapacityItem[];
  currentWork: CurrentWorkItem[];
  now: Date;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("projects");
  const viewLabel = useMemo(
    () => ({
      projects: "Calismalar",
      "current-work": "Guncel liste",
    }),
    [],
  );

  return (
    <div className="w-full space-y-8">
      <section className="rounded-3xl border border-fuchsia-400/40 bg-fuchsia-500/10 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-fuchsia-200">Is alani</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Isler ve girisimler</h1>
            <p className="mt-2 max-w-3xl text-sm text-fuchsia-100/80">
              Tum calisma basliklarini, musterilerini ya da yan projelerini tek panelde tut. Kendi basina
              takip ettigin akislari filtrele, kritik notlari guncelle ve ihtiyac duydugunda hizlica yeni
              gorev ekle.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-100 lg:text-right">
            <label className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">Mod</label>
            <div className="flex items-center gap-2">
              <select
                value={viewMode}
                onChange={(event) => setViewMode(event.target.value as ViewMode)}
                className="rounded-2xl border border-white/20 bg-black/40 px-4 py-2 text-sm text-white"
              >
                <option value="projects">{viewLabel.projects}</option>
                <option value="current-work">{viewLabel["current-work"]}</option>
              </select>
              <button
                type="button"
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:border-fuchsia-300 hover:bg-fuchsia-500/10"
              >
                Yeni kayit olustur
              </button>
            </div>
          </div>
        </div>
      </section>

      {viewMode === "projects" ? (
        <>
          <ProjectHighlights items={highlights} />
          <div className="grid gap-6 xl:grid-cols-[2.2fr_1fr]">
            <ProjectBoard projects={projects} />
            <div className="space-y-6">
              <ProjectTimeline items={timelineItems} currentDate={now} />
              <ProjectActivities followUps={followUps} capacity={capacity} />
            </div>
          </div>
        </>
      ) : (
        <CurrentWorkBoard items={currentWork} />
      )}
    </div>
  );
}
