"use client";

import { useState } from "react";
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
  isRecurring: boolean;
  recurrenceInterval: number | null;
  recurrenceUnit: "week" | "month" | null;
  nextDue: string | null;
  isActive: boolean;
  isDone: boolean;
  daysLeft: number | null;
};

type Props = {
  obligations: ObligationTableRow[];
  nowMs: number;
  markObligationDone: (formData: FormData) => Promise<void> | void;
  deleteObligation: (formData: FormData) => Promise<void> | void;
};

export function ObligationsTable({
  obligations,
  nowMs,
  markObligationDone,
  deleteObligation,
}: Props) {
  const [showCompleted, setShowCompleted] = useState(false);

  const visibleObligations = showCompleted ? obligations : obligations.filter((obligation) => !obligation.isDone);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-5 py-4">Yukumluluk</th>
              <th className="px-5 py-4">Kategori</th>
              <th className="px-5 py-4">Tekrar</th>
              <th className="px-5 py-4 text-right">Tutar</th>
              <th className="px-5 py-4 text-right">Next Due</th>
              <th className="px-5 py-4 text-right">Duzenle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {visibleObligations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                  {showCompleted ? "Henuz tamamlanan yok." : "Aktif yukumluluk bulunmuyor."}
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
                    </td>
                    <td className={`px-5 py-4 capitalize text-slate-300 ${textClass}`}>{obligation.category}</td>
                    <td className={`px-5 py-4 text-slate-300 ${textClass}`}>{formatRecurrence(obligation)}</td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {obligation.amountNumber ? (
                        <>
                          <span className={`${statusColor} ${textClass}`}>
                            {formatCurrency(obligation.amountNumber, obligation.currency ?? "TRY")}
                          </span>
                          <span className="block text-xs font-normal text-slate-400">
                            TRY {formatCurrency(obligation.amountTry ?? 0, "TRY")}
                          </span>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {nextDueDate ? (
                        <>
                          <p className={textClass || "text-slate-400"}>
                            {nextDueDate.toLocaleDateString("tr-TR")}
                          </p>
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
                            aria-label="Yukumlulugu duzenle"
                          >
                            Duzenle
                          </Link>
                        )}
                        {!obligation.isDone && (
                          <ConfirmDoneButton
                            action={markObligationDone}
                            id={obligation.id}
                            description="Tamamlandi olarak isaretlenen geri alinamaz."
                          />
                        )}
                        <form action={deleteObligation}>
                          <input type="hidden" name="id" value={obligation.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full border border-rose-400/40 px-3 py-1 text-xs text-rose-200 transition hover:border-rose-300 hover:text-white"
                          >
                            Sil
                          </button>
                        </form>
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
          <p className="text-sm text-slate-300">Gerektiginde arsivi listeye ekle</p>
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
    return { label: `${Math.abs(daysLeft)} gun gecikti`, className: "text-rose-400 font-bold animate-pulse" };
  }
  if (daysLeft === 0) {
    return { label: "Bugun", className: "text-amber-400 font-bold animate-pulse" };
  }
  if (daysLeft <= 14) {
    return { label: `${daysLeft} gun kaldi`, className: "text-rose-300 font-bold animate-pulse" };
  }
  return { label: `${daysLeft} gun kaldi`, className: "text-emerald-300 font-semibold" };
}
