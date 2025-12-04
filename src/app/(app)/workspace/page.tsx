import { WorkspaceBoard } from "@/components/workspace";
import { requireUserId } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function WorkspacePage() {
  const userId = await requireUserId();
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
  type ColumnRow = (typeof columns)[number];
  type CardRow = ColumnRow["cards"][number];

  const initialColumns = columns.map((column: ColumnRow) => ({
    id: column.id,
    title: column.title,
    width: column.width ?? 1,
    cards: column.cards.map((card: CardRow) => ({
      id: card.id,
      title: card.title,
      notes: card.notes ?? "",
    })),
  }));

  return (
    <WorkspaceBoard initialColumns={initialColumns} />
  );
}
