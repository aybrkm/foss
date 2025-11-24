import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler-client";

export async function GET(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient();

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, request.url));
}

export async function POST(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient();
  const { event, session } = await request.json();

  if (!event) {
    return NextResponse.json({ error: "Auth event missing" }, { status: 400 });
  }

  if (event === "SIGNED_OUT" || event === "USER_DELETED") {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  if (event !== "INITIAL_SESSION" && event !== "SIGNED_IN" && event !== "TOKEN_REFRESHED") {
    return NextResponse.json({ success: true });
  }

  const access_token = session?.access_token;
  const refresh_token = session?.refresh_token;

  if (!access_token || !refresh_token) {
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase.auth.setSession({ access_token, refresh_token });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Uygulama veritabanında Supabase kullanıcısını oluştur/güncelle
  if (session?.user?.id) {
    const user = session.user;
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
  } else {
    // Fallback: oturum kurulduktan sonra Supabase üzerinden kullanıcıyı çekip ekle
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id) {
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
  }

  return NextResponse.json({ success: true });
}
