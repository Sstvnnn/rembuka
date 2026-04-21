"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@/lib/utils";

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
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit code.");
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
        setError(payload.error ?? "Invalid or expired code.");
        return;
      }

      setSuccess("Your account has been verified successfully!");
      
      setTimeout(() => {
        router.replace("/home");
        router.refresh();
      }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
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
        setError(payload.error ?? "Failed to resend code.");
        return;
      }

      setSuccess("A new code has been sent to your email.");
      setResendCountdown(60);
      
      setTimeout(() => setSuccess(""), 5000);
    } catch {
      setError("Failed to resend code. Please try again.");
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/92 shadow-[0_24px_90px_rgba(63,92,115,0.18)] backdrop-blur">
        <CardHeader className="space-y-4 border-b border-[#d7dee5] bg-[linear-gradient(135deg,rgba(79,179,179,0.18),rgba(242,92,122,0.08),rgba(255,255,255,0.95))] pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#3F5C73] text-white shadow-[4px_4px_0_rgba(79,179,179,0.35)]">
              <KeyRound className="size-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4FB3B3]">
                Verifikasi
              </p>
              <CardTitle className="text-2xl font-semibold text-[#243746]">
                Masukkan OTP
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-sm leading-6 text-[#587080]">
            Kami telah mengirimkan 6 digit kode verifikasi ke <span className="font-semibold text-[#243746]">{email}</span>.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 py-8">
          <form onSubmit={onSubmit} className="space-y-6">
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
                        "relative flex h-14 w-full items-center justify-center rounded-xl border-2 bg-white text-xl font-bold transition-colors duration-100",
                        isInputFocused && isCurrentBox 
                          ? "border-[#4FB3B3] ring-4 ring-[#4FB3B3]/10 shadow-sm" 
                          : isFilled 
                            ? "border-[#3F5C73] text-[#243746]" 
                            : "border-[#e2e8f0] text-[#cbd5e1]"
                      )}
                    >
                      {digit || "•"}
                      {showCursor && (
                        <motion.div
                          className="absolute h-6 w-0.5 bg-[#4FB3B3]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ 
                            opacity: { duration: 0.8, repeat: Infinity, ease: "linear" }
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border border-[#f3b3c0] bg-[#fff1f5] px-4 py-3 text-sm text-[#b63d59]"
                >
                  {error}
                </motion.div>
              ) : success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border border-[#cde4e4] bg-[#eff9f9] px-4 py-3 text-sm text-[#2d6868] flex items-center gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  {success}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isLoading || otp.length !== 6 || !!success}
              className="h-12 w-full rounded-2xl bg-[#3F5C73] text-base font-semibold text-white shadow-[0_10px_24px_rgba(63,92,115,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#314b60] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Memverifikasi...
                </>
              ) : (
                "Verifikasi Akun"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-4 border-t border-[#e2e8ed] bg-[#f6f8fa] px-6 py-6 text-sm">
          <div className="flex flex-col items-center gap-2">
            <p className="text-[#587080]">Tidak menerima kode?</p>
            <button
              onClick={handleResend}
              disabled={resendCountdown > 0 || isResending}
              className={cn(
                "flex items-center gap-2 font-semibold transition-colors",
                resendCountdown > 0 || isResending
                  ? "text-[#a0aec0] cursor-not-allowed"
                  : "text-[#3F5C73] hover:text-[#4FB3B3]"
              )}
            >
              {isResending ? (
                <LoadingSpinner className="size-3" />
              ) : (
                <RotateCcw className="size-4" />
              )}
              {resendCountdown > 0 
                ? `Kirim ulang dalam ${resendCountdown}s` 
                : "Kirim Ulang Kode"}
            </button>
          </div>
          
          <button 
            onClick={() => router.replace("/register")}
            className="text-xs font-medium text-[#64748b] hover:text-[#3F5C73]"
          >
            Ganti alamat email
          </button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
