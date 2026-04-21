"use client";

import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Eye, EyeOff, IdCard, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

type LoginApiResponse = {
  error?: string;
  email?: string;
  requiresVerification?: boolean;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginType, setLoginType] = useState<"citizen" | "governance">("citizen");
  const [notice, setNotice] = useState("");
  const [nik, setNik] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formattedNik = useMemo(() => nik.replace(/\D/g, "").slice(0, 20), [nik]);

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
      
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        setError("Kata sandi harus terdiri dari minimal 8 karakter alfanumerik.");
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
        if (response.status === 403 && payload.requiresVerification && payload.email) {
          setError(payload.error ?? "Verifikasi diperlukan.");
          setTimeout(() => {
            router.push(`/verify-otp?email=${encodeURIComponent(payload.email!)}`);
          }, 1500);
          return;
        }

        setError(payload.error ?? "Gagal masuk.");
        return;
      }

      router.replace("/home");
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
      className="w-full max-w-md"
    >
      <div className="mb-6 flex justify-center p-1 bg-white/50 backdrop-blur rounded-2xl border border-white/70 shadow-sm">
        <button
          onClick={() => handleTabChange("citizen")}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
            loginType === "citizen" 
              ? "bg-[#3F5C73] text-white shadow-lg" 
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          Warga
        </button>
        <button
          onClick={() => handleTabChange("governance")}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
            loginType === "governance" 
              ? "bg-[#F25C7A] text-white shadow-lg" 
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          Pemerintah
        </button>
      </div>

      <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_24px_90px_rgba(63,92,115,0.18)] backdrop-blur">
        <CardHeader className="space-y-4 border-b border-[#d7dee5] bg-[linear-gradient(135deg,rgba(79,179,179,0.18),rgba(242,92,122,0.08),rgba(255,255,255,0.95))] pb-6">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className={cn(
              "flex size-12 items-center justify-center rounded-2xl text-white shadow-[4px_4px_0_rgba(79,179,179,0.35)] transition-colors",
              loginType === "citizen" ? "bg-[#3F5C73]" : "bg-[#F25C7A]"
            )}>
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className={cn(
                "text-xs font-semibold uppercase tracking-[0.28em] transition-colors",
                loginType === "citizen" ? "text-[#4FB3B3]" : "text-[#F25C7A]"
              )}>
                Portal {loginType === "citizen" ? "Warga" : "Pemerintah"}
              </p>
              <CardTitle className="text-2xl font-semibold text-[#243746]">
                Masuk {loginType === "citizen" ? "Warga" : "Pejabat"}
              </CardTitle>
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <CardDescription className="text-sm leading-6 text-[#587080]">
              {loginType === "citizen" 
                ? "Akses alat kewargaan Anda menggunakan nomor identitas." 
                : "Portal aman untuk pejabat pemerintah dan administrator."}
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-5 px-6 py-6">
          <motion.form variants={itemVariants} onSubmit={onSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {loginType === "citizen" ? (
                <motion.div
                  key="citizen-field"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-2"
                >
                  <Label htmlFor="nik" className="text-[#2e4658]">
                    Nomor identitas (NIK)
                  </Label>
                  <div className="relative">
                    <IdCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#4FB3B3]" />
                    <Input
                      id="nik"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="Masukkan nomor identitas Anda"
                      value={nik}
                      onChange={onNikChange}
                      className="h-11 rounded-2xl border-[#c6d0d8] bg-white pl-10 text-[#243746] placeholder:text-[#7f919c] focus-visible:border-[#4FB3B3] focus-visible:ring-[#4FB3B3]/20"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="gov-field"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-[#2e4658]">
                    Email Resmi
                  </Label>
                  <div className="relative">
                    <IdCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#F25C7A]" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nama@rembuka.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-2xl border-[#c6d0d8] bg-white pl-10 text-[#243746] placeholder:text-[#7f919c] focus-visible:border-[#F25C7A] focus-visible:ring-[#F25C7A]/20"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${loginType}-password-container`}
                initial={{ opacity: 0, x: loginType === "citizen" ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: loginType === "citizen" ? 10 : -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#2e4658]">
                    Kata Sandi
                  </Label>
                  {loginType === "citizen" && (
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-[#3F5C73] hover:text-[#2b4254]"
                    >
                      Lupa kata sandi?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className={cn(
                    "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2",
                    loginType === "citizen" ? "text-[#F25C7A]" : "text-[#3F5C73]"
                  )} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi Anda"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={cn(
                      "h-11 rounded-2xl border-[#c6d0d8] bg-white px-10 text-[#243746] placeholder:text-[#7f919c] focus-visible:ring-2",
                      loginType === "citizen" 
                        ? "focus-visible:border-[#F25C7A] focus-visible:ring-[#F25C7A]/20" 
                        : "focus-visible:border-[#3F5C73] focus-visible:ring-[#3F5C73]/20"
                    )}
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
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {notice ? (
                <motion.div
                  key={notice}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-[#cde4e4] bg-[#eff9f9] px-4 py-3 text-sm text-[#2d6868]"
                >
                  {notice}
                </motion.div>
              ) : null}
            </AnimatePresence>

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

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "h-11 w-full rounded-2xl text-base font-semibold text-white shadow-xl transition hover:-translate-y-0.5",
                loginType === "citizen" ? "bg-[#3F5C73] hover:bg-[#314b60]" : "bg-[#F25C7A] hover:bg-[#d94e6a]"
              )}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Mengautentikasi...
                </>
              ) : (
                <>
                  <LoaderCircle className="mr-2 size-4 transition group-hover/button:rotate-180" />
                  Masuk ke portal {loginType === "citizen" ? "warga" : "pemerintah"}
                </>
              )}
            </Button>
          </motion.form>
        </CardContent>

        {loginType === "citizen" && (
          <CardFooter className="flex flex-col items-start gap-2 border-t border-[#e2e8ed] bg-[#f6f8fa] px-6 py-4 text-xs text-[#6f808c]">
            <AuthLinkRow question="Belum punya akun?" href="/register" label="Daftar akun baru" />
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
