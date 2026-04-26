import { getBoardTrackerData } from "@/app/actions/tracker";
import AdminTrackerClient from "./admin-tracker-client";

export const metadata = {
  title: "Admin Board Tracker | Rembuka",
};

export default async function AdminTrackerPage() {
  const { data, error } = await getBoardTrackerData();

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8 lg:py-12 px-8 lg:px-12 space-y-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Manajemen Board Tracker
        </h1>
        <p className="text-muted-foreground mt-2">
          Ubah status draf RUU atau usulan daerah. Perubahan di sini akan
          langsung terlihat di Kanban Board warga.
        </p>
      </div>

      <AdminTrackerClient initialData={data || []} />
    </div>
  );
}
