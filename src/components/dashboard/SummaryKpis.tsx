"use client";

import { useState } from "react";
import { formatCurrency, daysUntil } from "@/lib/format";

type ObligationDetail = {
  id: string;
  name: string;
  category: string;
  frequency: string;
  amount: number | null;
  currency: string | null;
  nextDue: string | null;
  notes: string | null;
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
  upcomingObligations: ObligationDetail[];
  importantReminders: ReminderDetail[];
};

type ModalType = "obligations" | "reminders" | null;

export function SummaryKpis({
  totalAssetValue,
  liquidAssetValue,
  upcomingObligations,
  importantReminders,
}: Props) {
  const [modal, setModal] = useState<ModalType>(null);
  const close = () => setModal(null);

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full border border-indigo-300/40 bg-indigo-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.4em] text-indigo-200">
            önemli özet
          </span>
          <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
            assets / obligations / reminders / journal / layouts
          </span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-200">
              Toplam Varlık (TRY)
            </p>
            <p className="text-2xl font-semibold text-white">
              {formatCurrency(totalAssetValue, "TRY")}
            </p>
            <p className="text-xs text-slate-400">
              Likit {formatCurrency(liquidAssetValue, "TRY")}
            </p>
          </div>
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
              Çok Önemli
            </p>
            <p className="text-2xl font-semibold text-white">
              {importantReminders.length}
            </p>
            <p className="text-xs text-slate-400">detay için tıkla</p>
          </button>
        </div>
      </section>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {modal === "obligations" ? "Aktif Yükümlülükler" : "Çok Önemli Görevler"}
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  {modal === "obligations"
                    ? "Önümüzdeki ödemeler / resmi işlemler"
                    : "Öncelikli hatırlatmalar"}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60"
              >
                Kapat
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              {modal === "obligations" ? (
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
                          <p className="text-base font-semibold text-white">
                            {obligation.name}
                          </p>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            {obligation.category} • {obligation.frequency}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {obligation.amount
                            ? formatCurrency(
                                obligation.amount,
                                obligation.currency ?? "TRY",
                              )
                            : "-"}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400">
                        Next due:{" "}
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
              ) : (
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
                        <p className="text-base font-semibold text-white">
                          {reminder.title}
                        </p>
                        <span className="text-xs text-amber-200">
                          {daysUntil(reminder.dueAt)} gün
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {new Date(reminder.dueAt).toLocaleString("tr-TR")}
                      </p>
                      {reminder.related && (
                        <p className="mt-2 text-sm text-slate-300">
                          Related: {reminder.related}
                        </p>
                      )}
                      {reminder.description && (
                        <p className="mt-1 text-sm text-slate-400">
                          {reminder.description}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
