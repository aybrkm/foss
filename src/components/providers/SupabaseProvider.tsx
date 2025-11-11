"use client";

import { useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";

type Props = {
  children: React.ReactNode;
};

export function SupabaseProvider({ children }: Props) {
  const [{ url, anonKey }] = useState(getSupabaseConfig);
  const [supabaseClient] = useState(() => createBrowserClient(url, anonKey));

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
}
