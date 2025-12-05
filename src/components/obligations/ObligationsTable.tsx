"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { ConfirmDoneButton } from "@/components/forms/ConfirmDoneButton";

type ObligationTableRow = {
  id: string;
  name: string;
  category: string;
  amountNumber: number | null;
  amountTry: number | null;
  currency: string | null;
  isBelli: boolean;
  isRecurring: boolean;
  recurrenceInterval: number | null;
  recurrenceUnit: "week" | "month" | null;
  nextDue: string | null;
  isActive: boolean;
  isDone: boolean;
  daysLeft: number | null;
  digitalAccountName?: string | null;
  digitalAccountIdentifier?: string | null;
};

type Props = {
  obligations: ObligationTableRow[];
  nowMs: number;
  markObligationDone: (formData: FormData) => Promise<void> | void;
  deleteObligation: (formData: FormData) => Promise<void> | void;
  quickSetAmount: (formData: FormData) => Promise<void> | void;
  currencies: readonly string[];
};

export function ObligationsTable({
  obligations,
  nowMs,
  markObligationDone,
  deleteObligation,
  quickSetAmount,
  currencies,
}: Props) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingAmountId, setEditingAmountId] = useState<string | null>(null);
  const [hoveredBlockedId, setHoveredBlockedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ObligationTableRow | null>(null);
  const [confirmComplete, setConfirmComplete] = useState<ObligationTableRow | null>(null);

  const visibleObligations = showCompleted ? obligations : obligations.filter((obligation) => !obligation.isDone);

  const formatFixedDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleQuickSave = async (event: FormEvent<HTMLFormElement>, obligationId: string) => {
    event.preventDefault();
    setSavingId(obligationId);
    try {
      const formData = new FormData(event.currentTarget);
      await quickSetAmount(formData);
      setEditingAmountId(null);
    } catch (error) {
      console.error("Quick amount update failed", error);
    } finally {
      setSavingId(null);
    }
  };

  const preventInvalidNumberKey = (event: KeyboardEvent<HTMLInputElement>) => {
    const allowedControlKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "Enter",
    ];
    if (allowedControlKeys.includes(event.key)) {
      return;
    }
    if (event.key === "." || event.key === ",") {
      const value = event.currentTarget.value;
      if (value.includes(".") || value.includes(",")) {
        event.preventDefault();
      }
      return;
    }
    if (/^[0-9]$/.test(event.key)) {
      return;
    }
    event.preventDefault();
  };

  const preventInvalidBeforeInput = (event: FormEvent<HTMLInputElement>) => {
    const native = event.nativeEvent as InputEvent;
    const data = native.data;
    if (!data) return;
    if (!/^[0-9.,]+$/.test(data)) {
      event.preventDefault();
      return;
    }
    const { selectionStart, selectionEnd, value } = event.currentTarget;
    if (selectionStart === null || selectionEnd === null) return;
    const proposed = value.slice(0, selectionStart) + data + value.slice(selectionEnd);
    const normalized = proposed.replace(",", ".");
    if (!/^\d*\.?\d*$/.test(normalized)) {
      event.preventDefault();
    }
  };

  return (
    <div className="space-y-4">
      {editingAmountId && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setEditingAmountId(null)}
          aria-label="Kapat"
        />
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-slate-950/95 p-5 shadow-2xl shadow-black/60">
            <h3 className="text-lg font-semibold text-white">Silme onayı</h3>
            <p className="mt-2 text-sm text-slate-300">
              <span className="font-semibold text-white">{confirmDelete.name}</span> kaydını silmek istediğine emin misin?
              Bu işlem geri alınamaz.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-white/25 px-4 py-2 text-sm text-white transition hover:border-white/50"
                onClick={() => setConfirmDelete(null)}
              >
                Vazgeç
              </button>
              <form action={deleteObligation}>
                <input type="hidden" name="id" value={confirmDelete.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-rose-400/60 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500/30"
                  onClick={() => setConfirmDelete(null)}
                >
                  Evet, sil
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {confirmComplete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-slate-950/95 p-5 shadow-2xl shadow-black/60">
            <h3 className="text-lg font-semibold text-white">Tamamlama onayı</h3>
            <p className="mt-2 text-sm text-slate-300">
              <span className="font-semibold text-white">{confirmComplete.name}</span> kaydını tamamlandı olarak işaretlemek
              istediğine emin misin? Bu işlem geri alınamaz.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-white/25 px-4 py-2 text-sm text-white transition hover:border-white/50"
                onClick={() => setConfirmComplete(null)}
              >
                Vazgeç
              </button>
              <form action={markObligationDone}>
                <input type="hidden" name="id" value={confirmComplete.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-emerald-400/60 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500/30"
                  onClick={() => setConfirmComplete(null)}
                >
                  Evet, tamamla
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <div className="relative overflow-visible rounded-3xl border border-white/10 bg-slate-900/60">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-5 py-4">Yükümlülük</th>
              <th className="px-5 py-4">Kategori</th>
              <th className="px-5 py-4">Tekrar</th>
              <th className="px-5 py-4 text-right">Tutar</th>
              <th className="px-5 py-4 text-right">Sonraki tarih</th>
              <th className="px-5 py-4 text-right">Düzenle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {visibleObligations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                  {showCompleted ? "Henüz tamamlanan yok." : "Aktif yükümlülük bulunmuyor."}
                </td>
              </tr>
            ) : (
              visibleObligations.map((obligation) => {
                const nextDueDate = obligation.nextDue ? new Date(obligation.nextDue) : null;
                const isOverdue =
                  nextDueDate && !obligation.isDone ? nextDueDate.getTime() < nowMs : false;
                const textClass = obligation.isDone ? "text-xs line-through" : "";
                const statusColor = obligation.isDone ? "text-slate-500" : "text-white";
                const { label: dayLabel, className: dayClass } = getDayMeta(obligation.daysLeft);
                const needsAmount = !obligation.isBelli;
                const amountLabel = obligation.amountNumber
                  ? formatCurrency(obligation.amountNumber, obligation.currency ?? "TRY")
                  : "Belirtilmedi";
                const isSaving = savingId === obligation.id;

                return (
                  <tr
                    key={obligation.id}
                    className={`hover:bg-white/5 ${isOverdue ? "bg-rose-950/40" : ""} ${
                      obligation.isDone ? "text-slate-500" : "text-white"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className={`font-semibold ${statusColor} ${textClass}`}>{obligation.name}</p>
                      <p className={`text-xs ${obligation.isDone ? "text-slate-500 line-through" : "text-slate-400"}`}>
                        {obligation.isActive ? "Aktif" : "Pasif"}
                      </p>
                      {obligation.digitalAccountName && (
                        <p className="text-[11px] uppercase tracking-[0.25em] text-fuchsia-200">
                          Dijital: {obligation.digitalAccountName}
                          {obligation.digitalAccountIdentifier ? ` (${obligation.digitalAccountIdentifier})` : ""}
                        </p>
                      )}
                    </td>
                    <td className={`px-5 py-4 capitalize text-slate-300 ${textClass}`}>{obligation.category}</td>
                    <td className={`px-5 py-4 text-slate-300 ${textClass}`}>{formatRecurrence(obligation)}</td>
                    <td className="relative px-5 py-4 text-right font-semibold">
                      <button
                        type="button"
                        className="text-right text-white underline-offset-4 transition hover:underline hover:text-fuchsia-200 cursor-pointer"
                        onClick={() =>
                          setEditingAmountId((prev) => (prev === obligation.id ? null : obligation.id))
                        }
                      >
                        <span
                          className={
                            needsAmount
                              ? "text-[10px] uppercase tracking-[0.25em] text-slate-200"
                              : `${statusColor} ${textClass}`
                          }
                        >
                          {amountLabel}
                        </span>
                      </button>
                      {editingAmountId === obligation.id && (
                        <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-white/30 bg-slate-950/95 p-3 shadow-2xl shadow-black/60 backdrop-blur-md">
                          <form
                            onSubmit={(event) => handleQuickSave(event, obligation.id)}
                            className="space-y-2 text-xs text-white"
                          >
                            <input type="hidden" name="id" value={obligation.id} />
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                name="amount"
                                min="0.01"
                                step="0.01"
                                defaultValue={obligation.amountNumber ?? undefined}
                                placeholder="Tutar"
                                inputMode="decimal"
                                pattern="\\d*\\.?\\d*"
                                onKeyDown={preventInvalidNumberKey}
                                onBeforeInput={preventInvalidBeforeInput}
                                className="w-32 rounded-lg border border-white/10 bg-slate-900/80 px-2 py-1 text-right text-xs text-white placeholder:text-slate-500"
                                required
                              />
                              <select
                                name="currency"
                                defaultValue={obligation.currency ?? currencies[0]}
                                className="rounded-lg border border-white/10 bg-slate-900/80 px-2 py-1 text-xs text-white"
                              >
                                {currencies.map((currency) => (
                                  <option key={currency} value={currency}>
                                    {currency}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white hover:border-white/40"
                                onClick={() => setEditingAmountId(null)}
                              >
                                Vazgeç
                              </button>
                              <button
                                type="submit"
                                disabled={isSaving}
                                aria-busy={isSaving}
                                className="rounded-lg border border-emerald-400/60 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {isSaving ? (
                                  <span className="inline-flex items-center gap-2">
                                    <span className="h-3 w-3 animate-spin rounded-full border border-white/60 border-t-transparent" />
                                    Kaydediliyor...
                                  </span>
                                ) : (
                                  "Kaydet"
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {nextDueDate ? (
                        <>
                          <p className={textClass || "text-slate-400"}>{formatFixedDate(nextDueDate)}</p>
                          <p className={`text-xs ${dayClass} mt-1`}>{dayLabel}</p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-500">Tarih yok</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!obligation.isDone && (
                          <Link
                            href={`/obligations/${obligation.id}/edit`}
                            className="inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-1 text-xs text-white transition hover:border-white/60"
                            aria-label="Yükümlülüğü düzenle"
                          >
                            Düzenle
                          </Link>
                        )}
                        {!obligation.isDone && needsAmount && (
                          <div
                            className="relative"
                            onMouseEnter={() => setHoveredBlockedId(obligation.id)}
                            onMouseLeave={() => setHoveredBlockedId(null)}
                          >
                            <button
                              type="button"
                              disabled
                              className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-white/20 px-3 py-1 text-xs text-slate-400"
                            >
                              Tamamlandı
                            </button>
                            {hoveredBlockedId === obligation.id && (
                              <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-lg border border-white/20 bg-slate-900 p-3 text-left text-xs text-white shadow-xl">
                                Tamamlamadan &ouml;nce fiyatı belirlemelisiniz.
                              </div>
                            )}
                          </div>
                        )}
                        {!obligation.isDone && !needsAmount && (
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-full border border-emerald-400/40 px-3 py-1 text-xs text-emerald-200 transition hover:border-emerald-300 hover:text-white"
                            onClick={() => setConfirmComplete(obligation)}
                          >
                            Tamamlandı
                          </button>
                        )}
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full border border-rose-400/40 px-3 py-1 text-xs text-rose-200 transition hover:border-rose-300 hover:text-white"
                          onClick={() => setConfirmDelete(obligation)}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/40 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tamamlananlar</p>
          <p className="text-sm text-slate-300">Gerektiğinde arşivi listeye ekle</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={showCompleted}
          onClick={() => setShowCompleted((prev) => !prev)}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
            showCompleted ? "bg-emerald-400/90" : "bg-slate-600"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
              showCompleted ? "translate-x-6" : "translate-x-2"
            }`}
          />
          <span className="sr-only">Tamamlananlar</span>
        </button>
      </div>
    </div>
  );
}

function formatRecurrence(obligation: Pick<ObligationTableRow, "isRecurring" | "recurrenceInterval" | "recurrenceUnit">) {
  if (!obligation.isRecurring || !obligation.recurrenceInterval || !obligation.recurrenceUnit) {
    return "Tek sefer";
  }
  const unitLabel = obligation.recurrenceUnit === "week" ? "hafta" : "ay";
  return `${obligation.recurrenceInterval} ${unitLabel}`;
}

function getDayMeta(daysLeft: number | null) {
  if (typeof daysLeft !== "number") {
    return { label: "Tarih yok", className: "text-slate-500" };
  }
  if (daysLeft < 0) {
    return { label: `${Math.abs(daysLeft)} gün gecikti`, className: "text-rose-400 font-bold animate-pulse" };
  }
  if (daysLeft === 0) {
    return { label: "Bugün", className: "text-amber-400 font-bold animate-pulse" };
  }
  if (daysLeft <= 14) {
    return { label: `${daysLeft} gün kaldı`, className: "text-rose-300 font-bold animate-pulse" };
  }
  return { label: `${daysLeft} gün kaldı`, className: "text-emerald-300 font-semibold" };
}
