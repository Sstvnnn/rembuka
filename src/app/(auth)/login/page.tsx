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
    const { data: govUser } = await supabase
      .from("governance")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (govUser) {
      redirect("/admin");
    } else {
      redirect("/home");
    }
  }

  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
