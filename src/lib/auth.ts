import type { User } from "@supabase/supabase-js";
import { createServerComponentClient } from "@/lib/supabase/server-component-client";
import prisma from "@/lib/prisma";

async function ensureUserRecord(user: User) {
  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? null,
    },
    update: {
      email: user.email,
      name: user.user_metadata?.name ?? null,
    },
  });
}

export async function requireUser(): Promise<User> {
  const supabase = await createServerComponentClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Oturum bulunamadı");
  }

  await ensureUserRecord(user);
  return user;
}

export async function requireUserId(): Promise<string> {
  const user = await requireUser();
  return user.id;
}
