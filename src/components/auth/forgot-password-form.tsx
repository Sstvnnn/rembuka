"use client";

import { AnimatePresence, motion } from "framer-motion";
import { IdCard, LoaderCircle } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
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

type ForgotPasswordApiResponse = {
  error?: string;
  message?: string;
};

export function ForgotPasswordForm() {
  const [nik, setNik] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formattedNik = useMemo(() => nik.replace(/\D/g, "").slice(0, 20), [nik]);

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
        setError(payload.error ?? "Unable to send the reset email.");
        return;
      }

      setSuccess(payload.message ?? "Reset email sent.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/92 shadow-[0_24px_90px_rgba(63,92,115,0.18)] backdrop-blur">
        <CardHeader className="space-y-4 border-b border-[#d7dee5] bg-[linear-gradient(135deg,rgba(79,179,179,0.18),rgba(242,92,122,0.08),rgba(255,255,255,0.95))] pb-6">
          <CardTitle className="text-2xl font-semibold text-[#243746]">
            Reset password
          </CardTitle>
          <CardDescription className="text-sm leading-6 text-[#587080]">
            Enter your identity number and we will send a reset link to your registered email.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-6 py-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nik" className="text-[#2e4658]">
                Identity number
              </Label>
              <div className="relative">
                <IdCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#4FB3B3]" />
                <Input
                  id="nik"
                  value={nik}
                  onChange={onNikChange}
                  placeholder="Enter your identity number"
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
              className="h-11 w-full rounded-2xl bg-[#3F5C73] text-base font-semibold text-white"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Sending email...
                </>
              ) : (
                <>
                  <LoaderCircle className="mr-2 size-4" />
                  Send link
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-2 border-t border-[#e2e8ed] bg-[#f6f8fa] px-6 py-4 text-xs text-[#6f808c]">
          <AuthLinkRow question="Remembered your password?" href="/login" label="Sign in" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}
