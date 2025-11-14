import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/lib/supabase/server-component-client";
import { MainNav } from "@/components/nav/MainNav";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">
              FLOSS
            </p>
            <h1 className="text-2xl font-semibold text-white">
              Personal Finance OS
            </h1>
          </div>
          <div className="flex flex-col items-start gap-3 text-sm text-white lg:flex-row lg:items-center">
            <MainNav />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-12 pb-24 lg:px-10">
        {children}
      </main>
    </div>
  );
}
