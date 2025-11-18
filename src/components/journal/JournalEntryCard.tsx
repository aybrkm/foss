"use client";

import { useState } from "react";

type Entry = {
  id: string;
  title: string | null;
  body: string;
  entryDate: string;
  relatedAssetId: string | null;
  relatedObligationId: string | null;
};

type Action = (formData: FormData) => Promise<void>;

type Props = {
  entry: Entry;
  onUpdate: Action;
  onDelete: Action;
};

export function JournalEntryCard({ entry, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formattedDate = new Date(entry.entryDate).toLocaleDateString("tr-TR");
  const dateInputValue = entry.entryDate.slice(0, 10);

  return (
    <>
      <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{formattedDate}</p>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="rounded-full border border-sky-400/30 px-3 py-1 font-semibold text-sky-200 transition hover:bg-sky-400/10"
            >
              {isEditing ? "İptal" : "Düzenle"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-full border border-rose-400/30 px-3 py-1 font-semibold text-rose-200 transition hover:bg-rose-400/10"
            >
              Sil
            </button>
          </div>
        </div>

        {isEditing ? (
          <form action={onUpdate} className="mt-4 space-y-3">
            <input type="hidden" name="entryId" value={entry.id} />
            <input
              name="title"
              defaultValue={entry.title ?? ""}
              placeholder="Başlık"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-slate-500"
            />
            <input
              type="date" min="1000-01-01" max="5000-12-31"
              name="entryDate"
              defaultValue={dateInputValue}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white"
            />
            <textarea
              name="body"
              defaultValue={entry.body}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-slate-500"
              required
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400"
                onClick={() => setIsEditing(false)}
              >
                Kaydet
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                onClick={() => setIsEditing(false)}
              >
                Vazgeç
              </button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="mt-2 text-xl font-semibold text-white">{entry.title ?? "Not"}</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{entry.body}</p>
            {(entry.relatedAssetId || entry.relatedObligationId) && (
              <p className="mt-3 text-xs text-slate-400">
                Linked: {entry.relatedAssetId ?? entry.relatedObligationId}
              </p>
            )}
          </>
        )}
      </article>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowDeleteConfirm(false);
            }
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl">
            <h4 className="text-lg font-semibold">Günlüğü sil?</h4>
            <p className="mt-2 text-sm text-slate-300">
              Bu işlem geri alınamaz. Not kalıcı olarak silinecek.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <form action={onDelete} className="flex-1">
                <input type="hidden" name="entryId" value={entry.id} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Silmeyi onayla
                </button>
              </form>
              <button
                type="button"
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
