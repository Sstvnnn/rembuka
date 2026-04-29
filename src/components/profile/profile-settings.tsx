"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  KeyRound,
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ProfileSettingsProps = {
  email: string;
  nik: string;
  fullName: string;
  location: string;
  verificationStatus: string;
  citizenCardUrl: string | null;
  userType?: string;
  role?: string;
  position?: string | null;
};

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function ProfileSettings({
  email,
  nik,
  fullName,
  location,
  verificationStatus,
  citizenCardUrl,
  userType = "citizen",
  role = "citizen",
  position,
}: ProfileSettingsProps) {
  const isVerified =
    verificationStatus === "verified" || userType === "governance";
  const isRejected =
    verificationStatus === "rejected" && userType !== "governance";
  const isPending =
    verificationStatus === "pending_review" && userType !== "governance";
  const isGovernance = userType === "governance";
  const governanceTitle = position ?? role;

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(
    null,
  );
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function onProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isVerified || !profileFile || isGovernance) return;

    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    const formData = new FormData();
    formData.append("citizenCard", profileFile);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setProfileError(payload.error ?? "Gagal memperbarui profil.");
        return;
      }

      setProfileSuccess("Dokumen identitas berhasil dikirim untuk ditinjau.");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setProfileError("Gagal memperbarui profil.");
    } finally {
      setProfileLoading(false);
    }
  }

  function handleProfileFileChange(file: File | null) {
    if (isVerified || isGovernance) return;
    setProfileFile(file);
    if (profilePreviewUrl) URL.revokeObjectURL(profilePreviewUrl);
    setProfilePreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function onPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      setPasswordError("Minimal 8 karakter alfanumerik.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setPasswordLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError(error.message);
        return;
      }

      setPasswordSuccess("Kredensial keamanan berhasil diperbarui.");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Gagal memperbarui kata sandi.");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 w-full"
    >
      {/* ── NOTIFICATION BANNERS (BLUE/SLATE ONLY) ────────────────────── */}
      <AnimatePresence mode="wait">
        {isRejected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-2xl border border-slate-300 bg-slate-100 p-5 flex items-start gap-4 shadow-sm"
          >
            <div className="size-10 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0">
              <Info className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                Verifikasi Perlu Perhatian
              </h4>
              <p className="mt-1 text-sm font-medium text-slate-600 leading-relaxed">
                Dokumen yang Anda kirimkan sebelumnya tidak memenuhi standar.
                Silakan unggah ulang foto kartu identitas yang lebih jelas untuk
                mendapatkan akses jaringan penuh.
              </p>
            </div>
          </motion.div>
        )}

        {isPending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 flex items-start gap-4 shadow-sm"
          >
            <div className="size-10 rounded-xl bg-white border border-blue-100 text-blue-500 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-950 tracking-tight">
                Menunggu Tinjauan Moderator
              </h4>
              <p className="mt-1 text-sm font-medium text-blue-800/80 leading-relaxed">
                Kami sedang meninjau dokumen Anda (biasanya memakan waktu 24-48
                jam). Anda akan menerima pemberitahuan setelah disetujui.
              </p>
            </div>
          </motion.div>
        )}

        {isVerified && !isGovernance && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 flex items-start gap-4 shadow-sm"
          >
            <div className="size-10 rounded-xl bg-white border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-950 tracking-tight">
                Identitas Terverifikasi
              </h4>
              <p className="mt-1 text-sm font-medium text-blue-800/80 leading-relaxed">
                Selamat! Anda sekarang memiliki hak partisipasi penuh dalam
                Jaringan Kewargaan Rembuka.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT GRID ─────────────────────────────────────────── */}
      <div
        className={cn(
          "grid gap-8 items-start",
          isGovernance ? "lg:grid-cols-1" : "lg:grid-cols-12",
        )}
      >
        {/* KIRI: Informasi & Password */}
        <div
          className={cn("space-y-8", isGovernance ? "w-full" : "lg:col-span-6")}
        >
          {/* Identity Details Card */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-3xl border-slate-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="size-5 text-blue-600" />
                  {isGovernance ? "Informasi Pejabat" : "Informasi Penduduk"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500">
                      Nama Lengkap
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {fullName}
                    </p>
                  </div>
                  {isGovernance ? (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-slate-500">
                        Peran Resmi
                      </p>
                      <p className="text-sm font-bold text-blue-700 capitalize">
                        {governanceTitle}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-slate-500">
                        ID Registrasi (NIK)
                      </p>
                      <p className="text-sm font-mono font-bold text-slate-900">
                        {nik}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500">
                      Akses Email
                    </p>
                    <p className="text-sm font-bold text-slate-900">{email}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500">
                      Wilayah / Domisili
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Password Security Card */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
              <CardHeader className="px-6 pt-6 pb-2">
                <CardTitle className="text-base font-bold text-slate-900">
                  Keamanan Akun
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={onPasswordSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600">
                        Kata Sandi Baru
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 focus:bg-white focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600">
                        Konfirmasi Sandi
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-11 rounded-xl border-slate-200 bg-slate-50/50 pl-10 focus:bg-white focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {passwordError && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 p-2.5 rounded-lg"
                      >
                        <AlertCircle className="size-4 text-blue-500" />{" "}
                        {passwordError}
                      </motion.div>
                    )}
                    {passwordSuccess && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-xs font-medium text-blue-800 bg-blue-50 p-2.5 rounded-lg border border-blue-100"
                      >
                        <CheckCircle2 className="size-4 text-blue-600" />{" "}
                        {passwordSuccess}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    disabled={passwordLoading}
                    className="h-11 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    {passwordLoading ? (
                      <LoadingSpinner />
                    ) : (
                      "Perbarui Kredensial"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* KANAN: Identity Document Upload (Citizen Only) */}
        {!isGovernance && (
          <motion.div variants={itemVariants} className="lg:col-span-6 h-full">
            <Card className="rounded-3xl border-slate-200 shadow-sm h-full flex flex-col">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-5 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900">
                  Dokumen KTP
                </CardTitle>
                <div
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border",
                    isVerified
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : isRejected
                        ? "bg-slate-100 text-slate-600 border-slate-300"
                        : "bg-slate-50 text-blue-600 border-slate-200",
                  )}
                >
                  {verificationStatus === "verified"
                    ? "Terverifikasi"
                    : verificationStatus === "rejected"
                      ? "Perlu Diulang"
                      : "Menunggu"}
                </div>
              </CardHeader>

              <CardContent className="p-6 flex-1 flex flex-col">
                {/* Image Box */}
                <div className="group relative aspect-[1.58/1] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm mb-6">
                  {profilePreviewUrl || citizenCardUrl ? (
                    <Image
                      src={profilePreviewUrl ?? citizenCardUrl ?? ""}
                      alt="Identity Document"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-slate-400">
                      <Camera className="size-10 opacity-20 mb-2" />
                      <p className="text-xs font-semibold uppercase tracking-wider">
                        Belum Ada KTP
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Form or Verified State */}
                {!isVerified ? (
                  <form
                    onSubmit={onProfileSubmit}
                    className="space-y-5 mt-auto"
                  >
                    <label
                      htmlFor="citizen-card"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-6 transition-all hover:border-blue-400 hover:bg-blue-50/50 group"
                    >
                      <div className="flex size-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 group-hover:text-blue-600 group-hover:border-blue-200 transition-all shadow-sm">
                        <Upload className="size-5" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-700 group-hover:text-blue-700">
                        {profileFile ? profileFile.name : "Pilih Dokumen KTP"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Maksimal 10MB (JPG/PNG)
                      </p>
                    </label>
                    <input
                      id="citizen-card"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleProfileFileChange(e.target.files?.[0] ?? null)
                      }
                      className="hidden"
                    />

                    <AnimatePresence mode="wait">
                      {profileError && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center text-xs font-medium text-slate-600 bg-slate-100 p-2 rounded-md"
                        >
                          {profileError}
                        </motion.p>
                      )}
                      {profileSuccess && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center text-xs font-medium text-blue-700 bg-blue-50 p-2 rounded-md border border-blue-100"
                        >
                          {profileSuccess}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <Button
                      type="submit"
                      disabled={profileLoading || !profileFile}
                      className={cn(
                        "w-full h-11 rounded-xl font-semibold text-white shadow-sm transition-colors",
                        isRejected
                          ? "bg-slate-800 hover:bg-slate-900"
                          : "bg-blue-600 hover:bg-blue-700",
                      )}
                    >
                      {profileLoading ? (
                        <LoadingSpinner />
                      ) : isRejected ? (
                        "Kirim Ulang Dokumen"
                      ) : (
                        "Ajukan Verifikasi"
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="mt-auto rounded-2xl bg-blue-50/50 p-5 border border-blue-100 text-center">
                    <ShieldCheck className="size-8 text-blue-500 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-medium text-blue-900/80 leading-relaxed">
                      Dokumen KTP anda sudah terverifikasi
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
