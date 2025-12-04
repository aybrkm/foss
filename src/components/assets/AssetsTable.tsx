"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

type AssetRow = {
  id: string;
  name: string;
  assetType: string;
  assetKind?: string | null;
  isLiquid?: boolean;
  numericValue: number;
  valueTry: number;
  currency: string;
  updatedAt: string;
  notes: string | null;
};

const kindLabels: Record<string, string> = {
  liquid: "Likit",
  stable: "Sabit",
  personal_valuable: "Personal Valuable",
};

export function AssetsTable({ assets }: { assets: AssetRow[] }) {
  const [showPersonalOnly, setShowPersonalOnly] = useState(false);
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      }),
    [],
  );

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const kind = normalizeKind(asset);
      return showPersonalOnly ? kind === "personal_valuable" : kind !== "personal_valuable";
    });
  }, [assets, showPersonalOnly]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-200">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Personal Valuables</p>
          <p className="text-xs text-slate-400">
            Toggle açıkken yalnızca personal valuable kayıtları görünür, kapalıyken sabit + likit varlıklar listelenir.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPersonalOnly((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
            showPersonalOnly
              ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
              : "border border-white/20 bg-black/30 text-white hover:border-white/50"
          }`}
        >
          <span
            className={`flex h-5 w-10 items-center rounded-full bg-white/10 p-1 transition ${
              showPersonalOnly ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`h-3.5 w-3.5 rounded-full bg-white transition ${showPersonalOnly ? "translate-x-0" : ""}`}
            />
          </span>
          {showPersonalOnly ? "Personal Valuables açık" : "Tümü (Likit + Sabit)"}
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-5 py-4">Varlık</th>
              <th className="px-5 py-4">Tip</th>
              <th className="px-5 py-4">Kategori</th>
              <th className="px-5 py-4 text-right">Değer</th>
              <th className="px-5 py-4 text-right">Güncelleme</th>
              <th className="px-5 py-4 text-right">Düzenle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-slate-500">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => {
                const kind = normalizeKind(asset);
                return (
                  <tr key={asset.id} className="hover:bg-white/5">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{asset.name}</p>
                      <p className="text-xs text-slate-400">{asset.notes ?? "-"}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{asset.assetType}</td>
                    <td className="px-5 py-4 text-slate-300">{kindLabels[kind] ?? "Sabit"}</td>
                    <td className="px-5 py-4 text-right font-semibold text-white">
                      <span>{formatCurrency(asset.numericValue, asset.currency)}</span>
                      <span className="block text-xs font-normal text-slate-400">
                        ≈ {formatCurrency(asset.valueTry, "TRY")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-400">
                      {dateFormatter.format(new Date(asset.updatedAt))}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function normalizeKind(asset: AssetRow): "liquid" | "stable" | "personal_valuable" {
  if (asset.assetKind === "personal_valuable") return "personal_valuable";
  if (asset.assetKind === "stable") return "stable";
  if (asset.assetKind === "liquid") return "liquid";
  return asset.isLiquid ? "liquid" : "stable";
}
