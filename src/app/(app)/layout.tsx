import { ReactNode } from "react";
import { MainNav } from "@/components/nav/MainNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">
              FOSS
            </p>
            <h1 className="text-2xl font-semibold text-white">
              Personal Finance OS
            </h1>
          </div>
          <MainNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-12 pb-24 lg:px-10">
        {children}
      </main>
    </div>
  );
}
