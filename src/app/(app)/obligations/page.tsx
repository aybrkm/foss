import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";

export default async function ObligationsPage() {
  const obligations = await prisma.obligation.findMany({
    orderBy: [
      { nextDue: "asc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-rose-300">Obligations</p>
        <h2 className="text-3xl font-semibold text-white">
          Ödemeler + yasal sorumluluklar
        </h2>
        <p className="max-w-2xl text-slate-300">
          obligations tablosu: category enum, amount, currency, frequency enum,
          next_due_date, end_date, is_active, notes.
        </p>
      </header>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-5 py-4">Yükümlülük</th>
              <th className="px-5 py-4">Kategori</th>
              <th className="px-5 py-4">Frekans</th>
              <th className="px-5 py-4 text-right">Tutar</th>
              <th className="px-5 py-4 text-right">Next Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {obligations.map((obligation) => (
              <tr key={obligation.id} className="hover:bg-white/5">
                <td className="px-5 py-4">
                  <p className="font-semibold text-white">{obligation.name}</p>
                  <p className="text-xs text-slate-400">
                    {obligation.isActive ? "Aktif" : "Pasif"}
                  </p>
                </td>
                <td className="px-5 py-4 capitalize text-slate-300">
                  {obligation.category}
                </td>
                <td className="px-5 py-4 capitalize text-slate-300">
                  {obligation.frequency}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-white">
                  {obligation.amount
                    ? formatCurrency(Number(obligation.amount), obligation.currency ?? "TRY")
                    : "-"}
                </td>
                <td className="px-5 py-4 text-right text-slate-400">
                  {obligation.nextDue
                    ? new Date(obligation.nextDue).toLocaleDateString("tr-TR")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
