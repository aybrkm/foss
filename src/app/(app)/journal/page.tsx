import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

async function createEntry(formData: FormData) {
  "use server";
  const title = formData.get("title")?.toString().trim() || null;
  const body = formData.get("body")?.toString().trim();
  const entryDate = formData.get("entryDate")?.toString();

  if (!body) {
    throw new Error("Günlük metni gerekli");
  }

  await prisma.journalEntry.create({
    data: {
      title,
      body,
      entryDate: entryDate ? new Date(entryDate) : undefined,
    },
  });

  revalidatePath("/journal");
}

export default async function JournalPage() {
  const entries = await prisma.journalEntry.findMany({
    orderBy: { entryDate: "desc" },
  });
  type JournalEntryRow = (typeof entries)[number];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-sky-300">Journal</p>
        <h2 className="text-3xl font-semibold text-white">
          Günlük / düşünce / karar kayıtları
        </h2>
        <p className="max-w-2xl text-slate-300">
          journal_entries tablosu: title, body, entry_date, related_asset_id,
          related_obligation_id alanlarıyla zihinsel yükü boşalt.
        </p>
      </header>

      <form
        action={createEntry}
        className="grid gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-2"
      >
        <input
          name="title"
          placeholder="Başlık (opsiyonel)"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
        />
        <input
          type="date"
          name="entryDate"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        />
        <textarea
          name="body"
          placeholder="Notunu yaz..."
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 md:col-span-2"
          rows={4}
          required
        />
        <button
          type="submit"
          className="rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 md:col-span-2"
        >
          Günlük kaydet
        </button>
      </form>

      <div className="grid gap-5 md:grid-cols-2">
        {entries.map((entry: JournalEntryRow) => (
          <article
            key={entry.id}
            className="rounded-3xl border border-white/10 bg-slate-900/60 p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {new Date(entry.entryDate).toLocaleDateString("tr-TR")}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              {entry.title ?? "Not"}
            </h3>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{entry.body}</p>
            {(entry.relatedAssetId || entry.relatedObligationId) && (
              <p className="mt-3 text-xs text-slate-400">
                Linked: {entry.relatedAssetId ?? entry.relatedObligationId}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
