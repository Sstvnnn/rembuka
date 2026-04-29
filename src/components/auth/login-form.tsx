"use client";

import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AuthLinkRow } from "@/components/auth/auth-link-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type LoginApiResponse = {
  error?: string;
  email?: string;
  requiresVerification?: boolean;
  role?: string;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginType, setLoginType] = useState<"citizen" | "governance">(
    "citizen",
  );
  const [notice, setNotice] = useState("");
  const [nik, setNik] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formattedNik = useMemo(
    () => nik.replace(/\D/g, "").slice(0, 20),
    [nik],
  );

  useEffect(() => {
    setNotice(
      searchParams.get("message") === "confirm-email"
        ? "Silakan konfirmasi email Anda sebelum masuk."
        : "",
    );
  }, [searchParams]);

  function onNikChange(event: ChangeEvent<HTMLInputElement>) {
    setNik(event.target.value.replace(/\D/g, "").slice(0, 20));
  }

  function handleTabChange(type: "citizen" | "governance") {
    setLoginType(type);
    setNik("");
    setEmail("");
    setPassword("");
    setError("");
    setNotice("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (loginType === "citizen") {
      if (!/^\d{8,20}$/.test(formattedNik)) {
        setError("Silakan masukkan nomor identitas yang valid.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("loginType", loginType);
    if (loginType === "citizen") {
      formData.append("nik", formattedNik);
    } else {
      formData.append("email", email);
    }
    formData.append("password", password);

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as LoginApiResponse;

      if (!response.ok) {
        if (
          response.status === 403 &&
          payload.requiresVerification &&
          payload.email
        ) {
          setError(payload.error ?? "Verifikasi diperlukan.");
          setTimeout(() => {
            router.push(
              `/verify-otp?email=${encodeURIComponent(payload.email!)}`,
            );
          }, 1500);
          return;
        }
        setError(payload.error ?? "Gagal masuk.");
        return;
      }

      if (payload.role === "admin") {
        router.replace("/admin");
      } else if (payload.role === "governance") {
        router.replace("/governance");
      } else {
        router.replace("/home");
      }
      router.refresh();
    } catch {
      setError("Kesalahan jaringan. Silakan coba lagi.");
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
      <motion.div variants={itemVariants} className="mb-10">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#1A1F2B] mb-4">
          Login
        </h2>
        <p className="text-slate-600 text-base leading-relaxed">
          Silakan masukkan kredensial Anda untuk melanjutkan ke ekosistem
          Rembuka.
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mb-8 flex p-1 bg-white border border-slate-200 rounded-lg shadow-sm"
      >
        <button
          type="button"
          onClick={() => handleTabChange("citizen")}
          className={cn(
            "flex-1 py-2 text-xs font-bold tracking-widest rounded-md transition-all",
            loginType === "citizen"
              ? "bg-[#11538C] text-white"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          WARGA
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("governance")}
          className={cn(
            "flex-1 py-2 text-xs font-bold tracking-widest rounded-md transition-all",
            loginType === "governance"
              ? "bg-[#16a34a] text-white"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          PEMERINTAH
        </button>
      </motion.div>

      <motion.form
        layout
        variants={containerVariants}
        onSubmit={onSubmit}
        className="space-y-6"
      >
        <motion.div variants={itemVariants} layout>
          <AnimatePresence mode="wait" initial={false}>
            {loginType === "citizen" ? (
              <motion.div
                key="citizen-field"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <Label
                  htmlFor="nik"
                  className="text-slate-700 font-bold text-sm"
                >
                  Nomor Induk Kependudukan (NIK)
                </Label>
                <div className="relative">
                  <Input
                    id="nik"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Masukkan NIK"
                    value={nik}
                    onChange={onNikChange}
                    className="h-12 rounded-lg border-slate-300 bg-white text-[#1A1F2B] focus-visible:border-[#11538C] focus-visible:ring-1 focus-visible:ring-[#11538C] focus-visible:ring-offset-0 shadow-sm transition-all"
                  />
                  {nik.length >= 16 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 className="size-4 text-green-600" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="gov-field"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <Label
                  htmlFor="email"
                  className="text-slate-700 font-bold text-sm"
                >
                  Email Instansi
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@pemda.go.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-lg border-slate-300 bg-white text-[#1A1F2B] focus-visible:border-[#16a34a] focus-visible:ring-1 focus-visible:ring-[#16a34a] focus-visible:ring-offset-0 shadow-sm transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          layout
          variants={itemVariants}
          // Key unik diselaraskan dengan transisi tab
          key={`password-field-${loginType}`}
          initial={{ opacity: 0, x: loginType === "citizen" ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: loginType === "citizen" ? 10 : -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-slate-700 font-bold text-sm"
            >
              Kata Sandi
            </Label>
            <Link
              href="/forgot-password"
              className={cn(
                "text-xs font-bold transition-colors",
                loginType === "citizen"
                  ? "text-[#11538C] hover:text-[#0c3e6b]"
                  : "text-[#16a34a] hover:text-[#128a3e]",
              )}
            >
              Lupa sandi?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={cn(
                "h-12 rounded-lg border-slate-300 bg-white text-[#1A1F2B] pr-10 shadow-sm transition-all",
                loginType === "citizen"
                  ? "focus-visible:border-[#11538C] focus-visible:ring-1 focus-visible:ring-[#11538C] focus-visible:ring-offset-0"
                  : "focus-visible:border-[#16a34a] focus-visible:ring-1 focus-visible:ring-[#16a34a] focus-visible:ring-offset-0",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={showPassword ? "hide" : "show"}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 border border-rose-100"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout variants={itemVariants} className="w-full">
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "h-12 w-full rounded-lg text-sm font-bold tracking-wide text-white transition-all shadow-lg",
              loginType === "citizen"
                ? "bg-[#11538C] hover:bg-[#0c3e6b] shadow-[#11538C]/20"
                : "bg-[#16a34a] hover:bg-[#128a3e] shadow-[#16a34a]/20",
            )}
          >
            {isLoading ? (
              <LoadingSpinner className="mr-2" />
            ) : (
              <>
                Masuk <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </motion.div>
      </motion.form>

      {loginType === "citizen" && (
        <motion.div layout variants={itemVariants} className="mt-8 text-center">
          <AuthLinkRow
            question="Belum menjadi warga terdaftar?"
            href="/register"
            label="Daftar sekarang"
          />
        </motion.div>
      )}
    </motion.div>
  );
}
