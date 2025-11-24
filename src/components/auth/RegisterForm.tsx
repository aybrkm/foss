"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@/components/providers/SupabaseProvider";

export function RegisterForm() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, tone: "success" | "error" = "success") => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, tone });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    setLoading(true);

    const redirectBaseEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const redirectBase =
      redirectBaseEnv || (typeof window !== "undefined" ? window.location.origin.replace(/\/$/, "") : "");
    const emailRedirectTo = redirectBase
      ? `${redirectBase}/api/auth/callback?next=/dashboard`
      : undefined;

    const {
      data: signUpData,
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });

    if (signUpError) {
      setError(signUpError.message);
      showToast(signUpError.message, "error");
      setLoading(false);
      return;
    }

    // Eğer email doğrulama açıksa Supabase session dönmez, dashboard'a yönlendirmeyip bilgi veriyoruz
    const message = signUpData.session
      ? "Hesap oluşturuldu. Giriş sayfasına yönlendiriliyorsun..."
      : "Kayıt isteği alındı. E-postanı doğrula, ardından giriş yap.";
    setStatus(message);
    showToast(message);
    setLoading(false);
    redirectTimeoutRef.current = setTimeout(() => {
      router.replace("/login");
      router.refresh();
    }, signUpData.session ? 1000 : 1400);
  };

  return (
    <>
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

      {error && <p className="text-sm text-rose-400">{error}</p>}
      {status && <p className="text-sm text-emerald-300">{status}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Kayıt yapılıyor..." : "Kayıt ol"}
        </button>
      </form>

      {toast && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4" role="status" aria-live="polite">
          <div
            className={`max-w-md rounded-2xl border px-4 py-3 text-sm shadow-lg shadow-black/40 ${
              toast.tone === "success"
                ? "border-emerald-300/40 bg-emerald-500/10 text-emerald-50"
                : "border-rose-300/40 bg-rose-500/10 text-rose-50"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}
