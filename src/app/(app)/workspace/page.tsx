import { IntegrationInfoCard } from "@/components/common/IntegrationInfoCard";
import { WorkspaceBoard } from "@/components/workspace";
import prisma from "@/lib/prisma";

const workspaceIntegrations = [
  {
    region: "Türkiye",
    items: [
      {
        name: "Workiom",
        description: "Görev ve doküman otomasyonunu API ile çekip kartlara dönüştürme.",
      },
      {
        name: "Logo Flow",
        description: "ERP süreçlerinden gelen iş isteklerini Workspace panosuna aktarım.",
      },
    ],
  },
  {
    region: "ABD",
    items: [
      {
        name: "Atlassian Jira Cloud",
        description: "Finans/ürün iş item'larını Jira projeleriyle çift yönlü eşitleme.",
      },
      {
        name: "Notion API",
        description: "Kişisel roadmap veya CRM sayfalarını kartlara dönüştürme.",
      },
    ],
  },
];

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
      <IntegrationInfoCard
        title="Workspace otomasyon entegrasyonları"
        description="Görev panosunu harici iş araçlarıyla besleyebilmek için planlanan servisler."
        integrations={workspaceIntegrations}
      />
      <WorkspaceBoard initialColumns={initialColumns} />
    </div>
  );
}
