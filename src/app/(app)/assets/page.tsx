import Link from "next/link";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { convertToTry, getExchangeRates } from "@/lib/exchange";
import { formatCurrency } from "@/lib/format";
import { AssetForm } from "@/components/forms/AssetForm";
import { IntegrationInfoCard } from "@/components/common/IntegrationInfoCard";
import type { Integration } from "@/components/common/IntegrationInfoCard";
import { requireUserId } from "@/lib/auth";

const currencyOptions = ["TRY", "USD", "AED", "EUR"] as const;
const DAY_MS = 24 * 60 * 60 * 1000;

const adjustDateInput = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  date.setTime(date.getTime() + DAY_MS);
  return date;
};

async function createAsset(formData: FormData) {
  "use server";
  const userId = await requireUserId();
  const name = formData.get("name")?.toString().trim();
  const assetType = formData.get("assetType")?.toString().trim();
  const currency = formData.get("currency")?.toString() || "TRY";
  const value = Number(formData.get("value") ?? 0);
  const isLiquid = formData.get("isLiquid")?.toString() === "true";
  const notes = formData.get("notes")?.toString().trim() || null;
  const acquisitionDateRaw = formData.get("acquisitionDate")?.toString();

  if (!name || !assetType || Number.isNaN(value)) {
    throw new Error("Eksik varlık bilgisi");
  }

  await prisma.asset.create({
    data: {
      name,
      assetType,
      isLiquid,
      currentValue: value,
      currency,
      notes,
      acquisitionDate: adjustDateInput(acquisitionDateRaw),
      userId,
    },
  });

  revalidatePath("/assets");
  revalidatePath("/dashboard");
}

const assetIntegrations: Integration[] = [
  {
    region: "Türkiye",
    items: [
      { name: "MKK e-Yatırım API", description: "Borsa İstanbul portföy bakiyelerini otomatik çekmek.", product: "personal" },
      { name: "Enpara / Kuveyt Türk Open Banking", description: "Banka hesap değerlerini günlük senkronize etmek.", product: "personal" },
      { name: "Garanti BBVA API", description: "TRY/USD hesap bakiyelerini gerçek zamanlı okumak.", product: "business" },
      { name: "İşbank Maxi API", description: "Hisse ve fon blokelerini varlık tablosuna aktarmak.", product: "business" },
      { name: "QNB Finansinvest", description: "Yatırım hesap özetlerini periyodik olarak çekme.", product: "personal" },
      { name: "DenizBank Açık Bankacılık", description: "Vadeli/vadesiz bakiyeleri Workspace’e taşıma.", product: "business" },
      { name: "Vakıf Yatırım API", description: "BIST emir ve bakiye durumlarını entegre etmek.", product: "business" },
      { name: "Halkbank Kurumsal", description: "KOBİ nakit pozisyonlarını günlük izleme.", product: "business" },
      { name: "Akbank Direkt API", description: "Çoklu para birimindeki hesap bakiyelerini raporlama.", product: "both" },
      { name: "Gedik Trader", description: "Türev pozisyonlarını otomatik kayda geçirmek.", product: "personal" },
    ],
  },
  {
    region: "ABD",
    items: [
      { name: "Plaid Investments", description: "Brokerage ve tasarruf hesaplarını tek API üzerinden izleme.", product: "both" },
      { name: "Robinhood / Alpaca", description: "Hisse-senet emir ve bakiye verisini gerçek zamanlı almak.", product: "personal" },
      { name: "Fidelity Wealthscape", description: "Emeklilik hesaplarını Workspace’de gösterme.", product: "both" },
      { name: "Charles Schwab API", description: "Portföy dağılımını otomatik güncelleme.", product: "both" },
      { name: "Vanguard Connect", description: "Fon ve ETF bakiyelerini çekip raporlama.", product: "both" },
      { name: "Betterment", description: "Robo-Advisor varlıklarını tek panelde toplamak.", product: "personal" },
      { name: "Wealthfront", description: "Nakit ve yatırım hesaplarını senkronize etmek.", product: "personal" },
      { name: "Coinbase Prime", description: "Kripto varlık bakiyelerini izlemek.", product: "business" },
      { name: "Kraken Institutional", description: "Kurumsal kripto portföyünü aktarmak.", product: "business" },
      { name: "Mercury Treasury", description: "USD nakit pozisyonunu otomatik güncellemek.", product: "business" },
    ],
  },
];

export default async function AssetsPage({ searchParams }: { searchParams?: { valuables?: string } }) {
  const userId = await requireUserId();
  const assets = await prisma.asset.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  type AssetRow = typeof assets[number];
  type EnrichedAsset = AssetRow & { numericValue: number; valueTry: number };
  const rates = await getExchangeRates();
  const enrichedAssets: EnrichedAsset[] = assets.map((asset: AssetRow) => {
    const numericValue = Number(asset.currentValue);
    return {
      ...asset,
      numericValue,
      valueTry: convertToTry(numericValue, asset.currency, rates),
    };
  });
  const totalPortfolioTry = enrichedAssets.reduce(
    (sum: number, asset: EnrichedAsset) => sum + asset.valueTry,
    0,
  );
  const liquidCount = enrichedAssets.filter((asset: EnrichedAsset) => asset.isLiquid).length;
  const illiquidCount = enrichedAssets.length - liquidCount;
  const showValuablesOnly = searchParams?.valuables === "1";
  const visibleAssets = showValuablesOnly
    ? enrichedAssets.filter((asset) => asset.assetType.toLowerCase().includes("personal valuable"))
    : enrichedAssets;
  const assetHighlights = [
    {
      title: "Toplam portföy",
      value: formatCurrency(totalPortfolioTry, "TRY"),
      hint: "TRY karşılığı",
    },
    {
      title: "Likit varlık",
      value: `${liquidCount}`,
      hint: "anında erişilebilir kayıt",
    },
    {
      title: "İllikit varlık",
      value: `${illiquidCount}`,
      hint: "uzun vadeli pozisyon",
    },
  ];

  return (
    <div className="space-y-6">
      <IntegrationInfoCard
        title="Varlık senkronizasyon entegrasyonları"
        description="Bankalar ve aracı kurumlarla otomatik veri akışı için planlanan bağlantılar."
        integrations={assetIntegrations}
      />
      <section className="space-y-4">
        <div className="rounded-3xl border border-indigo-400/50 bg-indigo-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">Varlıklar</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Tüm varlıkları tek panelde tut</h2>
          <p className="mt-2 max-w-3xl text-sm text-indigo-100/80">
            Likit/illikit fark etmeksizin tüm pozisyonları güncel değer ve notlarıyla izleyerek portföyün
            gerçek büyüklüğünü anlık gör.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {assetHighlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-200"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">{item.title}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              <p className="text-xs text-slate-400">{item.hint}</p>
            </article>
          ))}
        </div>
      </section>

      <AssetForm action={createAsset} currencies={currencyOptions} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-200">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Personal Valuables</p>
          <p className="text-xs text-slate-400">Drone, VR, koleksiyon eşyaları gibi değerli eşyalar için özel görünüm.</p>
        </div>
        <Link
          href={showValuablesOnly ? "/assets" : "/assets?valuables=1"}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            showValuablesOnly
              ? "border border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
              : "border border-white/20 bg-black/30 text-white hover:border-white/50"
          }`}
        >
          {showValuablesOnly ? "Tüm varlıklar" : "Sadece Personal Valuables"}
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-5 py-4">Varlık</th>
              <th className="px-5 py-4">Tip</th>
              <th className="px-5 py-4">Likidite</th>
              <th className="px-5 py-4 text-right">Değer</th>
              <th className="px-5 py-4 text-right">Güncelleme</th>
              <th className="px-5 py-4 text-right">Düzenle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {visibleAssets.map((asset: EnrichedAsset) => (
              <tr key={asset.id} className="hover:bg-white/5">
                <td className="px-5 py-4">
                  <p className="font-semibold text-white">{asset.name}</p>
                  <p className="text-xs text-slate-400">{asset.notes ?? "-"}</p>
                </td>
                <td className="px-5 py-4 text-slate-300">{asset.assetType}</td>
                <td className="px-5 py-4 text-slate-300">
                  {asset.isLiquid ? "Likit" : "İllikit"}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-white">
                  <span>{formatCurrency(asset.numericValue, asset.currency)}</span>
                  <span className="block text-xs font-normal text-slate-400">
                    ≈ {formatCurrency(asset.valueTry, "TRY")}
                  </span>
                </td>
                <td className="px-5 py-4 text-right text-slate-400">
                  {new Date(asset.updatedAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/assets/${asset.id}/edit`}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-1 text-xs text-white transition hover:border-white/60"
                    aria-label="Varlığı düzenle"
                  >
                    ✏️
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
