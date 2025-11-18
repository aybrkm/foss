import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const columns = await prisma.workspaceColumn.findMany({
    orderBy: { position: "asc" },
    include: {
      cards: {
        orderBy: { position: "asc" },
      },
    },
  });
  return NextResponse.json({ columns });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body || !Array.isArray(body.columns)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const columns = body.columns as Array<{
    id: string;
    title?: string;
    width?: number;
    position?: number;
    cards?: Array<{ id: string; title: string; notes?: string; position?: number }>;
  }>;

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < columns.length; i += 1) {
      const column = columns[i];
      const columnId = column.id;
      await tx.workspaceColumn.upsert({
        where: { id: columnId },
        create: {
          id: columnId,
          title: column.title ?? `Alan ${i + 1}`,
          width: column.width ?? 1,
          position: i,
        },
        update: {
          title: column.title ?? `Alan ${i + 1}`,
          width: column.width ?? 1,
          position: i,
        },
      });

      await tx.workspaceCard.deleteMany({
        where: { columnId },
      });

      const cards = column.cards ?? [];
      if (cards.length > 0) {
        await tx.workspaceCard.createMany({
          data: cards.map((card, index) => ({
            id: card.id,
            columnId,
            title: card.title,
            notes: card.notes ?? "",
            position: index,
          })),
        });
      }
    }

    const incomingIds = columns.map((column) => column.id);
    await tx.workspaceColumn.deleteMany({
      where: {
        id: {
          notIn: incomingIds,
        },
      },
    });
  });

  return NextResponse.json({ success: true });
}
