import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      badge="Rembuka"
      title="Set a new password"
      description="Choose a new password to finish recovering your account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
