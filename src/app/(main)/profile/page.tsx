import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { getCurrentProfile } from "@/lib/profile";

export default async function ProfilePage() {
  const { user, profile, citizenCardUrl } = await getCurrentProfile();

  const fullName =
    profile?.full_name ??
    (user.user_metadata.full_name as string | undefined) ??
    "Verified citizen";
  const location =
    profile?.location ??
    (user.user_metadata.location as string | undefined) ??
    "Unknown";
  const email = profile?.email ?? user.email ?? "-";
  const nik = profile?.nik ?? (user.user_metadata.nik as string | undefined) ?? "-";
  const verificationStatus = profile?.verification_status ?? "missing_card";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4f8fb_0%,#f8efeb_100%)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          href="/home"
          className="inline-flex items-center rounded-full border border-[#d9e2e8] bg-white px-4 py-2 text-sm font-medium text-[#3F5C73] shadow-sm transition hover:bg-[#f8fbfc]"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to home
        </Link>

        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#4FB3B3]">
            Account Settings
          </p>
          <h1 className="font-heading text-4xl font-semibold text-[#243746]">Your profile</h1>
          <p className="max-w-2xl text-sm leading-6 text-[#617580]">
            Review your citizen profile, upload or replace your citizen card, and manage your password.
          </p>
        </section>

        <ProfileSettings
          email={email}
          nik={nik}
          fullName={fullName}
          location={location}
          verificationStatus={verificationStatus}
          citizenCardUrl={citizenCardUrl}
        />
      </div>
    </main>
  );
}
