import { IntegrationInfoCard } from "@/components/common/IntegrationInfoCard";
import type { Integration } from "@/components/common/IntegrationInfoCard";
import { WorkspaceBoard } from "@/components/workspace";
import prisma from "@/lib/prisma";

const workspaceIntegrations: Integration[] = [
  {
    region: "Türkiye",
    items: [
      { name: "Workiom", description: "Görev ve doküman otomasyonunu API ile kartlaştırma.", product: "business" },
      { name: "Logo Flow", description: "ERP süreçlerinden gelen iş isteklerini panoya aktarım.", product: "business" },
      { name: "Netoloji BPM", description: "Onay akışlarını otomatik iş kartlarına çevirmek.", product: "business" },
      { name: "Kolay IK", description: "İK taleplerini görev listesine senkronize etme.", product: "business" },
      { name: "Destek CRM", description: "Müşteri ticketlarını Workspace sütunlarına aktararak takip etmek.", product: "business" },
      { name: "Fit Solutions e-Flow", description: "E-fatura ve belge onaylarını iş sırasına ekleme.", product: "business" },
      { name: "Paraşüt Tasks", description: "Serbest meslek faturalarından kişisel görev üretme.", product: "personal" },
      { name: "Nebim V3 Görevler", description: "Mağaza içi süreçleri kartlara dönüştürme.", product: "business" },
      { name: "Akbank Workzone", description: "KOBİ görev bildirimlerini Workspace ile birleştirme.", product: "business" },
      { name: "Turkcell G Work", description: "Saha siparişleri için otomatik iş kartı açma.", product: "business" },
    ],
  },
  {
    region: "ABD",
    items: [
      { name: "Atlassian Jira Cloud", description: "Finans/ürün iş item'larını Jira projeleriyle çift yönlü eşitleme.", product: "business" },
      { name: "Notion API", description: "Kişisel roadmap veya CRM sayfalarını kartlara dönüştürme.", product: "personal" },
      { name: "Asana", description: "Takım görevlerini Workspace sütunlarına taşımak.", product: "business" },
      { name: "ClickUp", description: "Automation'larla kartları güncel tutmak.", product: "both" },
      { name: "Trello", description: "Kanban panolarını Workspace ile eşitlemek.", product: "personal" },
      { name: "Linear", description: "Ürün sprintlerini finans odaklı kolona bağlama.", product: "business" },
      { name: "Shortcut", description: "Start-up ekip işlerini tek bakışta görmek.", product: "both" },
      { name: "Monday.com", description: "Operasyon projelerini kartlara aktarım.", product: "business" },
      { name: "Slack Workflows", description: "Mesaj tabanlı hatırlatmaları otomatik kartlaştırma.", product: "both" },
      { name: "Airtable Automations", description: "Tabloları kart/kategori yapısına bağlamak.", product: "both" },
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
