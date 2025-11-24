"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

type Props = {
  children: React.ReactNode;
};

type SupabaseClient = ReturnType<typeof createBrowserClient>;

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children }: Props) {
  const [{ url, anonKey }] = useState(getSupabaseConfig);
  const [supabaseClient] = useState(() => createBrowserClient(url, anonKey));

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      syncAuthToServer(event, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient]);

  return <SupabaseContext.Provider value={supabaseClient}>{children}</SupabaseContext.Provider>;
}

export function useSupabaseClient() {
  const client = useContext(SupabaseContext);

  if (!client) {
    throw new Error("useSupabaseClient must be used within a SupabaseProvider");
  }

  return client;
}

function syncAuthToServer(event: string, session: Session | null) {
  const shouldSync =
    event === "INITIAL_SESSION" ||
    event === "SIGNED_IN" ||
    event === "TOKEN_REFRESHED" ||
    event === "SIGNED_OUT" ||
    event === "USER_DELETED";

  if (!shouldSync) {
    return;
  }

  if ((event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && !session) {
    return;
  }

  fetch("/api/auth/callback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ event, session }),
  })
    .then(() => {
      // Auth cookie set; make sure Prisma.User var
      return fetch("/api/users/sync", { method: "POST" });
    })
    .catch((error) => {
      console.error("Failed to sync auth state to server", error);
    });
}
