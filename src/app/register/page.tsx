import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/lib/supabase/server-component-client";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
  const supabase = await createServerComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-xl space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl">
        <RegisterForm />
        <div className="text-center text-sm text-slate-400">
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="text-indigo-300 underline decoration-dotted underline-offset-4">
            Giriş yap
          </Link>
        </div>
      </div>
    </div>
  );
}
