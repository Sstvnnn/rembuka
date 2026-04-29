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
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-black text-[#1A1F2B] tracking-tight leading-tight font-heading">
              Dokumentasi <span className="text-[#11538C]">Transparansi</span>
            </h1>
            <p className="mt-4 text-slate-500 font-medium max-w-2xl leading-relaxed">
              Arsip permanen yang merekam seluruh hasil akhir kebijakan nasional
              dan keputusan pembangunan daerah. Data di halaman ini bersifat
              final dan dapat diaudit secara publik.
            </p>
          </div>

          <TransparencyArchiveClient initialData={data || []} />
        </div>
      </main>
    </div>
  );
}
