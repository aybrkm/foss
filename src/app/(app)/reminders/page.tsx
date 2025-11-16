import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ObligationPicker } from "@/components/forms/ObligationPicker";
import { RemindersTable } from "@/components/reminders/RemindersTable";

const DAY_MS = 1000 * 60 * 60 * 24;

type ReminderCard = {
  id: string;
  title: string;
  dueAt: string;
  description: string | null;
  isVeryImportant: boolean;
  isDone: boolean;
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

async function markReminderDone(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) {
    throw new Error("Hatırlatma bulunamadı");
  }
  await prisma.reminder.update({
    where: { id },
    data: { isDone: true },
  });

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
}

async function deleteReminder(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) {
    throw new Error("Hatırlatma bulunamadı");
  }

  await prisma.reminder.delete({
    where: { id },
  });

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
}

export default async function RemindersPage() {
  const [reminders, obligations] = await Promise.all([
    prisma.reminder.findMany({ orderBy: { dueAt: "asc" } }),
    prisma.obligation.findMany({
      select: {
        id: true,
        name: true,
        isDone: true,
        category: true,
        amount: true,
        currency: true,
        nextDue: true,
        notes: true,
      },
    }),
  ]);
  type ReminderRow = (typeof reminders)[number];
  type ObligationOption = (typeof obligations)[number];

  const obligationMap = new Map(obligations.map((obligation: ObligationOption) => [obligation.id, obligation.name]));
  const referenceMs = new Date().getTime();

  const reminderCards: ReminderCard[] = reminders.map((reminder: ReminderRow) => {
    const dueAt = reminder.dueAt.toISOString();
    const daysLeft = Math.ceil((new Date(dueAt).getTime() - referenceMs) / DAY_MS);
    return {
      id: reminder.id,
      title: reminder.title,
      dueAt,
      description: reminder.description ?? null,
      isVeryImportant: reminder.isVeryImportant,
      isDone: reminder.isDone,
      related: reminder.relatedObligationId
        ? obligationMap.get(reminder.relatedObligationId) ?? null
        : null,
      daysLeft,
    };
  });

  const activeReminders = reminderCards.filter((reminder) => !reminder.isDone);
  const doneReminders = reminderCards.filter((reminder) => reminder.isDone);
  const importantActive = activeReminders.filter((reminder) => reminder.isVeryImportant).length;
  const reminderHighlights = [
    {
      title: "Aktif hatırlatma",
      value: `${activeReminders.length}`,
      hint: "takip edilen görev",
    },
    {
      title: "Çok önemli",
      value: `${importantActive}`,
      hint: "kritik işaretli",
    },
    {
      title: "Tamamlanan",
      value: `${doneReminders.length}`,
      hint: "arşivde",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="rounded-3xl border border-amber-400/50 bg-amber-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200">Hatırlatmalar</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Zamanlanmış işleri takip et</h2>
          <p className="mt-2 max-w-3xl text-sm text-amber-100/80">
            Önümüzdeki hafta ve ay içindeki kritik görevleri grupla, kritik işaretli olanları ilk bakışta yakala.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {reminderHighlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-200"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200">{item.title}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              <p className="text-xs text-slate-400">{item.hint}</p>
            </article>
          ))}
        </div>
      </section>
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
        <ObligationPicker
          name="related"
          options={obligations
            .filter((obligation: ObligationOption) => !obligation.isDone)
            .map((obligation: ObligationOption) => ({
              id: obligation.id,
              name: obligation.name,
              category: obligation.category,
              amount: obligation.amount ? Number(obligation.amount) : null,
              currency: obligation.currency ?? undefined,
              nextDue: obligation.nextDue ? obligation.nextDue.toISOString() : null,
              notes: obligation.notes,
            }))}
        />
        <button
          type="submit"
          className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
        >
          Hatırlatma ekle
        </button>
      </form>

      <RemindersTable
        reminders={reminderCards}
        markReminderDone={markReminderDone}
        deleteReminder={deleteReminder}
      />
    </div>
  );
}


