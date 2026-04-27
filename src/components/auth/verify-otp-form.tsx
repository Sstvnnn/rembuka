"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!email) {
      router.replace("/register");
    }
  }, [email, router]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Silakan masukkan 6 digit kode.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Kode tidak valid atau kadaluarsa.");
        return;
      }

      setSuccess("Akun Anda berhasil diverifikasi!");

      setTimeout(() => {
        router.replace("/home");
        router.refresh();
      }, 1500);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (resendCountdown > 0 || isResending) return;

    setIsResending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload.error ?? "Gagal mengirim ulang kode.");
        return;
      }

      setSuccess("Kode baru telah dikirim ke email Anda.");
      setResendCountdown(60);

      setTimeout(() => setSuccess(""), 5000);
    } catch {
      setError("Gagal mengirim ulang kode. Silakan coba lagi.");
    } finally {
      setIsResending(false);
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    if (error) setError("");
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full"
    >
      {/* Header Form */}
      <motion.div variants={itemVariants} className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          Verifikasi Identitas
        </p>
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#1A1F2B] mb-4">
          Masukkan Kode
        </h2>
        <p className="text-slate-600 text-base leading-relaxed">
          Kami telah mengirimkan 6 digit kode OTP ke <br />
          <span className="font-bold text-[#11538C]">{email}</span>
        </p>
      </motion.div>

      {/* Form Area */}
      <motion.form
        variants={itemVariants}
        onSubmit={onSubmit}
        className="space-y-8"
      >
        {/* Custom 6-Digit Input */}
        <div className="relative group">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            className="absolute inset-0 z-10 h-full w-full opacity-0 cursor-default"
            autoFocus
          />

          <div
            className="grid grid-cols-6 gap-2"
            onClick={() => inputRef.current?.focus()}
          >
            {Array.from({ length: 6 }).map((_, index) => {
              const digit = otp[index];
              const isCurrentBox = otp.length === index;
              const isFilled = otp.length > index;
              const showCursor = isInputFocused && isCurrentBox;

              return (
                <div
                  key={index}
                  className={cn(
                    "relative flex h-14 md:h-16 w-full items-center justify-center rounded-xl border bg-white text-xl md:text-2xl font-bold transition-all duration-200",
                    isInputFocused && isCurrentBox
                      ? "border-[#11538C] ring-4 ring-[#11538C]/10 shadow-sm"
                      : isFilled
                        ? "border-slate-400 text-[#1A1F2B]"
                        : "border-slate-200 text-slate-300",
                  )}
                >
                  {digit || "•"}
                  {showCursor && (
                    <motion.div
                      className="absolute h-6 md:h-8 w-[2px] bg-[#11538C]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{
                        opacity: {
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear",
                        },
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 border border-rose-100"
            >
              {error}
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700 border border-teal-100 flex items-center gap-2"
            >
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{success}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={isLoading || otp.length !== 6 || !!success}
          className="h-12 w-full rounded-lg text-sm font-bold tracking-wide text-white transition-all bg-[#0c3e6b] hover:bg-[#082a4a] hover:shadow-lg shadow-[#11538C]/20 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              Verifikasi Akun <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </motion.form>

      {/* Footer Actions */}
      <motion.div
        variants={itemVariants}
        className="mt-8 flex flex-col items-center gap-4 border-t border-slate-100 pt-6"
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Tidak menerima kode?</span>
          <button
            onClick={handleResend}
            disabled={resendCountdown > 0 || isResending}
            className={cn(
              "flex items-center gap-1.5 font-bold transition-colors",
              resendCountdown > 0 || isResending
                ? "text-slate-400 cursor-not-allowed"
                : "text-[#11538C] hover:text-[#0c3e6b]",
            )}
          >
            {isResending ? (
              <LoadingSpinner className="size-3" />
            ) : (
              <RotateCcw className="size-3" />
            )}
            {resendCountdown > 0
              ? `Kirim ulang (${resendCountdown}s)`
              : "Kirim Ulang"}
          </button>
        </div>

        <button
          onClick={() => router.replace("/register")}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Ganti alamat email pendaftaran
        </button>
      </motion.div>
    </motion.div>
  );
}
