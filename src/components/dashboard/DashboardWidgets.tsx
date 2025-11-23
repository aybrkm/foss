"use client";

import { JSX, startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, daysUntil } from "@/lib/format";

const widgetOrder = ["assets", "obligations", "reminders", "journal"] as const;
type WidgetKey = (typeof widgetOrder)[number];
const storageKey = "foss-dashboard-widget-order";

type AssetCard = {
  id: string;
  name: string;
  assetType: string;
  isLiquid: boolean;
  value: number;
  valueTry: number;
  currency: string;
};

type ObligationCard = {
  id: string;
  name: string;
  category: string;
  status: string;
  amount: number | null;
  amountTry: number | null;
  currency: string | null;
  nextDue: string | null;
};

type ReminderCard = {
  id: string;
  title: string;
  dueAt: string;
};

type JournalCard = {
  id: string;
  title: string;
  body: string;
  date: string;
};

type Props = {
  assets: AssetCard[];
  obligations: ObligationCard[];
  reminders: ReminderCard[];
  journal: JournalCard[];
};

export function DashboardWidgets({
  assets,
  obligations,
  reminders,
  journal,
}: Props) {
  const [order, setOrder] = useState<WidgetKey[]>([...widgetOrder]);
  const [dragging, setDragging] = useState<WidgetKey | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (
        Array.isArray(parsed) &&
        parsed.every((key) => widgetOrder.includes(key as WidgetKey))
      ) {
        startTransition(() => {
          setOrder(parsed as WidgetKey[]);
        });
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(order));
  }, [order]);

  const reorder = (source: WidgetKey, target: WidgetKey) => {
    if (source === target) return;
    setOrder((prev) => {
      const next = prev.filter((key) => key !== source);
      const targetIndex = next.indexOf(target);
      if (targetIndex === -1) return prev;
      next.splice(targetIndex, 0, source);
      return next;
    });
  };

  const cards: Record<WidgetKey, JSX.Element> = {
    assets: (
      <div className="space-y-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
          >
            <div>
            <p className="text-sm font-semibold text-white">{asset.name}</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              {asset.isLiquid ? "Likit" : "İllikit"} - {asset.assetType}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {formatCurrency(asset.value, asset.currency)}
            </p>
            <p className="text-[11px] text-slate-400">
              ≈ {formatCurrency(asset.valueTry, "TRY")}
            </p>
          </div>
        </div>
      ))}
      </div>
    ),
    obligations: (
      <div className="space-y-3">
        {obligations.map((obligation) => (
          <div
            key={obligation.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
          >
            <div>
              <p className="text-sm font-semibold text-white">
                {obligation.name}
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                {obligation.category} - {obligation.status}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {obligation.amount
                  ? formatCurrency(obligation.amount, obligation.currency ?? "TRY")
                  : "-"}
              </p>
              <p className="text-[11px] text-slate-400">
                {obligation.amount && obligation.amountTry
                  ? `≈ ${formatCurrency(obligation.amountTry, "TRY")}`
                  : ""}
              </p>
              <p className="text-[11px] text-slate-400">
                {obligation.nextDue
                  ? new Date(obligation.nextDue).toLocaleDateString("tr-TR")
                  : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    ),
    reminders: (
      <div className="space-y-3">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{reminder.title}</p>
              <span className="text-[11px] text-amber-200">
                {daysUntil(reminder.dueAt)} gün
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {new Date(reminder.dueAt).toLocaleString("tr-TR")}
            </p>
          </div>
        ))}
      </div>
    ),
    journal: (
      <div className="space-y-3">
        {journal.map((entry) => (
          <div
            key={entry.id}
            className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              {new Date(entry.date).toLocaleDateString("tr-TR")}
            </p>
            <p className="text-sm font-semibold text-white">{entry.title}</p>
            <p className="text-xs text-slate-300">{entry.body}</p>
          </div>
        ))}
      </div>
    ),
  };

  const headers: Record<WidgetKey, { label: string; color: string; href: string }> = {
    assets: { label: "Varlıklar", color: "text-indigo-300", href: "/assets" },
    obligations: {
      label: "Yükümlülükler",
      color: "text-rose-300",
      href: "/obligations",
    },
    reminders: {
      label: "Hatırlatmalar",
      color: "text-amber-300",
      href: "/reminders",
    },
    journal: { label: "Günlük", color: "text-sky-300", href: "/journal" },
  };

  return (
    <div className="grid gap-6 xl:grid-cols-3 xl:auto-rows-fr">
      {order.map((key) => (
        <article
          key={key}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData("text/plain", key);
            event.dataTransfer.effectAllowed = "move";
            setDragging(key);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }}
          onDrop={(event) => {
            event.preventDefault();
            const data = event.dataTransfer.getData("text/plain");
            const source = widgetOrder.includes(data as WidgetKey)
              ? (data as WidgetKey)
              : dragging;
            if (source) {
              reorder(source, key);
            }
            setDragging(null);
          }}
          onDragEnd={() => setDragging(null)}
          className={`rounded-3xl border border-white/10 bg-slate-900/60 p-5 transition ${
            dragging === key ? "border-indigo-400 bg-slate-900/80" : ""
          }`}
        >
          <header className="mb-4 flex items-center justify-between text-sm">
            <span className={`uppercase tracking-[0.3em] ${headers[key].color}`}>
              {headers[key].label}
            </span>
            <Link
              href={headers[key].href}
              className="text-xs text-slate-300 transition hover:text-white"
            >
              tamamı -&gt;
            </Link>
          </header>
          {cards[key]}
        </article>
      ))}
    </div>
  );
}
