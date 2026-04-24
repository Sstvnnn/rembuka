"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, KeyRound, ShieldCheck, Upload, CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
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
  const isVerified = verificationStatus === "verified" || userType === "governance";
  const isRejected = verificationStatus === "rejected" && userType !== "governance";
  const isPending = verificationStatus === "pending_review" && userType !== "governance";
  const isGovernance = userType === "governance";
  const governanceTitle = position ?? role;
  
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
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
        setProfileError(payload.error ?? "Unable to update profile.");
        return;
      }

      setProfileSuccess("Identity document submitted for review.");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setProfileError("Unable to update profile.");
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
      setPasswordError("Requires 8+ chars and alphanumeric.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setPasswordError(error.message);
        return;
      }

      setPasswordSuccess("Security credentials updated.");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Unable to update password.");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        "grid gap-8",
        isGovernance ? "lg:grid-cols-1 max-w-4xl" : "lg:grid-cols-[1fr_0.8fr]"
      )}
    >
      <div className="space-y-8">
        {/* Status Notification Banner */}
        <AnimatePresence mode="wait">
          {isRejected && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 flex items-start gap-4"
            >
              <div className="size-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
                <XCircle className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight">Identitas Ditolak</h4>
                <p className="mt-1 text-xs font-medium text-rose-700 leading-relaxed">
                  Dokumen yang Anda kirimkan tidak memenuhi standar verifikasi kami. Silakan unggah foto kartu identitas yang lebih jelas dan beresolusi tinggi untuk mendapatkan kembali akses.
                </p>
              </div>
            </motion.div>
          )}

          {isPending && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 flex items-start gap-4"
            >
              <div className="size-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                <Clock className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Verifikasi Sedang Berlangsung</h4>
                <p className="mt-1 text-xs font-medium text-amber-700 leading-relaxed">
                  Kami sedang meninjau dokumen Anda. Proses ini biasanya memakan waktu 24-48 jam. Anda akan menerima akses jaringan penuh setelah disetujui.
                </p>
              </div>
            </motion.div>
          )}

          {isVerified && !isGovernance && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 flex items-start gap-4"
            >
              <div className="size-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Terverifikasi Sistem</h4>
                <p className="mt-1 text-xs font-medium text-emerald-700 leading-relaxed">
                  Selamat! Identitas Anda telah diverifikasi. Anda sekarang memiliki hak partisipasi penuh dalam Jaringan Kewargaan Rembuka.
                </p>
              </div>
            </motion.div>
          )}

          {isGovernance && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-3xl border border-[#3F5C73]/20 bg-[#3F5C73]/5 p-6 flex items-start gap-4"
            >
              <div className="size-10 rounded-2xl bg-[#3F5C73] text-white flex items-center justify-center shrink-0 shadow-lg">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#3F5C73] uppercase tracking-tight">Akses Pemerintah</h4>
                <p className="mt-1 text-xs font-medium text-slate-600 leading-relaxed">
                  Anda masuk dengan hak istimewa administratif sebagai <span className="font-bold">{governanceTitle}</span>. Beberapa modifikasi profil dibatasi oleh kebijakan jaringan.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Identity Details Card */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden rounded-[2.5rem] border-white/60 bg-white/40 shadow-2xl backdrop-blur-xl">
            <CardHeader className="bg-slate-900/5 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#3F5C73] text-white">
                  <ShieldCheck className="size-5" />
                </div>
                <CardTitle className="text-xl font-black text-slate-800 tracking-tight uppercase">
                  {isGovernance ? "Profil Pejabat Pemerintah" : "Profil Registrasi"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap</p>
                  <p className="text-base font-bold text-slate-800">{fullName}</p>
                </div>
                {isGovernance ? (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peran Resmi</p>
                    <p className="text-base font-bold text-[#4FB3B3] uppercase tracking-tight">{governanceTitle}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Registrasi (NIK)</p>
                    <p className="text-base font-mono font-bold text-[#4FB3B3]">{nik}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akses Email</p>
                  <p className="text-base font-bold text-slate-800">{email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wilayah Tugas</p>
                  <p className="text-base font-bold text-slate-800">{location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Password Security Card */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-[2.5rem] border-white/60 bg-white/40 shadow-xl backdrop-blur-xl">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-lg font-bold text-slate-800">Keamanan Akun</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={onPasswordSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 ml-1">Kata Sandi Baru</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-12 rounded-2xl border-slate-200 bg-white/50 pl-11 focus:ring-[#F25C7A]/10"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 ml-1">Konfirmasi Akses</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 rounded-2xl border-slate-200 bg-white/50 pl-11 focus:ring-[#F25C7A]/10"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {passwordError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 text-xs font-bold text-rose-500">
                      <AlertCircle className="size-3" /> {passwordError}
                    </motion.div>
                  )}
                  {passwordSuccess && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                      <CheckCircle2 className="size-3" /> {passwordSuccess}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button disabled={passwordLoading} className="h-12 rounded-2xl bg-[#F25C7A] px-10 font-bold text-white shadow-lg shadow-[#F25C7A]/20 hover:scale-[1.02] transition-transform">
                  {passwordLoading ? <LoadingSpinner /> : "Perbarui Kredensial"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Identity Card Side (Citizen Only) */}
      {!isGovernance && (
        <motion.div variants={itemVariants} className="space-y-8">
          <Card className="overflow-hidden rounded-[2.5rem] border-white/60 bg-white/40 shadow-2xl backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between px-8 py-6 bg-slate-50/50">
              <CardTitle className="text-lg font-bold text-slate-800">Token Identitas</CardTitle>
              <div className={cn(
                "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border",
                isVerified ? "bg-emerald-50 text-emerald-600 border-emerald-200" : 
                isRejected ? "bg-rose-50 text-rose-600 border-rose-200 shadow-sm shadow-rose-500/10" :
                "bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-500/10"
              )}>
                {verificationStatus === "verified" ? "Terverifikasi" : 
                 verificationStatus === "rejected" ? "Ditolak" : "Menunggu Tinjauan"}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="group relative aspect-[1.58/1] overflow-hidden rounded-3xl border-2 border-slate-200 bg-slate-100 shadow-inner">
                {profilePreviewUrl || citizenCardUrl ? (
                  <Image
                    src={profilePreviewUrl ?? citizenCardUrl ?? ""}
                    alt="Identity Document"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-slate-300">
                    <Camera className="size-12 opacity-10" />
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest">Belum Ada Dokumen</p>
                  </div>
                )}
              </div>

              {!isVerified && (
                <form onSubmit={onProfileSubmit} className="mt-8 space-y-6">
                  <div className="space-y-4">
                    <label
                      htmlFor="citizen-card"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-white/50 py-10 transition-all hover:border-[#4FB3B3] hover:bg-white group"
                    >
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-[#4FB3B3] group-hover:text-white transition-all shadow-sm">
                        <Upload className="size-6" />
                      </div>
                      <p className="mt-4 text-sm font-bold text-slate-700">
                        {profileFile ? profileFile.name : isRejected ? "Pindai Ulang Dokumen" : "Pindai Dokumen Baru"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">PNG, JPG hingga 10MB</p>
                    </label>
                    <input
                      id="citizen-card"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProfileFileChange(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {profileError && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs font-bold text-rose-500">{profileError}</motion.p>
                    )}
                    {profileSuccess && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs font-bold text-emerald-500">{profileSuccess}</motion.p>
                    )}
                  </AnimatePresence>

                  <Button 
                    type="submit" 
                    disabled={profileLoading || !profileFile} 
                    className={cn(
                      "w-full h-14 rounded-[1.5rem] font-bold text-white shadow-xl transition-transform hover:scale-[1.01]",
                      isRejected ? "bg-rose-500 shadow-rose-500/20 hover:bg-rose-600" : "bg-[#3F5C73] shadow-[#3F5C73]/20 hover:bg-[#314b60]"
                    )}
                  >
                    {profileLoading ? <LoadingSpinner /> : isRejected ? "Kirim Dokumen Baru" : "Ajukan untuk Verifikasi"}
                  </Button>
                </form>
              )}
              
              {isVerified && (
                <div className="mt-8 rounded-2xl bg-emerald-50/50 p-6 border border-emerald-100 flex items-start gap-4">
                  <div className="size-10 flex items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                    <ShieldCheck className="size-5" />
                  </div>
                  <p className="text-xs font-bold text-emerald-800 leading-relaxed uppercase tracking-tight">
                    Identitas Anda telah aman. Perubahan dokumen dikunci.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
