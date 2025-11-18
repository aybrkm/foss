import { WorkspaceBoard } from "@/components/workspace";
import prisma from "@/lib/prisma";

export default async function WorkspacePage() {
  const columns = await prisma.workspaceColumn.findMany({
    orderBy: { position: "asc" },
    include: {
      cards: {
        orderBy: { position: "asc" },
      },
    },
  });

  const initialColumns = columns.map((column) => ({
    id: column.id,
    title: column.title,
    width: column.width ?? 1,
    cards: column.cards.map((card) => ({
      id: card.id,
      title: card.title,
      notes: card.notes ?? "",
    })),
  }));

  return (
    <div className="space-y-8">
      <WorkspaceBoard initialColumns={initialColumns} />
    </div>
  );
}
