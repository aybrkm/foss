import { NextResponse } from "next/server";
import { createHash } from "crypto";
import prisma from "@/lib/prisma";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler-client";

export async function POST(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.masterCode === "string" ? body.masterCode : null;

  if (!code) {
    return NextResponse.json({ error: "Master kod gerekli" }, { status: 400 });
  }

  // Kullanıcı kaydı Prisma tarafında yoksa oluştur
  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email,
    },
    update: {
      email: user.email,
    },
  });

  const hash = createHash("sha256").update(code).digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: { masterKeyHash: hash },
  });

  return NextResponse.json({ ok: true });
}
