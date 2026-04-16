import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }

  return (
    <AuthShell
      badge="Rembuka"
      title="Welcome back"
      description="Sign in to continue to your account."
    >
      <LoginForm />
    </AuthShell>
  );
}
