import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
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
      title="Create your account"
      description="Set up your account to continue."
    >
      <RegisterForm />
    </AuthShell>
  );
}
