"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Kata sandi harus terdiri dari minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.replace("/home");
      router.refresh();
    } catch {
      setError("Tidak dapat memperbarui kata sandi.");
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
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          Keamanan Akun
        </p>
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#1A1F2B] mb-4">
          Atur Sandi Baru
        </h2>
        <p className="text-slate-600 text-base leading-relaxed">
          Pilih kata sandi baru untuk mengamankan kembali akun warga Anda.
        </p>
      </motion.div>

      {/* Konten Berdasarkan Status Sesi */}
      {!ready ? (
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex gap-3 text-amber-800"
        >
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">
            Buka halaman ini menggunakan tautan pengaturan ulang dari email
            Anda. Jika tautan sudah kadaluarsa, silakan minta tautan baru di
            halaman Lupa Sandi.
          </p>
        </motion.div>
      ) : (
        <motion.form
          variants={itemVariants}
          onSubmit={onSubmit}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-slate-700 font-bold text-sm"
            >
              Kata Sandi Baru
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
                aria-label={
                  showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"
                }
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className="text-slate-700 font-bold text-sm"
            >
              Konfirmasi Kata Sandi Baru
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="h-12 rounded-lg border-slate-300 bg-white pr-10 text-[#1A1F2B] focus-visible:border-[#11538C] focus-visible:ring-1 focus-visible:ring-[#11538C] shadow-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label={
                  showConfirmPassword ? "Sembunyikan sandi" : "Tampilkan sandi"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
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
                Simpan Kata Sandi Baru <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </motion.form>
      )}
    </motion.div>
  );
}
