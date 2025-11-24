import type { User } from "@supabase/supabase-js";
import { createServerComponentClient } from "@/lib/supabase/server-component-client";

export async function requireUser(): Promise<User> {
  const supabase = await createServerComponentClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Oturum bulunamadı");
  }

  return user;
}

export async function requireUserId(): Promise<string> {
  const user = await requireUser();
  return user.id;
}
