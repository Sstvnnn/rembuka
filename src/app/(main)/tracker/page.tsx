import { getBoardTrackerData } from "@/app/actions/tracker";
import TrackerBoard from "./tracker-board";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Board Tracker | Rembuka",
  description:
    "Pantau transparansi progres kebijakan nasional dan pembangunan daerah.",
};

export default async function TrackPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userLocation = null;

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("location")
      .eq("id", user.id)
      .single();

    if (profile) {
      userLocation = profile.location;
    }
  }

  const { data, error } = await getBoardTrackerData(userLocation);

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-red-500">Gagal memuat data tracker: {error}</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-5 pt-28 pb-8 space-y-6 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold mt-5 tracking-tight">
          Board Tracker
        </h1>
        <p className="text-muted-foreground mt-2">
          Lacak seluruh proses kebijakan publik dan aspirasi daerah secara
          real-time.
        </p>
      </div>

      {/* Melempar data ke Client Component untuk di-render jadi Kanban/Tabs */}
      <TrackerBoard initialData={data || []} />
    </main>
  );
}
