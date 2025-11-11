import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

const ranges = [
  { label: "Bu hafta", maxDays: 7 },
  { label: "Önümüzdeki ay", maxDays: 30 },
  { label: "Önümüzdeki 6 ay", maxDays: 180 },
] as const;

const DAY_MS = 1000 * 60 * 60 * 24;

type ReminderCard = {
  id: string;
  title: string;
  dueAt: string;
  isVeryImportant: boolean;
  related: string | null;
  daysLeft: number;
};

async function createReminder(formData: FormData) {
  "use server";
  const title = formData.get("title")?.toString().trim();
  const dueAt = formData.get("dueAt")?.toString();
  const description = formData.get("description")?.toString().trim() || null;
  const relatedObligationId = formData.get("related")?.toString() || null;
  const isVeryImportant = formData.get("isVeryImportant") === "on";

  if (!title || !dueAt) {
    throw new Error("Eksik hatırlatma bilgisi");
  }

  await prisma.reminder.create({
    data: {
      title,
      dueAt: new Date(dueAt),
      description,
      relatedObligationId: relatedObligationId || null,
      isVeryImportant,
    },
  });

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
}

export default async function RemindersPage() {
  const [reminders, obligations] = await Promise.all([
    prisma.reminder.findMany({ orderBy: { dueAt: "asc" } }),
    prisma.obligation.findMany({ select: { id: true, name: true } }),
  ]);

  const obligationMap = new Map(obligations.map((obligation) => [obligation.id, obligation.name]));
  const referenceMs = new Date().getTime();

  const reminderCards: ReminderCard[] = reminders.map((reminder) => {
    const dueAt = reminder.dueAt.toISOString();
    const daysLeft = Math.ceil((new Date(dueAt).getTime() - referenceMs) / DAY_MS);
    return {
      id: reminder.id,
      title: reminder.title,
      dueAt,
      isVeryImportant: reminder.isVeryImportant,
      related: reminder.relatedObligationId
        ? obligationMap.get(reminder.relatedObligationId) ?? null
        : null,
      daysLeft,
    };
  });

  const grouped = ranges.map((range, index) => {
    const min = index === 0 ? 0 : ranges[index - 1].maxDays;
    return {
      label: range.label,
      reminders: reminderCards.filter(
        (reminder) => reminder.daysLeft > min && reminder.daysLeft <= range.maxDays,
      ),
    };
  });

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-amber-300">Reminders</p>
        <h2 className="text-3xl font-semibold text-white">
          Kişisel işleri zaman dilimine göre grupla
        </h2>
        <p className="max-w-2xl text-slate-300">
          reminders tablosu: start_at, due_at, is_very_important, related_obligation_id
          ile dashboard’daki “ÇOK ÖNEMLİ” kartlarını besler.
        </p>
      </header>

      <form
        action={createReminder}
        className="grid gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-3"
      >
        <input
          name="title"
          placeholder="Başlık"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          required
        />
        <input
          type="datetime-local"
          name="dueAt"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          required
        />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" name="isVeryImportant" className="size-4 accent-amber-500" />
          Çok önemli
        </label>
        <input
          name="description"
          placeholder="Açıklama (opsiyonel)"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 md:col-span-2"
        />
        <select
          name="related"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          defaultValue=""
        >
          <option value="">Obligation bağlantısı (opsiyonel)</option>
          {obligations.map((obligation) => (
            <option key={obligation.id} value={obligation.id}>
              {obligation.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
        >
          Hatırlatma ekle
        </button>
      </form>

      <div className="grid gap-6 md:grid-cols-3">
        {grouped.map((bucket) => (
          <article
            key={bucket.label}
            className="rounded-3xl border border-white/10 bg-slate-900/60 p-5"
          >
            <h3 className="text-xl font-semibold text-white">{bucket.label}</h3>
            <div className="mt-4 space-y-4">
              {bucket.reminders.length === 0 && (
                <p className="text-sm text-slate-500">Kayıt yok.</p>
              )}
              {bucket.reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{reminder.title}</p>
                    <span
                      className={`text-xs ${
                        reminder.isVeryImportant ? "text-rose-300" : "text-slate-400"
                      }`}
                    >
                      {reminder.isVeryImportant ? "Çok önemli" : `${reminder.daysLeft} gün`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(reminder.dueAt).toLocaleString("tr-TR")}
                  </p>
                  {reminder.related && (
                    <p className="text-xs text-slate-400">Related: {reminder.related}</p>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
