import { getBoardTrackerData } from "@/app/actions/tracker";
import AdminTrackerClient from "./admin-tracker-client";
import { getCurrentProfile } from "@/lib/profile";

export const metadata = {
  title: "Admin Tracker Board | Rembuka",
};

export default async function AdminTrackerPage() {
  // 1. Ambil profil user yang sedang login
  const { profile, userType } = await getCurrentProfile();

  // 2. Ambil lokasi (hanya jika dia adalah governance)
  const userLocation = userType === "governance" ? profile?.location : null;

  // 3. Fetch data berdasarkan lokasi tersebut
  const { data: initialData, error } = await getBoardTrackerData(userLocation);

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <main className="min-h-screen bg-[#F6F5F2] px-4 pb-12 pt-8 sm:px-8 text-[#1A1F2B]">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <h1 className="mt-3 font-heading text-4xl font-black tracking-tight text-[#11538C]">
            Tracker Board Management
          </h1>
          <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-slate-500">
            Perubahan status di sini langsung memengaruhi board publik warga.
            Governance menjaga konsistensi pelacakan untuk draf kebijakan dan
            proposal pembangunan.
          </p>
        </section>

        <AdminTrackerClient
          initialData={initialData || []}
          userLocation={userLocation}
        />
      </div>
    </main>
  );
}
