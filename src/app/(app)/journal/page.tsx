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
  const entryTotal = entries.length;
  const now = new Date();
  const entriesThisMonth = entries.filter((entry) => {
    const date = new Date(entry.entryDate);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const lastEntryDate = entries[0]?.entryDate
    ? new Date(entries[0].entryDate).toLocaleDateString("tr-TR")
    : "Kayıt yok";
  const journalHighlights = [
    {
      title: "Toplam kayıt",
      value: `${entryTotal}`,
      hint: "günlük not",
    },
    {
      title: "Bu ay",
      value: `${entriesThisMonth}`,
      hint: "yeni girdi",
    },
    {
      title: "Son güncelleme",
      value: lastEntryDate,
      hint: "en güncel not",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="rounded-3xl border border-sky-400/50 bg-sky-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-sky-200">Günlük</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Düşünce ve karar arşivi</h2>
          <p className="mt-2 max-w-3xl text-sm text-sky-100/80">
            Önemli notları tek yerde topla, yinelemeli düşünceleri tarihlendir ve ilerlemeyi izle.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {journalHighlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-200"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-sky-200">{item.title}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              <p className="text-xs text-slate-400">{item.hint}</p>
            </article>
          ))}
        </div>
      </section>
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



