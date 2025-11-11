import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

type ServerCookies = Awaited<ReturnType<typeof cookies>>;

export async function createServerComponentClient() {
  const cookiesResult = cookies() as ServerCookies | Promise<ServerCookies>;
  const cookieStore = await Promise.resolve(cookiesResult);
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // Server Components cannot mutate cookies; no-op.
      },
      remove() {
        // Server Components cannot mutate cookies; no-op.
      },
    },
  });
}
