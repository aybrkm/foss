import { IntegrationInfoCard } from "@/components/common/IntegrationInfoCard";

const placeholderItems = [
  {
    title: "Aylık girişler",
    description: "Maaş, freelance ve diğer tekrar eden gelir kalemleri burada görünecek.",
  },
  {
    title: "Aylık çıkışlar",
    description: "Faturalar, hedefler ve otomatik ödemeler bu bölümde toplanacak.",
  },
  {
    title: "Öngörülen bakiye",
    description: "Gelir/ gider planı baz alınarak ileri tarihli nakit durumu hesaplanacak.",
  },
];

const cashflowIntegrations = [
  {
    region: "Türkiye",
    items: [
      { name: "Akbank API Portalı", description: "Hesap hareketlerini günlük çekerek tahsilat/ödeme akışını izleme.", product: "business" },
      { name: "Paraşüt Cashflow", description: "Gelir-gider projeksiyonlarını import ederek tahmin üretme.", product: "both" },
      { name: "İşbank MaxiCash", description: "KOBİ hesabı bakiyelerini otomatik güncelleme.", product: "business" },
      { name: "Garanti BBVA Connect", description: "Nakit pozisyonlarını kur bazında raporlamak.", product: "business" },
      { name: "QNB Finansbank Kurumsal", description: "POS ve tahsilat akışını günlük görmek.", product: "business" },
      { name: "ING Türkiye API", description: "USD/EUR hesap hareketlerini Workspace'e aktarmak.", product: "business" },
      { name: "VakifBank V-Flow", description: "Çek/Senet vade planlarını izlemek.", product: "business" },
      { name: "DenizBank Treasury", description: "FX forward ve faiz ödemelerini planlamak.", product: "business" },
      { name: "Turkcell Paycell Business", description: "Tahsilat kanalından gelen tutarları nakit tablosuna eklemek.", product: "business" },
      { name: "Papara İş", description: "Cüzdan hareketlerini kısa vadeli nakde yansıtmak.", product: "personal" },
    ],
  },
  {
    region: "ABD",
    items: [
      { name: "Brex Treasury", description: "Kurumsal kart ve banka bakiyelerini tek tablodan izleme.", product: "business" },
      { name: "Xero Cashflow", description: "USD bazlı tahsilat planlarını nakit görünümüne senkronize etme.", product: "business" },
      { name: "Ramp", description: "Kart harcamalarını gerçek zamanlı nakit çıkışına bağlama.", product: "business" },
      { name: "Mercury Treasury", description: "Startup nakit pozisyonunu otomatik raporlama.", product: "business" },
      { name: "QuickBooks Cash", description: "Gelir/gider tahminlerini Workspace içine almak.", product: "personal" },
      { name: "Wise Business API", description: "Çoklu para birimi bakiyelerini tek yerde göstermek.", product: "both" },
      { name: "BlueVine", description: "Kredi hattı kullanımını nakit tahminine eklemek.", product: "business" },
      { name: "Oracle NetSuite Cash360", description: "Kurumsal nakit forecastını içeri aktarmak.", product: "business" },
      { name: "SAP Concur", description: "Masraf formlarını otomatik nakit çıkışına dönüştürme.", product: "business" },
      { name: "Stripe Treasury", description: "Platform ödemelerini günlük yönetime taşımak.", product: "business" },
    ],
  },
];

export default function CashflowPage() {
  return (
    <div className="space-y-8">
      <IntegrationInfoCard
        title="Nakit akışı entegrasyonları"
        description="Banka ve muhasebe servisleriyle veri akışını otomatikleştirerek planı güncel tutma."
        integrations={cashflowIntegrations}
      />
      <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">NAKİT AKIŞI</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Nakit akışı görünümü</h1>
        <p className="mt-1 text-sm text-emerald-100/80">
          Yakında, tüm gelir ve gider projeksiyonların bu sayfadan yönetilecek.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {placeholderItems.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-200"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">{item.title}</p>
            <p className="mt-2 text-slate-100">{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
