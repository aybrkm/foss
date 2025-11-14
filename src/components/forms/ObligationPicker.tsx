"use client";

import { useEffect, useRef, useState } from "react";

type Option = {
  id: string;
  name: string;
  category?: string | null;
  amount?: number | null;
  currency?: string | null;
  nextDue?: string | null;
  notes?: string | null;
};

type Props = {
  name: string;
  options: Option[];
  placeholder?: string;
};

export function ObligationPicker({ name, options, placeholder = "Obligation bağlantısı (opsiyonel)" }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  const formatTooltip = (option: Option) => {
    const pieces: string[] = [];
    if (option.amount) {
      const formatter = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: option.currency ?? "TRY",
        maximumFractionDigits: 0,
      });
      pieces.push(formatter.format(option.amount));
    }
    if (option.nextDue) {
      pieces.push(`Sonraki: ${new Date(option.nextDue).toLocaleDateString("tr-TR")}`);
    }
    if (option.notes) {
      pieces.push(`Not: ${option.notes}`);
    }
    if (pieces.length === 0) {
      pieces.push("Ek bilgi yok");
    }
    return pieces.join(" • ");
  };

  const handleSelect = (option: Option) => {
    setValue(option.id);
    setSelectedLabel(option.name);
    setOpen(false);
    setTooltip(null);
  };

  const handleMouseMove = (option: Option, event: React.MouseEvent) => {
    setTooltip({
      text: formatTooltip(option),
      x: event.clientX + 12,
      y: event.clientY + 12,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-left text-sm text-white transition hover:border-white/30"
      >
        <span>{selectedLabel ?? placeholder}</span>
        <span className="text-xs text-slate-400">{open ? "▲" : "▼"}</span>
      </button>
      <input type="hidden" name={name} value={value} />
      {open && (
        <div className="absolute z-40 mt-2 max-h-48 w-full overflow-auto rounded-2xl border border-white/10 bg-slate-900/90 shadow-lg">
          {options.length === 0 && (
            <p className="px-4 py-3 text-sm text-slate-400">Aktif obligation bulunamadı.</p>
          )}
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-white hover:bg-white/10"
              onClick={() => handleSelect(option)}
              onMouseMove={(event) => handleMouseMove(option, event)}
              onMouseLeave={handleMouseLeave}
            >
              <span>{option.name}</span>
            </button>
          ))}
        </div>
      )}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-xl border border-white/10 bg-black/80 px-3 py-2 text-xs text-slate-100"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
