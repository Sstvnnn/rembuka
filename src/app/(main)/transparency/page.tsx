import { getArchivedDocuments } from "@/app/actions/transparency";
import { createClient } from "@/lib/supabase/server";
import TransparencyArchiveClient from "./transparency-client";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Dokumentasi Transparansi | Rembuka",
  description:
    "Arsip publik permanen untuk kebijakan dan usulan yang telah selesai.",
};

export default async function TransparencyPage() {
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
    if (profile) userLocation = profile.location;
  }

  // Ambil data yang SUDAH SELESAI
  const { data, error } = await getArchivedDocuments(userLocation);

  if (error) {
    return (
      <div className="container mx-auto py-32 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F5F2] px-4 pt-32 pb-12 sm:px-8 text-[#1A1F2B]">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="relative overflow-hidden rounded-3xl text-white shadow-xl min-h-[320px] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a3d6b]/95 via-[#11538C]/75 to-[#0a2540]/35" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_30%)]" />
          <div className="relative z-10 p-8 md:p-12 lg:p-14 max-w-3xl">
            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black leading-tight drop-shadow-lg">
              Dokumentasi Transparansi
            </h1>
            <p className="mt-4 max-w-2xl text-sm md:text-base text-blue-100/90 leading-relaxed">
              Arsip permanen yang merekam seluruh hasil akhir kebijakan nasional
              dan keputusan pembangunan daerah. Dat di halaman ini bersifat
              final dan dapat diaudit secara publik.
            </p>
          </div>
        </section>
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
          <TransparencyArchiveClient initialData={data || []} />
        </div>
      </div>
    </main>
  );
}
