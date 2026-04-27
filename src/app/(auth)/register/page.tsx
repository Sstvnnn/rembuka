import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jika sudah login, lempar ke home
  if (user) {
    redirect("/home");
  }

  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  );
}
