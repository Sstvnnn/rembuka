import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";
import { LoadingSpinner } from "@/components/loading-spinner";

export const metadata = {
  title: "Verifikasi Akun | Rembuka",
  description:
    "Masukkan kode OTP yang dikirim ke email Anda untuk melanjutkan.",
};

export default function VerifyOtpPage() {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        }
      >
        <VerifyOtpForm />
      </Suspense>
    </AuthShell>
  );
}
