"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, KeyRound, LoaderCircle, Mail, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
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

type ProfileSettingsProps = {
  email: string;
  nik: string;
  fullName: string;
  location: string;
  verificationStatus: string;
  citizenCardUrl: string | null;
};

function statusCopy(status: string) {
  switch (status) {
    case "pending_review":
      return "Citizen card uploaded and waiting for manual review.";
    case "verified":
      return "Citizen card reviewed and approved.";
    case "rejected":
      return "Citizen card was reviewed but rejected. Upload a clearer image.";
    default:
      return "No citizen card uploaded yet.";
  }
}

export function ProfileSettings({
  email,
  nik,
  fullName: initialFullName,
  location: initialLocation,
  verificationStatus,
  citizenCardUrl,
}: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [location, setLocation] = useState(initialLocation);
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
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("location", location);

    if (profileFile) {
      formData.append("citizenCard", profileFile);
    }

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

      setProfileSuccess("Profile updated successfully.");
      window.location.reload();
    } catch {
      setProfileError("Unable to update profile.");
    } finally {
      setProfileLoading(false);
    }
  }

  function handleProfileFileChange(file: File | null) {
    setProfileFile(file);

    if (profilePreviewUrl) {
      URL.revokeObjectURL(profilePreviewUrl);
    }

    setProfilePreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function onPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
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

      setPasswordSuccess("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Unable to update password.");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <Card className="rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(63,92,115,0.12)]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#243746]">Profile details</CardTitle>
            <CardDescription>Review and update the account information shown across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onProfileSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#4FB3B3]" />
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="h-11 rounded-2xl pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#F25C7A]" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      className="h-11 rounded-2xl pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#4FB3B3]" />
                    <Input value={email} disabled className="h-11 rounded-2xl pl-10 opacity-100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Identity number</Label>
                  <Input value={nik} disabled className="h-11 rounded-2xl font-mono opacity-100" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="citizen-card">Replace citizen card</Label>
                <label
                  htmlFor="citizen-card"
                  className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#b7c5cf] bg-[#f8fbfc] px-4 py-4 transition hover:border-[#4FB3B3] hover:bg-[#eef8f8]"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#4FB3B3]/15 text-[#4FB3B3]">
                    <Camera className="size-5" />
                  </div>
                  <div>
                  <p className="text-sm font-medium text-[#243746]">
                    {profileFile ? profileFile.name : "Upload a clearer citizen card image"}
                  </p>
                  <p className="text-xs text-[#748794]">
                    Uploading a new image will send the account back to pending review.
                  </p>
                </div>
              </label>
              <Input
                id="citizen-card"
                type="file"
                accept="image/*"
                onChange={(event) => handleProfileFileChange(event.target.files?.[0] ?? null)}
                className="hidden"
              />
            </div>

              <AnimatePresence mode="wait">
                {profileError ? (
                  <motion.div
                    key={profileError}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-[#f3b3c0] bg-[#fff1f5] px-4 py-3 text-sm text-[#b63d59]"
                  >
                    {profileError}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {profileSuccess ? (
                  <motion.div
                    key={profileSuccess}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-[#cde4e4] bg-[#eff9f9] px-4 py-3 text-sm text-[#2d6868]"
                  >
                    {profileSuccess}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <Button type="submit" disabled={profileLoading} className="h-11 rounded-2xl bg-[#3F5C73] text-white">
                {profileLoading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Saving profile...
                  </>
                ) : (
                  <>
                    <LoaderCircle className="mr-2 size-4" />
                    Save profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(63,92,115,0.12)]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#243746]">Change password</CardTitle>
            <CardDescription>Update your password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onPasswordSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#F25C7A]" />
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="h-11 rounded-2xl pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm new password</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#F25C7A]" />
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="h-11 rounded-2xl pl-10"
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {passwordError ? (
                  <motion.div
                    key={passwordError}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-[#f3b3c0] bg-[#fff1f5] px-4 py-3 text-sm text-[#b63d59]"
                  >
                    {passwordError}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {passwordSuccess ? (
                  <motion.div
                    key={passwordSuccess}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-[#cde4e4] bg-[#eff9f9] px-4 py-3 text-sm text-[#2d6868]"
                  >
                    {passwordSuccess}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <Button type="submit" disabled={passwordLoading} className="h-11 rounded-2xl bg-[#F25C7A] text-white">
                {passwordLoading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Updating password...
                  </>
                ) : (
                  <>
                    <LoaderCircle className="mr-2 size-4" />
                    Update password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(63,92,115,0.12)]">
        <CardHeader>
          <CardTitle className="text-2xl text-[#243746]">Verification</CardTitle>
          <CardDescription>{statusCopy(verificationStatus)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-[#d8e2e8] bg-[#f8fbfc] px-3 py-2 text-sm font-medium text-[#3F5C73]">
            <ShieldCheck className="mr-2 size-4" />
            Status: {verificationStatus}
          </div>

          {profilePreviewUrl || citizenCardUrl ? (
            <div className="overflow-hidden rounded-[1.5rem] border border-[#d8e2e8] bg-[#f8fbfc]">
              <Image
                src={profilePreviewUrl ?? citizenCardUrl ?? ""}
                alt="Citizen card"
                width={800}
                height={520}
                className="h-auto w-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#d8e2e8] bg-[#f8fbfc] px-4 py-10 text-center text-sm text-[#617580]">
              No citizen card uploaded yet.
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-[#f6f8fa] text-xs text-[#617580]">
          pending_review means the card was uploaded successfully but still needs manual admin verification.
        </CardFooter>
      </Card>
    </div>
  );
}
