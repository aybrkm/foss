import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-indigo-300">Assets</p>
        <h2 className="text-3xl font-semibold text-white">
          Tüm varlıklar (likit + illikit)
        </h2>
        <p className="max-w-2xl text-slate-300">
          assets tablosu: name, asset_type, is_liquid, current_value, currency,
          acquisition_date, notes.
        </p>
      </header>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-5 py-4">Varlık</th>
              <th className="px-5 py-4">Tip</th>
              <th className="px-5 py-4">Likidite</th>
              <th className="px-5 py-4 text-right">Değer</th>
              <th className="px-5 py-4 text-right">Güncelleme</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-white/5">
                <td className="px-5 py-4">
                  <p className="font-semibold text-white">{asset.name}</p>
                  <p className="text-xs text-slate-400">{asset.notes ?? "-"}</p>
                </td>
                <td className="px-5 py-4 capitalize text-slate-300">
                  {asset.assetType.replace("_", " ")}
                </td>
                <td className="px-5 py-4 text-slate-300">
                  {asset.isLiquid ? "Likit" : "İllikit"}
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
