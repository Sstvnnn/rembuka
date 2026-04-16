import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      badge="Rembuka"
      title="Reset password"
      description="Enter your details and we will send a reset link to your email."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
