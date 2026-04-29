import Link from "next/link";
import {
  ArrowRight,
  FileCheck,
  ScrollText,
  Landmark,
  Construction,
  Inbox,
  MessageSquare,
  FileSearch,
  RefreshCcw,
  CheckCircle2,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";

export const metadata = {
  title: "Governance Dashboard | Rembuka",
};

export default async function GovernanceDashboardPage() {
  const supabase = await createClient();
  const { profile } = (await getCurrentProfile()) as { profile: any };

  let query = supabase
    .from("vw_board_tracker")
    .select("item_type, status, location");

  if (profile?.location && profile.location !== "Nasional") {
    query = query.in("location", ["Nasional", profile.location]);
  } else if (profile?.location === "Nasional") {
    query = query.eq("location", "Nasional");
  }

  const { data: boardData } = await query;
  const safeData = boardData || [];

  const regData = safeData.filter((item) => item.item_type === "LEGISLATION");
  const regulasiStats = [
    {
      label: "Draf Masuk",
      value: regData.filter((i) => i.status === "DRAF_MASUK").length,
      icon: Inbox,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100",
    },
    {
      label: "Masa Opini Publik",
      value: regData.filter((i) => i.status === "MASA_OPINI").length,
      icon: MessageSquare,
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-100",
    },
    {
      label: "Proses Verifikasi",
      value: regData.filter((i) => i.status === "VERIFIKASI").length,
      icon: FileSearch,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
    },
    {
      label: "Direvisi",
      value: regData.filter((i) => i.status === "REVISI").length,
      icon: RefreshCcw,
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-100",
    },
  ];

  const propData = safeData.filter((item) => item.item_type === "PROPOSAL");
  const proposalStats = [
    {
      label: "Pemeriksaan Data",
      value: propData.filter((i) => i.status === "PEMERIKSAAN_DATA").length,
      icon: FileCheck,
      color: "text-slate-600",
      bg: "bg-slate-50 border-slate-200",
    },
    {
      label: "Pemilihan Prioritas",
      value: propData.filter((i) => i.status === "PEMILIHAN_PRIORITAS").length,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-100",
    },
    {
      label: "Alokasi Dana",
      value: propData.filter((i) => i.status === "ALOKASI_DANA").length,
      icon: Landmark,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      label: "Sedang Dibangun",
      value: propData.filter((i) => i.status === "SEDANG_DIBANGUN").length,
      icon: Construction,
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-100",
    },
    {
      label: "Proyek Selesai",
      value: propData.filter((i) => i.status === "PROYEK_SELESAI").length,
      icon: CheckCircle2,
      color: "text-teal-600",
      bg: "bg-teal-50 border-teal-100",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 pb-12 pt-8 sm:px-8 text-[#1A1F2B]">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* HEADER */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <h1 className="mt-3 font-heading text-4xl font-black tracking-tight text-[#11538C]">
            Selamat Datang, Governance {profile?.location}
          </h1>
          <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-slate-500">
            Pantau pergerakan status draf kebijakan nasional dan usulan
            pembangunan daerah secara real-time.
          </p>
        </section>

        {/* BAGIAN 1: REGULASI KEBIJAKAN */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-800">
              <Landmark className="size-5 text-[#11538C]" />
              Regulasi Kebijakan (RUU/Perda)
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {regulasiStats.map((item) => (
              <article
                key={item.label}
                className={`rounded-[1.5rem] border bg-white p-6 shadow-sm transition-all hover:shadow-md ${item.bg}`}
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-2xl bg-white shadow-sm ${item.color}`}
                >
                  <item.icon className="size-5" />
                </div>
                <p className="mt-5 text-4xl font-black tracking-tight text-slate-800">
                  {item.value}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-slate-600">
                  {item.label}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* BAGIAN 2: PROPOSAL PEMBANGUNAN */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-800">
              <Construction className="size-5 text-[#11538C]" />
              Proposal Pembangunan Daerah
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {proposalStats.map((item) => (
              <article
                key={item.label}
                className={`rounded-[1.5rem] border bg-white p-6 shadow-sm transition-all hover:shadow-md ${item.bg}`}
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-2xl bg-white shadow-sm ${item.color}`}
                >
                  <item.icon className="size-5" />
                </div>
                <p className="mt-5 text-3xl font-black tracking-tight text-slate-800">
                  {item.value}
                </p>
                <p className="mt-1.5 text-xs font-semibold leading-snug text-slate-600">
                  {item.label}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* JUMP TO TRACKER BUTTON */}
        <section className="pt-4">
          <Link
            href="/governance/tracker"
            className="group flex w-full md:w-auto items-center justify-between rounded-[2rem] bg-[#11538C] px-8 py-6 text-white shadow-lg shadow-[#11538C]/15 transition-all hover:bg-[#0c3e6b]"
          >
            <div>
              <h2 className="text-xl font-black tracking-tight">
                Kelola di Board Tracker
              </h2>
              <p className="mt-1.5 text-sm text-blue-100">
                Pindahkan status dokumen
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}
