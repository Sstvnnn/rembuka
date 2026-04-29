import { getBoardTrackerData } from "@/app/actions/tracker";
import AdminTrackerClient from "./admin-tracker-client";

export const metadata = {
  title: "Admin Tracker Board | Rembuka",
};

export default async function AdminTrackerPage() {
  const { data, error } = await getBoardTrackerData();

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <main className="min-h-screen bg-[#F6F5F2] px-4 pb-12 pt-32 sm:px-8 text-[#1A1F2B]">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#11538C]">
            Admin Workspace
          </p>
          <h1 className="mt-3 font-heading text-4xl font-black tracking-tight text-[#1A1F2B]">
            Tracker Board Management
          </h1>
          <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-slate-500">
            Perubahan status di sini langsung memengaruhi board publik warga.
            Admin menjaga konsistensi pelacakan untuk proposal pembangunan dan
            draf kebijakan.
          </p>
        </section>

        <AdminTrackerClient initialData={data || []} />
      </div>
    </main>
  );
}
