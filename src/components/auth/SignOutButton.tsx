"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@/components/providers/SupabaseProvider";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = useSupabaseClient();

  const handleSignOut = () => {
    startTransition(async () => {
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
        className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60 disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Cikiliyor..." : "Cikis Yap"}
    </button>
  );
}
