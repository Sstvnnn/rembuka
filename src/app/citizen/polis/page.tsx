import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Calendar, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";

type PolisDocument = {
  id: string;
  file_name: string | null;
  final_summary: string | null;
  created_at: string;
};

export default async function CitizenPolisPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("legal_analysis")
    .select("id, file_name, final_summary, created_at")
    .order("created_at", { ascending: false });

  const items = (data || []) as PolisDocument[];

  return (
    <main className="min-h-screen bg-[#F6F5F2] px-4 pb-12 pt-32 sm:px-8 text-[#1A1F2B]">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#11538C]">
            Citizen Workspace
          </p>
          <h1 className="mt-3 font-heading text-4xl font-black tracking-tight text-[#1A1F2B]">
            POL.IS Vote
          </h1>
          <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-slate-500">
            Baca ringkasan regulasi, kirim opini, dan ikut voting pada
            pernyataan publik yang sudah disiapkan pemerintah.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                  POL.IS
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                  <Calendar className="size-3" />
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-tight text-[#1A1F2B]">
                {item.file_name || "Dokumen Regulasi"}
              </h2>

              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-slate-500">
                {item.final_summary || "Ringkasan akan ditampilkan setelah pemerintah menyusun brief regulasi."}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-11 rounded-2xl bg-[#11538C] px-5 font-bold text-white hover:bg-[#0c3e6b]"
                >
                  <Link href={`/citizen/polis/${item.id}`}>
                    Buka Diskusi
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-2xl border-slate-200 px-5 font-bold text-slate-700"
                >
                  <Link href={`/citizen/polis/vote/${item.id}`}>
                    Masuk Voting
                    <Gavel className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
