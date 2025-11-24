import Link from "next/link";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/lib/supabase/server-component-client";
import { MainNav } from "@/components/nav/MainNav";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/60">
        <div className="mx-auto flex w-full max-w-384 flex-col items-center gap-4 px-8 py-6 text-white xl:px-12">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="text-2xl font-semibold uppercase tracking-[0.4em] text-indigo-300 transition hover:text-white"
            >
              FLOSS
            </Link>
            <MainNav />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-384 px-8 py-12 pb-24 lg:px-10">
        {children}
      </main>
    </div>
  );
}
