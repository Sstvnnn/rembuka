"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AuthLinkRow } from "@/components/auth/auth-link-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ForgotPasswordApiResponse = {
  error?: string;
  message?: string;
};

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

export function ForgotPasswordForm() {
  const [nik, setNik] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formattedNik = useMemo(
    () => nik.replace(/\D/g, "").slice(0, 20),
    [nik],
  );

  function onNikChange(event: ChangeEvent<HTMLInputElement>) {
    setNik(event.target.value.replace(/\D/g, "").slice(0, 20));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("nik", formattedNik);

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as ForgotPasswordApiResponse;

      if (!response.ok) {
        setError(
          payload.error ?? "Tidak dapat mengirim email pengaturan ulang.",
        );
        return;
      }

      setSuccess(payload.message ?? "Email pengaturan ulang telah dikirim.");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full"
    >
      {/* Header Form */}
      <motion.div variants={itemVariants} className="mb-10">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#1A1F2B] mb-4">
          Lupa Sandi
        </h2>
        <p className="text-slate-600 text-base leading-relaxed">
          Masukkan nomor identitas Anda dan kami akan mengirimkan tautan
          pengaturan ulang ke email yang terdaftar.
        </p>
      </motion.div>

      {/* Form Area */}
      <motion.form
        variants={itemVariants}
        onSubmit={onSubmit}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="nik" className="text-slate-700 font-bold text-sm">
            Nomor Induk Kependudukan (NIK)
          </Label>
          <div className="relative">
            <Input
              id="nik"
              inputMode="numeric"
              autoComplete="off"
              value={nik}
              onChange={onNikChange}
              placeholder="Masukkan 16 digit NIK"
              className="h-12 rounded-lg border-slate-300 bg-white text-[#1A1F2B] focus-visible:border-[#11538C] focus-visible:ring-1 focus-visible:ring-[#11538C] shadow-sm transition-all"
            />
            {nik.length >= 16 && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-green-600" />
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 border border-rose-100"
            >
              {error}
            </motion.div>
          )}
          {success && (
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
          )}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-lg text-sm font-bold tracking-wide text-white transition-all bg-[#0c3e6b] hover:bg-[#082a4a] hover:shadow-lg shadow-[#11538C]/20"
        >
          {isLoading ? (
            <LoadingSpinner className="mr-2" />
          ) : (
            <>
              Reset Sandi <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </motion.form>

      {/* Footer Link Component */}
      <motion.div variants={itemVariants} className="mt-8 text-center">
        <AuthLinkRow
          question="Ingat kata sandi Anda?"
          href="/login"
          label="Masuk"
        />
      </motion.div>
    </motion.div>
  );
}
