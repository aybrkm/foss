"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { ConfirmDoneButton } from "@/components/forms/ConfirmDoneButton";

export type IncomeRow = {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  occurredAt: string;
  notes?: string | null;
};

type Props = {
  incomes: IncomeRow[];
  deleteAction: (formData: FormData) => Promise<void> | void;
  categoryLabels: Record<string, string>;
};

export function IncomeTable({ incomes, deleteAction, categoryLabels }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
          <tr>
            <th className="px-5 py-4">Tarih</th>
            <th className="px-5 py-4">Başlık</th>
            <th className="px-5 py-4">Kategori</th>
            <th className="px-5 py-4 text-right">Tutar</th>
            <th className="px-5 py-4 text-right">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {incomes.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                Henüz gelir kaydı yok.
              </td>
            </tr>
          ) : (
            incomes.map((income) => (
              <tr key={income.id} className="hover:bg-white/5 text-white">
                <td className="px-5 py-4 text-slate-300">
                  {new Date(income.occurredAt).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-white">{income.title}</p>
                  <p className="text-xs text-slate-400">{income.notes || "Not yok"}</p>
                </td>
                <td className="px-5 py-4 text-slate-300 capitalize">
                  {categoryLabels[income.category] ?? income.category}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-white">
                  {formatCurrency(income.amount, income.currency)}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/cashflow/${income.id}/edit`}
                      className="inline-flex items-center justify-center rounded-full border border-white/20 px-3 py-1 text-xs text-white transition hover:border-white/60"
                    >
                      Düzenle
                    </Link>
                    <ConfirmDoneButton
                      action={deleteAction}
                      id={income.id}
                      label="Sil"
                      description="Bu geliri silmek istediğine emin misin?"
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
