import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler-client";

export async function POST() {
  const supabase = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
  }

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

  return NextResponse.json({ ok: true });
}
