"use client";

import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/loading-spinner";
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

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      const { error: updateError } = await supabase.auth.updateUser({ password });

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_24px_90px_rgba(63,92,115,0.18)] backdrop-blur">
        <CardHeader className="space-y-4 border-b border-[#d7dee5] bg-[linear-gradient(135deg,rgba(79,179,179,0.18),rgba(242,92,122,0.08),rgba(255,255,255,0.95))] pb-6">
          <CardTitle className="text-2xl font-semibold text-[#243746]">
            Atur kata sandi baru
          </CardTitle>
          <CardDescription className="text-sm leading-6 text-[#587080]">
            Pilih kata sandi baru untuk akun warga Anda.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-6 py-6">
          {!ready ? (
            <div className="rounded-2xl border border-[#d9e2e8] bg-[#f8fbfc] px-4 py-3 text-sm text-[#617580]">
              Buka halaman ini menggunakan tautan pengaturan ulang dari email Anda. Jika tautan kadaluarsa, minta yang baru.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2e4658]">
                  Kata sandi baru
                </Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#F25C7A]" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 rounded-2xl border-[#c6d0d8] bg-white pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-[#2e4658]">
                  Konfirmasi kata sandi baru
                </Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#F25C7A]" />
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="h-11 rounded-2xl border-[#c6d0d8] bg-white pl-10"
                  />
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

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-2xl bg-[#3F5C73] text-base font-semibold text-white"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Memperbarui...
                  </>
                ) : (
                  <>
                    <LoaderCircle className="mr-2 size-4" />
                    Simpan kata sandi baru
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="border-t border-[#e2e8ed] bg-[#f6f8fa] px-6 py-4 text-xs text-[#6f808c]">
          Pastikan kata sandi ini unik untuk akun Rembuka Anda.
        </CardFooter>
      </Card>
    </motion.div>
  );
}
