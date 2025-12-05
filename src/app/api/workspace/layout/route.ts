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
  const deletedColumnIds = Array.isArray(body.deletedColumnIds)
    ? (body.deletedColumnIds as string[]).filter(Boolean)
    : [];
  const prune: boolean =
    typeof body.prune === "boolean" ? body.prune : true;

  const incomingIds = columns.map((column) => column.id);
  const ops: Prisma.PrismaPromise<unknown>[] = [];

  for (let i = 0; i < columns.length; i += 1) {
    const column = columns[i];
    const columnId = column.id;
    ops.push(
      prisma.workspaceColumn.upsert({
        where: { id: columnId },
        create: {
          id: columnId,
          title: column.title ?? `Alan ${i + 1}`,
          color: column.color ?? null,
          width: column.width ?? 1,
          position: column.position ?? i,
          ...(userId ? { user: { connect: { id: userId } } } : {}),
        },
        update: {
          title: column.title ?? `Alan ${i + 1}`,
          color: column.color ?? null,
          width: column.width ?? 1,
          position: column.position ?? i,
          ...(userId ? { user: { connect: { id: userId } } } : {}),
        },
      }),
    );

    const cards = column.cards;
    if (Array.isArray(cards)) {
      const cardIds = cards.map((card) => card.id);
      ops.push(
        prisma.workspaceCard.deleteMany({
          where: {
            columnId,
            userId,
            ...(cardIds.length > 0 ? { id: { notIn: cardIds } } : {}),
          },
        }),
      );
      for (let cardIndex = 0; cardIndex < cards.length; cardIndex += 1) {
        const card = cards[cardIndex];
        ops.push(
          prisma.workspaceCard.upsert({
            where: { id: card.id },
            create: {
              id: card.id,
              columnId,
              userId,
              title: card.title,
              notes: card.notes ?? "",
              position: card.position ?? cardIndex,
            },
            update: {
              columnId,
              userId,
              title: card.title,
              notes: card.notes ?? "",
              position: card.position ?? cardIndex,
            },
          }),
        );
      }
    }
  }

  if (deletedColumnIds.length > 0) {
    ops.push(
      prisma.workspaceCard.deleteMany({
        where: { userId, columnId: { in: deletedColumnIds } },
      }),
    );
    ops.push(
      prisma.workspaceColumn.deleteMany({
        where: { userId, id: { in: deletedColumnIds } },
      }),
    );
  }

  if (prune) {
    const columnNotIn = incomingIds.length > 0 ? { notIn: incomingIds } : undefined;
    const columnPruneWhere = columnNotIn ? { userId, columnId: columnNotIn } : { userId };
    const columnPruneColumnsWhere = columnNotIn ? { userId, id: columnNotIn } : { userId };
    ops.push(
      prisma.workspaceCard.deleteMany({
        where: {
          ...columnPruneWhere,
        },
      }),
    );
    ops.push(
      prisma.workspaceColumn.deleteMany({
        where: columnPruneColumnsWhere,
      }),
    );
  }

  if (ops.length > 0) {
    await prisma.$transaction(ops, { timeout: 15000 });
  }

  return NextResponse.json({ success: true });
}
