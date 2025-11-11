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
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const redirectTo = resolvedSearchParams.redirectedFrom ?? "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
