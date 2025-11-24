"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidMasterCode } from "@/lib/client-crypto";

const MASTER_CODE_HINT = "6 haneli, 3 aynı rakam art arda olamaz (örn: 333 yasak, 112233 serbest)";

type Props = {
  hasMasterKey: boolean;
};

export function MasterKeyGate({ hasMasterKey }: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (hasMasterKey) {
    return null;
  }

  const submit = async () => {
    setError(null);
    if (!isValidMasterCode(code)) {
      setError(MASTER_CODE_HINT);
      return;
    }
    setLoading(true);
    const response = await fetch("/api/master-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterCode: code }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Master kod kaydedilemedi");
      setLoading(false);
      return;
    }
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl">
        <div className="space-y-1 text-left">
          <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-200">Güvenlik</p>
          <h2 className="text-xl font-semibold text-white">Master kodunu belirle</h2>
          <p className="text-sm text-slate-300">
            Şifreli dijital hesapları görüntülemek için 6 haneli bir master kod belirle ve sakın kaybetme. Bu kodu bilmiyorsan
            şifreler çözülemez.
          </p>
        </div>
        <input
          type="password"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          inputMode="numeric"
          maxLength={6}
        />
        <p className="text-xs text-slate-400">{MASTER_CODE_HINT}</p>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <button
          type="button"
          disabled={loading}
          onClick={submit}
          className="w-full rounded-xl bg-fuchsia-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Kaydediliyor..." : "Master kodu kaydet"}
        </button>
      </div>
    </div>
  );
}
