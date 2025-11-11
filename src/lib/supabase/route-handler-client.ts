import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

type RouteCookies = Awaited<ReturnType<typeof cookies>>;

export async function createRouteHandlerSupabaseClient() {
  const cookiesResult = cookies() as RouteCookies | Promise<RouteCookies>;
  const cookieStore = await Promise.resolve(cookiesResult);
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: Parameters<RouteCookies["set"]>[2]) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options?: Parameters<RouteCookies["set"]>[2]) {
        cookieStore.set(name, "", options);
      },
    },
  });
}
