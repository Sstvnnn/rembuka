import { ProfileSettings } from "@/components/profile/profile-settings";
import { getCurrentProfile } from "@/lib/profile";
import { ShieldCheck, AlertCircle } from "lucide-react";

export default async function ProfilePage() {
  const { user, profile, citizenCardUrl, userType, role, position } =
    await getCurrentProfile();

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
  const nik =
    typedProfile?.nik ?? (user.user_metadata.nik as string | undefined) ?? "-";
  const verificationStatus =
    typedProfile?.verification_status ??
    (userType === "governance" ? "verified" : "missing_card");

  // Inisial untuk Avatar
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Logika Status Tanpa Warna Hijau/Merah
  const isVerified =
    verificationStatus === "verified" || verificationStatus === "approved";

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* ── COVER BANNER ──────────────────────────────────────────────── */}
      {/* Banner biru di bagian paling atas halaman */}
      <div className="h-48 w-full shadow-inner" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* ── PROFILE HEADER INFO ─────────────────────────────────────── */}
        <div className="relative -mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-slate-200">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar Box (Overlap dengan Banner) */}
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl border-4 border-slate-50 bg-blue-950 text-4xl font-bold text-white shadow-md">
              {initials}
            </div>

            {/* Teks Identitas Singkat */}
            <div className="mb-2 space-y-1.5">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {fullName}
              </h1>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <span className="capitalize text-blue-600 font-semibold">
                  {userType}
                </span>
                <span>•</span>
                <span>{email}</span>
                <span>•</span>
                <span>{location}</span>
              </p>
            </div>
          </div>

          {/* ── STATUS BADGE (BLUE/SLATE ONLY) ────────────────────────── */}
          <div className="mb-2">
            {isVerified ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Terverifikasi
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                Menunggu Verifikasi
              </div>
            )}
          </div>
        </div>

        {/* ── MAIN CONTENT (PROFILE SETTINGS FORM) ────────────────────── */}
        <div className="mt-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-xl font-bold text-slate-900">
                Pengaturan Akun & Kredensial
              </h2>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                Kelola informasi identitas digital Anda. Segala perubahan yang
                melibatkan data Nomor Induk Kependudukan (NIK) akan disinkronkan
                langsung dengan basis data{" "}
                {userType === "governance" ? "Pusat Pemerintahan" : "Rembuka"}.
              </p>
            </div>

            {/* Komponen Form dari file lain dipanggil di sini */}
            <div className="max-w-4xl">
              <ProfileSettings
                email={email}
                nik={nik}
                fullName={fullName}
                location={location}
                verificationStatus={verificationStatus}
                citizenCardUrl={citizenCardUrl}
                userType={userType}
                role={role}
                position={position}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
