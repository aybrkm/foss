import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/lib/supabase/server-component-client";
import { LoginForm } from "@/components/auth/LoginForm";

type Props = {
  searchParams: Promise<{
    redirectedFrom?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const redirectTo = resolvedSearchParams.redirectedFrom ?? "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-block translate-x-1 text-4xl font-semibold uppercase tracking-[0.3em] text-indigo-200 transition hover:text-white"
          >
            FLOSS
          </Link>
        </div>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
