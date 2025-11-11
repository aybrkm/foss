import prisma from "@/lib/prisma";

export default async function JournalPage() {
  const entries = await prisma.journalEntry.findMany({
    orderBy: { entryDate: "desc" },
  });

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

      <div className="grid gap-5 md:grid-cols-2">
        {entries.map((entry) => (
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
            <p className="mt-3 text-sm text-slate-300 whitespace-pre-wrap">
              {entry.body}
            </p>
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
