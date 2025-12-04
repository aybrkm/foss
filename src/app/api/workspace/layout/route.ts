import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler-client";

async function getUserId() {
  const supabase = await createRouteHandlerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
  }

  const columns = await prisma.workspaceColumn.findMany({
    where: { userId },
    orderBy: { position: "asc" },
    include: {
      cards: {
        where: { userId },
        orderBy: { position: "asc" },
      },
    },
  });
  return NextResponse.json({ columns });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
  }

  const body = await request.json();
  if (!body || !Array.isArray(body.columns)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const columns = body.columns as Array<{
    id: string;
    title?: string;
    width?: number;
    color?: string | null;
    position?: number;
    cards?: Array<{ id: string; title: string; notes?: string; position?: number }>;
  }>;

  for (let i = 0; i < columns.length; i += 1) {
    const column = columns[i];
    const columnId = column.id;
    await prisma.workspaceColumn.upsert({
      where: { id: columnId },
      create: {
        id: columnId,
        title: column.title ?? `Alan ${i + 1}`,
        color: column.color ?? null,
        width: column.width ?? 1,
        position: i,
        ...(userId ? { user: { connect: { id: userId } } } : {}),
      },
      update: {
        title: column.title ?? `Alan ${i + 1}`,
        color: column.color ?? null,
        width: column.width ?? 1,
        position: i,
        ...(userId ? { user: { connect: { id: userId } } } : {}),
      },
    });

    await prisma.workspaceCard.deleteMany({
      where: { columnId, userId },
    });

    const cards = column.cards ?? [];
    if (cards.length > 0) {
      await prisma.workspaceCard.deleteMany({
        where: {
          userId,
          id: { in: cards.map((card) => card.id) },
        },
      });
      await prisma.workspaceCard.createMany({
        data: cards.map((card, index) => ({
          id: card.id,
          columnId,
          userId,
          title: card.title,
          notes: card.notes ?? "",
          position: index,
        })),
      });
    }
  }

  const incomingIds = columns.map((column) => column.id);
  await prisma.workspaceColumn.deleteMany({
    where: {
      userId,
      id: {
        notIn: incomingIds,
      },
    },
  });
  await prisma.workspaceCard.deleteMany({
    where: {
      userId,
      columnId: {
        notIn: incomingIds,
      },
    },
  });

  return NextResponse.json({ success: true });
}
