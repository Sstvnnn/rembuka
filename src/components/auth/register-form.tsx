"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  FileBadge,
  IdCard,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AuthLinkRow } from "@/components/auth/auth-link-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterApiResponse = {
  error?: string;
  emailConfirmationRequired?: boolean;
  email?: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [citizenCard, setCitizenCard] = useState<File | null>(null);
  const [citizenCardPreview, setCitizenCardPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formattedNik = useMemo(() => nik.replace(/\D/g, "").slice(0, 20), [nik]);

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
          router.push(`/verify-otp?email=${encodeURIComponent(payload.email!)}`);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/92 shadow-[0_24px_90px_rgba(63,92,115,0.18)] backdrop-blur">
        <CardHeader className="space-y-4 border-b border-[#d7dee5] bg-[linear-gradient(135deg,rgba(79,179,179,0.18),rgba(242,92,122,0.08),rgba(255,255,255,0.95))] pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#3F5C73] text-white shadow-[4px_4px_0_rgba(79,179,179,0.35)]">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4FB3B3]">
                Daftar Akun
              </p>
              <CardTitle className="text-2xl font-semibold text-[#243746]">
                Mulai Sekarang
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-sm leading-6 text-[#587080]">
            Lengkapi data diri Anda untuk membuat akun dan melanjutkan ke konfirmasi email.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-6 py-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nik" className="text-[#2e4658]">
                Nomor identitas (NIK)
              </Label>
              <div className="relative">
                <IdCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#4FB3B3]" />
                <Input
                  id="nik"
                  inputMode="numeric"
                  autoComplete="off"
                  value={nik}
                  onChange={onNikChange}
                  placeholder="Masukkan 16 digit NIK Anda"
                  className="h-11 rounded-2xl border-[#c6d0d8] bg-white pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="citizen-card" className="text-[#2e4658]">
                Kartu identitas (KTP)
              </Label>
              <label
                htmlFor="citizen-card"
                className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#b7c5cf] bg-[#f8fbfc] px-4 py-4 transition hover:border-[#4FB3B3] hover:bg-[#eef8f8]"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#4FB3B3]/15 text-[#4FB3B3] transition group-hover:scale-105">
                  {citizenCard ? <FileBadge className="size-5" /> : <Upload className="size-5" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#243746]">
                    {citizenCard ? citizenCard.name : "Unggah foto kartu identitas Anda"}
                  </p>
                  <p className="text-xs text-[#748794]">
                    Format JPG, PNG, atau WEBP
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
              {citizenCardPreview ? (
                <div className="overflow-hidden rounded-[1.5rem] border border-[#d8e2e8] bg-[#f8fbfc]">
                  <Image
                    src={citizenCardPreview}
                    alt="Identity card preview"
                    width={800}
                    height={520}
                    className="h-auto w-full object-cover"
                    unoptimized
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#2e4658]">
                Kata Sandi
              </Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#F25C7A]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="h-11 rounded-2xl border-[#c6d0d8] bg-white px-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f919c] transition hover:text-[#243746]"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-[#2e4658]">
                Konfirmasi Kata Sandi
              </Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#F25C7A]" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Ulangi kata sandi Anda"
                  className="h-11 rounded-2xl border-[#c6d0d8] bg-white px-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f919c] transition hover:text-[#243746]"
                  aria-label={showConfirmPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key={error}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-[#f3b3c0] bg-[#fff1f5] px-4 py-3 text-sm text-[#b63d59]"
                >
                  {error}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key={success}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-[#cde4e4] bg-[#eff9f9] px-4 py-3 text-sm text-[#2d6868]"
                >
                  {success}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-2xl bg-[#3F5C73] text-base font-semibold text-white shadow-[0_10px_24px_rgba(63,92,115,0.25)] transition hover:-translate-y-0.5 hover:bg-[#314b60]"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Membuat akun...
                </>
              ) : (
                <>
                  <LoaderCircle className="mr-2 size-4" />
                  Lanjutkan
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-2 border-t border-[#e2e8ed] bg-[#f6f8fa] px-6 py-4 text-xs text-[#6f808c]">
          <AuthLinkRow question="Sudah punya akun?" href="/login" label="Masuk" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}
