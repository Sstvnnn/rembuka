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

  console.log("DATA DARI SUPABASE:", data);
  console.log("ERROR DARI SUPABASE:", error);

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-red-500">Gagal memuat data tracker: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] font-sans">
      <main className="pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <section className="relative overflow-hidden rounded-3xl text-white shadow-xl min-h-[320px] flex items-center">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a3d6b]/95 via-[#11538C]/75 to-[#0a2540]/35" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_30%)]" />
            <div className="relative z-10 p-8 md:p-12 lg:p-14 max-w-3xl">
              <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black leading-tight drop-shadow-lg">
                Lacak Proses
              </h1>
              <p className="mt-4 max-w-2xl text-sm md:text-base text-blue-100/90 leading-relaxed">
                Lacak seluruh proses kebijakan publik dan proposal daerah secara
                real-time. Transparansi penuh dari awal hingga akhir.
              </p>
            </div>
          </section>

          <TrackerBoard initialData={data || []} />
        </div>
      </main>
    </div>
  );
}
