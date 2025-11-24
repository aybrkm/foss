import { NextResponse } from "next/server";
import { createHash } from "crypto";
import prisma from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";
import { decryptAnyWithMasterCode } from "@/lib/client-crypto";
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
  const masterCode = typeof body?.masterCode === "string" ? body.masterCode : null;
  const id = typeof body?.id === "string" ? body.id : null;

  if (!masterCode || !id) {
    return NextResponse.json({ error: "Veri eksik" }, { status: 400 });
  }

  const [user, account] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { masterKeyHash: true } }),
    prisma.digitalAccount.findFirst({
      where: { id, userId: user.id },
      select: { encryptedPassword: true },
    }),
  ]);

  if (!account?.encryptedPassword) {
    return NextResponse.json({ error: "Şifre bulunamadı" }, { status: 400 });
  }
  if (user?.masterKeyHash) {
    const hash = createHash("sha256").update(masterCode).digest("hex");
    if (hash !== user.masterKeyHash) {
      return NextResponse.json({ error: "Master kod hatalı" }, { status: 403 });
    }
  }

  const payload = account.encryptedPassword;

  // Try client-format first
  try {
    const password = await decryptAnyWithMasterCode(payload, masterCode);
    return NextResponse.json({ password });
  } catch {
    // continue
  }

  // Legacy env-key format fallback
  try {
    const password = decryptSecret(payload);
    return NextResponse.json({ password });
  } catch {
    return NextResponse.json(
      { error: "Şifre çözülemedi. Hesabı düzenleyip şifreyi yeniden kaydet." },
      { status: 400 },
    );
  }
}
