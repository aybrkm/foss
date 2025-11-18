import { IntegrationInfoCard } from "@/components/common/IntegrationInfoCard";

const focusAreas = [
  {
    title: "Portföy dağılımı",
    description: "Varlık sınıflarına göre ağırlıklar ve hedefler burada görünecek.",
  },
  {
    title: "Performans izlemesi",
    description: "Zaman içindeki getiri/volatilite trendleri grafiklerle sunulacak.",
  },
  {
    title: "Hedef yatırımlar",
    description: "Yeni imkanlar ve bekleyen alımlar için takip listesi oluşturulacak.",
  },
];

const investmentIntegrations = [
  {
    region: "Türkiye",
    items: [
      {
        name: "Midas",
        description: "Borsa İstanbul ve ABD hisselerini tek arayüzden aktararak pozisyonları güncelleme.",
      },
      {
        name: "Fintables API",
        description: "BIST finansal verilerini çekip şirket notlarını zenginleştirme.",
      },
    ],
  },
  {
    region: "ABD",
    items: [
      {
        name: "Interactive Brokers",
        description: "Portföy bakiyesi, emir ve işlem geçmişini API üzerinden alma.",
      },
      {
        name: "Polygon.io",
        description: "Gerçek zamanlı piyasa datasıyla performans hesaplamak.",
      },
    ],
  },
];

export default function InvestmentsPage() {
  return (
    <div className="space-y-8">
      <IntegrationInfoCard
        title="Yatırım verisi entegrasyonları"
        description="Brokerage ve piyasa veri sağlayıcılarıyla otomatik güncelleme planı."
        integrations={investmentIntegrations}
      />
      <div className="rounded-3xl border border-sky-400/40 bg-sky-500/10 p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-sky-300">YATIRIMLAR</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Yatırım çalışma alanı</h1>
        <p className="mt-1 text-sm text-slate-100">
          Portföy planı, strateji notları ve hedef değerler yakında bu ekranda.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {focusAreas.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-200"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-sky-200">{item.title}</p>
            <p className="mt-2 text-slate-100">{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
