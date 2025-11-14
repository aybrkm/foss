import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

const adjustDateInput = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  date.setTime(date.getTime() + DAY_MS);
  return date;
};

const currencyOptions = ["TRY", "USD", "AED", "EUR"] as const;

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditAssetPage({ params }: Props) {
  const { id } = await params;
  const asset = await prisma.asset.findUnique({
    where: { id },
  });

  if (!asset) {
    notFound();
  }

  const acquisitionDate = asset.acquisitionDate
    ? asset.acquisitionDate.toISOString().split("T")[0]
    : "";

  async function updateAsset(formData: FormData) {
    "use server";
    const name = formData.get("name")?.toString().trim();
    const assetType = formData.get("assetType")?.toString().trim();
    const currency = formData.get("currency")?.toString() || "TRY";
    const valueRaw = formData.get("value")?.toString();
    const isLiquid = formData.get("isLiquid")?.toString() === "true";
    const notes = formData.get("notes")?.toString().trim() || null;
    const acquisitionDateRaw = formData.get("acquisitionDate")?.toString();

    const value = valueRaw ? Number(valueRaw) : NaN;

    if (!name || !assetType || Number.isNaN(value)) {
      throw new Error("Eksik ya da hatalı varlık bilgisi");
    }

    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        name,
        assetType,
        isLiquid,
        currentValue: value,
        currency,
        notes,
        acquisitionDate: adjustDateInput(acquisitionDateRaw),
      },
    });

    revalidatePath("/assets");
    revalidatePath("/dashboard");
    redirect("/assets");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-indigo-300">Assets</p>
          <h1 className="text-3xl font-semibold text-white">Varlığı düzenle</h1>
          <p className="text-slate-300">{asset.name}</p>
        </div>
        <Link
          href="/assets"
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60"
        >
          &larr; Listeye dön
        </Link>
      </div>

      <form
        action={updateAsset}
        className="grid gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-2"
      >
        <input
          name="name"
          defaultValue={asset.name}
          placeholder="Varlık adı"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          required
        />
        <input
          name="assetType"
          defaultValue={asset.assetType}
          placeholder="Tip"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          required
        />
        <select
          name="currency"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          defaultValue={asset.currency}
        >
          {currencyOptions.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="value"
          min="0"
          step="0.01"
          defaultValue={asset.currentValue.toString()}
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          required
        />
        <select
          name="isLiquid"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          defaultValue={asset.isLiquid ? "true" : "false"}
        >
          <option value="true">Likit</option>
          <option value="false">İllikit</option>
        </select>
        <input
          type="date"
          name="acquisitionDate"
          defaultValue={acquisitionDate}
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        />
        <textarea
          name="notes"
          defaultValue={asset.notes ?? ""}
          placeholder="Not (opsiyonel)"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 md:col-span-2"
          rows={4}
        />
        <button
          type="submit"
          className="rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 md:col-span-2"
        >
          Varlığı güncelle
        </button>
      </form>
    </div>
  );
}
