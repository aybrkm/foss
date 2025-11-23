"use client";

import { useState } from "react";

type Props = {
  value: string | null;
  hint?: string | null;
  unavailableLabel?: string;
};

export function SecretValue({
  value,
  hint,
  unavailableLabel = "Kayıt yok",
}: Props) {
  const [visible, setVisible] = useState(false);

  if (!value) {
    return <p className="text-xs text-slate-500">{unavailableLabel}</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-white">
          {visible ? value : "••••••••"}
        </span>
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="text-[11px] uppercase tracking-[0.25em] text-fuchsia-300 underline decoration-dotted underline-offset-4 transition hover:text-white"
        >
          {visible ? "Gizle" : "Göster"}
        </button>
      </div>
      {hint && <p className="text-[11px] text-slate-400">İpucu: {hint}</p>}
    </div>
  );
}
