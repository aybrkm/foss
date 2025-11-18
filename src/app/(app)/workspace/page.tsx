import { IntegrationInfoCard } from "@/components/common/IntegrationInfoCard";
import { WorkspaceBoard } from "@/components/workspace";
import prisma from "@/lib/prisma";

const workspaceIntegrations = [
  {
    region: "Türkiye",
    items: [
      { name: "Workiom", description: "Görev ve doküman otomasyonunu API ile çekip kartlara dönüştürme." },
      { name: "Logo Flow", description: "ERP süreçlerinden gelen iş isteklerini Workspace panosuna aktarım." },
      { name: "Netoloji BPM", description: "Onay akışlarını otomatik iş kartlarına çevirmek." },
      { name: "Kolay IK", description: "İK taleplerini kişisel görev listesine senkronize etme." },
      { name: "Destek CRM", description: "Müşteri ticketlarını Workspace sütunlarına aktararak takip etmek." },
      { name: "Fit Solutions e-Flow", description: "E-fatura ve belge onaylarını iş sırasına ekleme." },
      { name: "Paraşüt Tasks", description: "Gelir/gider kayıtlarından görev üretme." },
      { name: "Nebim V3 Görevler", description: "Mağaza içi süreçleri kartlara dönüştürme." },
      { name: "Akbank Workzone", description: "KOBİ görev bildirimlerini Workspace ile birleştirme." },
      { name: "Turkcell G Work", description: "Saha siparişleri için otomatik iş kartı açma." },
    ],
  },
  {
    region: "ABD",
    items: [
      { name: "Atlassian Jira Cloud", description: "Finans/ürün iş item'larını Jira projeleriyle çift yönlü eşitleme." },
      { name: "Notion API", description: "Kişisel roadmap veya CRM sayfalarını kartlara dönüştürme." },
      { name: "Asana", description: "Takım görevlerini Workspace sütunlarına taşımak." },
      { name: "ClickUp", description: "Automation'larla kartları güncel tutmak." },
      { name: "Trello", description: "Kanban panolarını Workspace ile eşitlemek." },
      { name: "Linear", description: "Ürün sprintlerini finans odaklı kolona bağlama." },
      { name: "Shortcut", description: "Start-up ekip işlerini tek bakışta görmek." },
      { name: "Monday.com", description: "Operasyon projelerini kartlara aktarım." },
      { name: "Slack Workflows", description: "Mesaj tabanlı hatırlatmaları otomatik kartlaştırma." },
      { name: "Airtable Automations", description: "Tabloları kart/kategori yapısına bağlamak." },
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
