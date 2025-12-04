"use client";

import { useMemo, useState } from "react";
import { formatCurrency, daysUntil } from "@/lib/format";

type AssetDetail = {
  id: string;
  name: string;
  assetType: string;
  isLiquid: boolean;
  assetKind: string | null;
  value: number;
  valueTry: number;
  currency: string;
  updatedAt: string;
};

type ObligationDetail = {
  id: string;
  name: string;
  category: string;
  frequency: string;
  amount: number | null;
  amountTry: number | null;
  currency: string | null;
  nextDue: string | null;
  notes: string | null;
  isRecurring: boolean;
  recurrenceUnit: string | null;
  recurrenceInterval: number | null;
};

type ReminderDetail = {
  id: string;
  title: string;
  description: string | null;
  dueAt: string;
  related: string | null;
};

type Props = {
  totalAssetValue: number;
  liquidAssetValue: number;
  assets: AssetDetail[];
  upcomingObligations: ObligationDetail[];
  importantReminders: ReminderDetail[];
};

type ModalType = "assets" | "obligations" | "reminders" | null;

export function SummaryKpis({
  totalAssetValue,
  liquidAssetValue,
  assets,
  upcomingObligations,
  importantReminders,
}: Props) {
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
  const [modal, setModal] = useState<ModalType>(null);
  const close = () => setModal(null);
  const stableAssetValue = Math.max(totalAssetValue - liquidAssetValue, 0);

  const renderModalContent = () => {
    if (modal === "assets") {
      if (assets.length === 0) {
        return <p className="text-sm text-slate-400">Kayıtlı varlık bulunmuyor.</p>;
      }
      return (
        <div className="space-y-3">
          {assets.map((asset) => (
            <article
              key={asset.id}
              className="rounded-2xl border border-white/10 bg-black/40 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-white">{asset.name}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    {asset.assetType} - {formatKind(asset.assetKind, asset.isLiquid)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-white">
                  <span>{formatCurrency(asset.value, asset.currency)}</span>
                  <span className="block text-xs font-normal text-slate-400">
                    ≈ {formatCurrency(asset.valueTry, "TRY")}
                  </span>
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Güncellendi: {dateFormatter.format(new Date(asset.updatedAt))}
              </p>
            </article>
          ))}
        </div>
      );
    }

    if (modal === "obligations") {
      return (
        <div className="space-y-3">
          {upcomingObligations.length === 0 && (
            <p className="text-sm text-slate-400">Aktif yükümlülük yok.</p>
          )}
          {upcomingObligations.map((obligation) => (
            <article
              key={obligation.id}
              className="rounded-2xl border border-white/10 bg-black/40 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-base font-semibold text-white">{obligation.name}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {obligation.category} - {formatObligationRecurrence(obligation)}
                    </p>
                </div>
                <p className="text-sm font-semibold text-white">
                  {obligation.amount
                    ? (
                      <>
                        <span>{formatCurrency(obligation.amount, obligation.currency ?? "TRY")}</span>
                        <span className="block text-xs font-normal text-slate-400">
                          ≈ {formatCurrency(obligation.amountTry ?? 0, "TRY")}
                        </span>
                      </>
                    )
                    : "-"}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Sonraki tarih:{" "}
                {obligation.nextDue
                  ? new Date(obligation.nextDue).toLocaleString("tr-TR")
                  : "—"}
              </p>
              {obligation.notes && (
                <p className="mt-2 text-sm text-slate-300">{obligation.notes}</p>
              )}
            </article>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {importantReminders.length === 0 && (
              <p className="text-sm text-slate-400">Çok önemli görev yok.</p>
        )}
        {importantReminders.map((reminder) => (
          <article
            key={reminder.id}
            className="rounded-2xl border border-white/10 bg-black/40 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-white">{reminder.title}</p>
              <span className="text-xs text-amber-200">
                {daysUntil(reminder.dueAt)} gün
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {new Date(reminder.dueAt).toLocaleString("tr-TR")}
            </p>
            {reminder.related && (
              <p className="mt-2 text-sm text-slate-300">Bağlantı: {reminder.related}</p>
            )}
            {reminder.description && (
              <p className="mt-1 text-sm text-slate-400">{reminder.description}</p>
            )}
          </article>
        ))}
      </div>
    );
  };

  const modalTitle =
    modal === "assets"
      ? "Portföy dağılımı"
      : modal === "obligations"
        ? "Önümüzdeki ödemeler / resmi işler"
        : "Öncelikli hatırlatmalar";

  const modalLabel =
    modal === "assets"
      ? "Varlıklar"
      : modal === "obligations"
        ? "Aktif yükümlülükler"
        : "Çok önemli görevler";

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-linear-to-br from-slate-900 via-slate-900/80 to-slate-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full border border-indigo-300/40 bg-indigo-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.4em] text-indigo-200">
            Önemli özet
          </span>
          <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
            varlıklar / yükümlülükler / hatırlatmalar / günlük / düzenler
          </span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <button
            type="button"
          onClick={() => setModal("assets")}
          className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-indigo-200/60 hover:bg-white/10"
        >
          <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-200">
            Toplam Varlık (TRY)
          </p>
          <p className="text-2xl font-semibold text-white">
            {formatCurrency(totalAssetValue, "TRY")}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-white">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-200">Likit</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(liquidAssetValue, "TRY")}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-rose-200">Sabit</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(stableAssetValue, "TRY")}</p>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-400">detay için tıkla</p>
        </button>
          <button
            type="button"
            onClick={() => setModal("obligations")}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-rose-200/60 hover:bg-white/10"
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-rose-200">
              Aktif Yükümlülük
            </p>
            <p className="text-2xl font-semibold text-white">
              {upcomingObligations.length}
            </p>
            <p className="text-xs text-slate-400">detay için tıkla</p>
          </button>
          <button
            type="button"
            onClick={() => setModal("reminders")}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-amber-200/60 hover:bg-white/10"
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200">
              Çok önemli
            </p>
            <p className="text-2xl font-semibold text-white">
              {importantReminders.length}
            </p>
            <p className="text-xs text-slate-400">detay için tıkla</p>
          </button>
        </div>
      </section>
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8"
          onClick={close}
        >
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {modalLabel}
                </p>
                <h2 className="text-2xl font-semibold text-white">{modalTitle}</h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60"
              >
                Kapat
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-1">{renderModalContent()}</div>
          </div>
        </div>
      )}
    </>
  );
}

function formatObligationRecurrence(obligation: ObligationDetail) {
  if (!obligation.isRecurring || !obligation.recurrenceInterval || !obligation.recurrenceUnit) {
    return "Tek sefer";
  }
  const unitLabel = obligation.recurrenceUnit === "week" ? "hafta" : "ay";
  return `${obligation.recurrenceInterval} ${unitLabel}`;
}

function formatKind(assetKind: string | null, isLiquid: boolean) {
  if (assetKind === "personal_valuable") return "Personal Valuable";
  if (assetKind === "stable") return "Sabit";
  if (assetKind === "liquid") return "Likit";
  return isLiquid ? "Likit" : "Sabit";
}
