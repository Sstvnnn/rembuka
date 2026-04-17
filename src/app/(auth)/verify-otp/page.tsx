import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";
import { LoadingSpinner } from "@/components/loading-spinner";

export const metadata = {
  title: "Verify your account",
  description: "Enter the code sent to your email to continue.",
};

export default function VerifyOtpPage() {
  return (
    <AuthShell
      badge="Verification"
      title="Verify your account"
      description="Enter the code sent to your email to complete your registration."
    >
      <Suspense fallback={<LoadingSpinner />}>
        <VerifyOtpForm />
      </Suspense>
    </AuthShell>
  );
}
