"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidMasterCode } from "@/lib/client-crypto";
import { useSupabaseClient } from "@/components/providers/SupabaseProvider";

const MASTER_CODE_HINT = "6 haneli, 3 aynı rakam art arda olamaz (örn: 333 yasak, 112233 serbest)";

export function RegisterForm() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [masterCode, setMasterCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isValidMasterCode(masterCode)) {
      setError(MASTER_CODE_HINT);
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/master-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterCode }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Master key kaydedilemedi");
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl"
    >
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold text-white">Kayıt Ol</h1>
        <p className="text-sm text-slate-400">Email/parola ile hesap aç, 6 haneli master kodunu belirle.</p>
      </div>

      <label className="block text-sm text-slate-300">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          required
        />
      </label>

      <label className="block text-sm text-slate-300">
        Parola
        <div className="relative mt-1">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-24 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-1 right-2 rounded-lg px-3 text-xs font-semibold text-slate-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            aria-pressed={showPassword}
          >
            {showPassword ? "Gizle" : "Göster"}
          </button>
        </div>
      </label>

      <label className="block text-sm text-slate-300">
        Master Kod
        <input
          type="password"
          value={masterCode}
          onChange={(event) => setMasterCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          inputMode="numeric"
          maxLength={6}
          required
          title={MASTER_CODE_HINT}
        />
        <p className="mt-1 text-xs text-slate-400">{MASTER_CODE_HINT}</p>
      </label>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Kayıt yapılıyor..." : "Kayıt ol"}
      </button>
    </form>
  );
}
