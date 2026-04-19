import { ProfileSettings } from "@/components/profile/profile-settings";
import { getCurrentProfile } from "@/lib/profile";

export default async function ProfilePage() {
  const { user, profile, citizenCardUrl, userType, role } = await getCurrentProfile();

  const typedProfile = profile as {
    full_name?: string;
    location?: string;
    email?: string;
    nik?: string;
    verification_status?: string;
  } | null;

  const fullName =
    typedProfile?.full_name ??
    (user.user_metadata.full_name as string | undefined) ??
    (userType === "governance" ? "Governance Official" : "Verified citizen");
  const location =
    typedProfile?.location ??
    (user.user_metadata.location as string | undefined) ??
    "Unknown";
  const email = typedProfile?.email ?? user.email ?? "-";
  const nik = typedProfile?.nik ?? (user.user_metadata.nik as string | undefined) ?? "-";
  const verificationStatus = typedProfile?.verification_status ?? (userType === "governance" ? "verified" : "missing_card");

  return (
    <main className="min-h-screen bg-[radial-gradient(180deg,#f4f8fb_0%,#f8efeb_100%)] px-4 pt-32 pb-12 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#4FB3B3]">
            Account Management
          </p>
          <h1 className="font-heading text-4xl font-black text-slate-800 tracking-tight">Your Identity</h1>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
            Review your {userType === "governance" ? "official" : "citizen"} credentials, maintain your account security, and access your profile information.
          </p>
        </section>

        <ProfileSettings
          email={email}
          nik={nik}
          fullName={fullName}
          location={location}
          verificationStatus={verificationStatus}
          citizenCardUrl={citizenCardUrl}
          userType={userType}
          role={role}
        />
      </div>
    </main>
  );
}
