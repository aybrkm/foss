import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { JournalEntryCard } from "@/components/journal/JournalEntryCard";
import { requireUserId } from "@/lib/auth";

async function createEntry(formData: FormData) {
  "use server";
  const userId = await requireUserId();
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
      userId,
    },
  });

  revalidatePath("/journal");
}

async function updateEntry(formData: FormData) {
  "use server";
  const userId = await requireUserId();
  const entryId = formData.get("entryId")?.toString();
  if (!entryId) {
    throw new Error("Günlük kaydı bulunamadı");
  }

  const title = formData.get("title")?.toString().trim() || null;
  const body = formData.get("body")?.toString().trim();
  const entryDate = formData.get("entryDate")?.toString();

  if (!body) {
    throw new Error("Günlük metni gerekli");
  }

  await prisma.journalEntry.updateMany({
    where: { id: entryId, userId },
    data: {
      title,
      body,
      entryDate: entryDate ? new Date(entryDate) : undefined,
    },
  });

  revalidatePath("/journal");
}

async function deleteEntry(formData: FormData) {
  "use server";
  const userId = await requireUserId();
  const entryId = formData.get("entryId")?.toString();
  if (!entryId) {
    throw new Error("Silinecek günlük bulunamadı");
  }

  await prisma.journalEntry.deleteMany({ where: { id: entryId, userId } });
  revalidatePath("/journal");
}

export default async function JournalPage() {
  const userId = await requireUserId();
  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { entryDate: "desc" },
  });
  type EntryRow = (typeof entries)[number];

  const entryTotal = entries.length;
  const now = new Date();
  const entriesThisMonth = entries.filter((entry: EntryRow) => {
    const date = new Date(entry.entryDate);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const lastEntryDate = entries[0]?.entryDate
    ? new Date(entries[0].entryDate).toLocaleDateString("tr-TR")
    : "Kayıt yok";

  const journalHighlights = [
    { title: "Toplam kayıt", value: `${entryTotal}`, hint: "günlük not" },
    { title: "Bu ay", value: `${entriesThisMonth}`, hint: "yeni girdi" },
    { title: "Son güncelleme", value: lastEntryDate, hint: "en güncel not" },
  ];

  const clientEntries = entries.map((entry: EntryRow) => ({
    id: entry.id,
    title: entry.title,
    body: entry.body,
    entryDate: entry.entryDate.toISOString(),
    relatedAssetId: entry.relatedAssetId,
    relatedObligationId: entry.relatedObligationId,
  }));

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="rounded-3xl border border-sky-400/50 bg-sky-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-sky-200">Günlük</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Düşünce ve karar arşivi</h2>
          <p className="mt-2 max-w-3xl text-sm text-sky-100/80">
            Önemli notları tek yerde topla, yinelenen düşünceleri tarihlendir ve ilerlemeyi izle.
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
          type="date" min="1000-01-01" max="5000-12-31"
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
        {clientEntries.map((entry: (typeof clientEntries)[number]) => (
          <JournalEntryCard key={entry.id} entry={entry} onUpdate={updateEntry} onDelete={deleteEntry} />
        ))}
      </div>
    </div>
  );
}
