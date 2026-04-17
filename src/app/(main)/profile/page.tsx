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
    <main className="min-h-screen bg-[radial-gradient(180deg,#f4f8fb_0%,#f8efeb_100%)] px-4 pt-32 pb-12 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#4FB3B3]">
            Account Management
          </p>
          <h1 className="font-heading text-4xl font-black text-slate-800 tracking-tight">Your Identity</h1>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
            Review your citizen credentials, maintain your identity documents, and secure your account access.
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
