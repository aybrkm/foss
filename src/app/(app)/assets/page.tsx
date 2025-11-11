import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { AssetForm } from "@/components/forms/AssetForm";

const currencyOptions = ["TRY", "USD", "AED", "EUR"] as const;

async function createAsset(formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString().trim();
  const assetType = formData.get("assetType")?.toString().trim();
  const currency = formData.get("currency")?.toString() || "TRY";
  const value = Number(formData.get("value") ?? 0);
  const isLiquid = formData.get("isLiquid")?.toString() === "true";
  const notes = formData.get("notes")?.toString().trim() || null;
  const acquisitionDateRaw = formData.get("acquisitionDate")?.toString();

  if (!name || !assetType || Number.isNaN(value)) {
    throw new Error("Eksik varlik bilgisi");
  }

  await prisma.asset.create({
    data: {
      name,
      assetType,
      isLiquid,
      currentValue: value,
      currency,
      notes,
      acquisitionDate: acquisitionDateRaw ? new Date(acquisitionDateRaw) : null,
    },
  });

  revalidatePath("/assets");
  revalidatePath("/dashboard");
}

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({
    orderBy: { updatedAt: "desc" },
  });
  type AssetRow = typeof assets[number];

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.4em] text-indigo-300">Assets</p>
        <h2 className="text-3xl font-semibold text-white">Tum varliklar (likit + illikit)</h2>
        <p className="max-w-2xl text-slate-300">
          assets tablosu: name, asset_type (artik serbest metin), is_liquid, current_value, currency,
          acquisition_date, notes.
        </p>
      </header>

      <AssetForm action={createAsset} currencies={currencyOptions} />

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-5 py-4">Varlik</th>
              <th className="px-5 py-4">Tip</th>
              <th className="px-5 py-4">Likidite</th>
              <th className="px-5 py-4 text-right">Deger</th>
              <th className="px-5 py-4 text-right">Guncelleme</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {assets.map((asset: AssetRow) => (
              <tr key={asset.id} className="hover:bg-white/5">
                <td className="px-5 py-4">
                  <p className="font-semibold text-white">{asset.name}</p>
                  <p className="text-xs text-slate-400">{asset.notes ?? "-"}</p>
                </td>
                <td className="px-5 py-4 text-slate-300">{asset.assetType}</td>
                <td className="px-5 py-4 text-slate-300">
                  {asset.isLiquid ? "Likit" : "Illikit"}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-white">
                  {formatCurrency(Number(asset.currentValue), asset.currency)}
                </td>
                <td className="px-5 py-4 text-right text-slate-400">
                  {new Date(asset.updatedAt).toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
