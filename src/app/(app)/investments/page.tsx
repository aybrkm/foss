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
      { name: "Midas", description: "Borsa İstanbul ve ABD hisselerini tek arayüzden aktararak pozisyonları güncelleme.", product: "personal" },
      { name: "Fintables API", description: "BIST finansal verilerini çekip şirket notlarını zenginleştirme.", product: "business" },
      { name: "Matriks Data", description: "Anlık fiyat akışını performans kartlarına bağlamak.", product: "business" },
      { name: "Gedik Trader", description: "Opsiyon ve vadeli işlemlerini portföye katmak.", product: "personal" },
      { name: "İş Yatırım TradeMaster", description: "Yatırım hesabı bakiyelerini entegre etmek.", product: "both" },
      { name: "Vakıf Yatırım API", description: "FX ve altın hesaplarını anlık görmek.", product: "business" },
      { name: "TEB Yatırım", description: "Fon sepetlerini otomatik import etmek.", product: "personal" },
      { name: "Deniz Trader", description: "Global piyasa pozisyonlarını tek bakışta görmek.", product: "both" },
      { name: "BtcTurk Pro", description: "Kripto pozisyonlarını yatırım tablosuna taşımak.", product: "personal" },
      { name: "Paribu Kurumsal", description: "Stablecoin bakiyelerini portföyde göstermek.", product: "business" },
    ],
  },
  {
    region: "ABD",
    items: [
      { name: "Interactive Brokers", description: "Portföy bakiyesi, emir ve işlem geçmişini API üzerinden alma.", product: "both" },
      { name: "Polygon.io", description: "Gerçek zamanlı piyasa datasıyla performans hesaplamak.", product: "business" },
      { name: "Alpaca", description: "Brokerage hesabını yönetip otomatik emir kaydı almak.", product: "both" },
      { name: "Robinhood Connect", description: "Retail portföyü Workspace’e taşımak.", product: "personal" },
      { name: "Bloomberg Portfolio", description: "Profesyonel veri setlerini kartlara beslemek.", product: "business" },
      { name: "Morningstar Direct", description: "Fon verilerini KPI’lara bağlamak.", product: "business" },
      { name: "BlackRock Aladdin", description: "Risk analiz çıktısını yatırım alanına yansıtmak.", product: "business" },
      { name: "Charles Schwab API", description: "IRAs ve brokerage bakiyelerini import etmek.", product: "both" },
      { name: "Vanguard Connect", description: "Fon/ETF pozisyonlarını senkronize etmek.", product: "personal" },
      { name: "Coinbase Prime", description: "Kurumsal kripto portföyünü izlemek.", product: "business" },
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
