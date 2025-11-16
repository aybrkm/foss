import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditReminderPage({ params }: Props) {
  const { id } = await params;
  const reminderPromise = prisma.reminder.findUnique({
    where: { id },
  });
  const obligationsPromise = prisma.obligation.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const [reminder, obligations] = await Promise.all([reminderPromise, obligationsPromise]);

  if (!reminder) {
    notFound();
  }

  const reminderId = reminder.id;
  const dueAtValue = reminder.dueAt.toISOString().slice(0, 16);

  async function updateReminder(formData: FormData) {
    "use server";
    const title = formData.get("title")?.toString().trim();
    const dueAt = formData.get("dueAt")?.toString();
    const description = formData.get("description")?.toString().trim() || null;
    const relatedObligationId = formData.get("related")?.toString() || null;
    const isVeryImportant = formData.get("isVeryImportant") === "on";

    if (!title || !dueAt) {
      throw new Error("Eksik hatırlatma bilgisi");
    }

    await prisma.reminder.update({
      where: { id: reminderId },
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
    redirect("/reminders");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-amber-300">Reminders</p>
          <h1 className="text-3xl font-semibold text-white">Hatırlatmayı düzenle</h1>
          <p className="text-slate-300">{reminder.title}</p>
        </div>
        <Link
          href="/reminders"
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/60"
        >
          &larr; Listeye dön
        </Link>
      </div>

      <form
        action={updateReminder}
        className="grid gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-5 md:grid-cols-3"
      >
        <input
          name="title"
          defaultValue={reminder.title}
          placeholder="Başlık"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          required
        />
        <input
          type="datetime-local"
          name="dueAt"
          defaultValue={dueAtValue}
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          required
        />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="isVeryImportant"
            className="size-4 accent-amber-500"
            defaultChecked={reminder.isVeryImportant}
          />
          Çok önemli
        </label>
        <textarea
          name="description"
          defaultValue={reminder.description ?? ""}
          placeholder="Açıklama"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 md:col-span-2"
          rows={4}
        />
        <select
          name="related"
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
          defaultValue={reminder.relatedObligationId ?? ""}
        >
          <option value="">Obligation bağlantısı (opsiyonel)</option>
          {obligations.map((obligation: { id: string; name: string }) => (
            <option key={obligation.id} value={obligation.id}>
              {obligation.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 md:col-span-3"
        >
          Hatırlatmayı güncelle
        </button>
      </form>
    </div>
  );
}
