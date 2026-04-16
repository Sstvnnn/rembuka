"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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

const containerVariants = {
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

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

type LoginApiResponse = {
  error?: string;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notice, setNotice] = useState("");
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formattedNik = useMemo(() => nik.replace(/\D/g, "").slice(0, 20), [nik]);

  useEffect(() => {
    setNotice(
      searchParams.get("message") === "confirm-email"
        ? "Please confirm your email before signing in."
        : "",
    );
  }, [searchParams]);

  function onNikChange(event: ChangeEvent<HTMLInputElement>) {
    setNik(event.target.value.replace(/\D/g, "").slice(0, 20));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!/^\d{8,20}$/.test(formattedNik)) {
      setError("Please enter a valid identity number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const formData = new FormData();
    formData.append("nik", formattedNik);
    formData.append("password", password);

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as LoginApiResponse;

      if (!response.ok) {
        setError(payload.error ?? "Sign in failed.");
        return;
      }

      router.replace("/home");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
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
      <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_24px_90px_rgba(63,92,115,0.18)] backdrop-blur">
        <CardHeader className="space-y-4 border-b border-[#d7dee5] bg-[linear-gradient(135deg,rgba(79,179,179,0.18),rgba(242,92,122,0.08),rgba(255,255,255,0.95))] pb-6">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#3F5C73] text-white shadow-[4px_4px_0_rgba(79,179,179,0.35)]">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4FB3B3]">
                Sign in
              </p>
              <CardTitle className="text-2xl font-semibold text-[#243746]">
                Sign in to Rembuka
              </CardTitle>
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <CardDescription className="text-sm leading-6 text-[#587080]">
              Enter your details to continue.
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-5 px-6 py-6">
          <motion.form variants={itemVariants} onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nik" className="text-[#2e4658]">
                Identity number
              </Label>
              <div className="relative">
                <IdCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#4FB3B3]" />
                <Input
                  id="nik"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Enter your identity number"
                  value={nik}
                  onChange={onNikChange}
                  className="h-11 rounded-2xl border-[#c6d0d8] bg-white pl-10 text-[#243746] placeholder:text-[#7f919c] focus-visible:border-[#4FB3B3] focus-visible:ring-[#4FB3B3]/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#2e4658]">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#3F5C73] hover:text-[#2b4254]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#F25C7A]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 rounded-2xl border-[#c6d0d8] bg-white px-10 text-[#243746] placeholder:text-[#7f919c] focus-visible:border-[#F25C7A] focus-visible:ring-[#F25C7A]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f919c] transition hover:text-[#243746]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

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
              className="h-11 w-full rounded-2xl bg-[#3F5C73] text-base font-semibold text-white shadow-[0_10px_24px_rgba(63,92,115,0.25)] transition hover:-translate-y-0.5 hover:bg-[#314b60]"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <LoaderCircle className="mr-2 size-4 transition group-hover/button:rotate-180" />
                  Sign in
                </>
              )}
            </Button>
          </motion.form>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-2 border-t border-[#e2e8ed] bg-[#f6f8fa] px-6 py-4 text-xs text-[#6f808c]">
          <AuthLinkRow question="No password yet?" href="/register" label="Create your account" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}
