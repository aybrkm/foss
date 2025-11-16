"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmDoneButton } from "@/components/forms/ConfirmDoneButton";

type ReminderRow = {
  id: string;
  title: string;
  description: string | null;
  dueAt: string;
  daysLeft: number;
  isVeryImportant: boolean;
  isDone: boolean;
  related: string | null;
};

type Props = {
  reminders: ReminderRow[];
  markReminderDone: (formData: FormData) => Promise<void> | void;
  deleteReminder: (formData: FormData) => Promise<void> | void;
};

export function RemindersTable({ reminders, markReminderDone, deleteReminder }: Props) {
  const [showCompleted, setShowCompleted] = useState(false);
  const visibleReminders = showCompleted ? reminders : reminders.filter((reminder) => !reminder.isDone);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-5 py-4">Hatırlatma</th>
              <th className="px-5 py-4">Durum</th>
              <th className="px-5 py-4">İlişki</th>
              <th className="px-5 py-4 text-right">Tarih</th>
              <th className="px-5 py-4 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {visibleReminders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                  {showCompleted ? "Tamamlanan hatırlatma yok." : "Aktif hatırlatma bulunmuyor."}
                </td>
              </tr>
            ) : (
              visibleReminders.map((reminder) => {
                const { label: dayLabel, className: dayClass } = getDayMeta(reminder.daysLeft);
                const dueDate = new Date(reminder.dueAt);
                const statusText = reminder.isVeryImportant ? "Çok önemli" : "Normal";
                const statusClass = reminder.isDone
                  ? "text-slate-500 line-through"
                  : reminder.isVeryImportant
                    ? "text-rose-300"
                    : "text-white";

                return (
                  <tr key={reminder.id} className={reminder.isDone ? "text-slate-500" : "text-white"}>
                    <td className="px-5 py-4">
                      <p className={`font-semibold ${statusClass}`}>{reminder.title}</p>
                      {reminder.description && (
                        <p className="text-xs text-slate-400">{reminder.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className={`text-xs ${statusClass}`}>{statusText}</p>
                      <p className={`text-xs ${dayClass}`}>{dayLabel}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-300 text-xs">
                      {reminder.related ?? "İlişki yok"}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-300 text-xs">
                      <p>{dueDate.toLocaleDateString("tr-TR")}</p>
                      <p>{dueDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/reminders/${reminder.id}/edit`}
                          className="inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-1 text-xs text-white transition hover:border-white/60"
                          aria-label="Hatırlatmayı düzenle"
                        >
                          Düzenle
                        </Link>
                        {!reminder.isDone && (
                          <ConfirmDoneButton
                            action={markReminderDone}
                            id={reminder.id}
                            label="Tamamlandı"
                            description="Hatırlatmalar için tamamlandı işlemi geri alınamaz."
                          />
                        )}
                        <form action={deleteReminder}>
                          <input type="hidden" name="id" value={reminder.id} />
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
          <p className="text-sm text-slate-300">Arşivi tabloya ekle</p>
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
          <span className="sr-only">Tamamlananları göster</span>
        </button>
      </div>
    </div>
  );
}

function getDayMeta(daysLeft: number) {
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
