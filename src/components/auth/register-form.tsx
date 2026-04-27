"use client";

import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  Eye,
  EyeOff,
  FileBadge,
  Upload,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AuthLinkRow } from "@/components/auth/auth-link-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterApiResponse = {
  error?: string;
  emailConfirmationRequired?: boolean;
  email?: string;
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

export function RegisterForm() {
  const router = useRouter();
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [citizenCard, setCitizenCard] = useState<File | null>(null);
  const [citizenCardPreview, setCitizenCardPreview] = useState<string | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formattedNik = useMemo(
    () => nik.replace(/\D/g, "").slice(0, 20),
    [nik],
  );

  useEffect(() => {
    return () => {
      if (citizenCardPreview) {
        URL.revokeObjectURL(citizenCardPreview);
      }
    };
  }, [citizenCardPreview]);

  function onNikChange(event: ChangeEvent<HTMLInputElement>) {
    setNik(event.target.value.replace(/\D/g, "").slice(0, 20));
  }

  function onCitizenCardChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setCitizenCard(file);

    if (citizenCardPreview) {
      URL.revokeObjectURL(citizenCardPreview);
    }

    setCitizenCardPreview(file ? URL.createObjectURL(file) : null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("nik", formattedNik);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    if (citizenCard) {
      formData.append("citizenCard", citizenCard);
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as RegisterApiResponse;

      if (!response.ok) {
        setError(payload.error ?? "Tidak dapat membuat akun Anda.");
        return;
      }

      if (payload.emailConfirmationRequired && payload.email) {
        setSuccess("Akun berhasil dibuat! Mengalihkan ke verifikasi...");
        setTimeout(() => {
          router.push(
            `/verify-otp?email=${encodeURIComponent(payload.email!)}`,
          );
        }, 1000);
        return;
      }

      router.replace("/home");
      router.refresh();
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
          Register
        </h2>
        <p className="text-slate-600 text-base leading-relaxed">
          Lengkapi data diri Anda untuk membuat akun dan melanjutkan ke
          konfirmasi email.
        </p>
      </motion.div>

      {/* Form Area */}
      <motion.form
        variants={itemVariants}
        onSubmit={onSubmit}
        className="space-y-6"
      >
        {/* NIK */}
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

        {/* Upload KTP */}
        <div className="space-y-2">
          <Label
            htmlFor="citizen-card"
            className="text-slate-700 font-bold text-sm"
          >
            Foto Kartu Identitas (KTP)
          </Label>
          <label
            htmlFor="citizen-card"
            className="group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition-all hover:border-[#11538C] hover:bg-blue-50/50"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 group-hover:text-[#11538C] transition-colors shadow-sm">
              {citizenCard ? (
                <FileBadge className="size-5" />
              ) : (
                <Upload className="size-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#1A1F2B]">
                {citizenCard ? citizenCard.name : "Klik untuk unggah foto KTP"}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
                Format: JPG, PNG, atau WEBP
              </p>
            </div>
          </label>
          <Input
            id="citizen-card"
            type="file"
            accept="image/*"
            onChange={onCitizenCardChange}
            className="hidden"
          />
          {citizenCardPreview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
            >
              <Image
                src={citizenCardPreview}
                alt="KTP Preview"
                width={800}
                height={520}
                className="h-auto w-full rounded-lg object-cover"
                unoptimized
              />
            </motion.div>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-slate-700 font-bold text-sm"
          >
            Kata Sandi
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
              className="h-12 rounded-lg border-slate-300 bg-white pr-10 text-[#1A1F2B] focus-visible:border-[#11538C] focus-visible:ring-1 focus-visible:ring-[#11538C] shadow-sm transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label
            htmlFor="confirm-password"
            className="text-slate-700 font-bold text-sm"
          >
            Ulangi Kata Sandi
          </Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Konfirmasi kata sandi"
              className="h-12 rounded-lg border-slate-300 bg-white pr-10 text-[#1A1F2B] focus-visible:border-[#11538C] focus-visible:ring-1 focus-visible:ring-[#11538C] shadow-sm transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700 border border-teal-100 flex items-center gap-2"
            >
              <CheckCircle2 className="size-4" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-lg text-sm font-bold tracking-wide text-white transition-all bg-[#0c3e6b] hover:bg-[#082a4a] hover:shadow-lg shadow-[#11538C]/20"
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              Daftar Sekarang <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </motion.form>

      {/* Footer Link */}
      <motion.div variants={itemVariants} className="mt-8 text-center">
        <AuthLinkRow
          question="Sudah punya akun?"
          href="/login"
          label="Masuk"
        />
      </motion.div>
    </motion.div>
  );
}
