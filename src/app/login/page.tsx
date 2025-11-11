import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { LoginForm } from "@/components/auth/LoginForm";

type Props = {
  searchParams: {
    redirectedFrom?: string;
  };
};

export default async function LoginPage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  const redirectTo = searchParams.redirectedFrom ?? "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
