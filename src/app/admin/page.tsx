import Link from "next/link";
import {
  Users,
  FileCheck,
  Activity,
  Bell,
  ArrowRight,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin Dashboard | Rembuka",
};

export default async function AdminDashboardPage() {
  const supabase = await createServiceClient();

  const { count: pendingCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .in("verification_status", ["pending_review", "unverified"]);

  const { count: ongoingLegislation } = await supabase
    .from("legislation_drafts")
    .select("*", { count: "exact", head: true })
    .not("status", "in", '("REVISED", "NO_REVISION")');

  const { count: activeProposals } = await supabase
    .from("proposals")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
      <div className="max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
              Dashboard Utama
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Selamat datang di panel kontrol admin Rembuka.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full font-bold border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Bell className="size-4 mr-2" />
            Notifikasi
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
            <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Users className="size-6" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {pendingCount || 0}
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Antrian Verifikasi
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
            <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ScrollText className="size-6" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {ongoingLegislation || 0}
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Draft Kebijakan
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
            <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <FileCheck className="size-6" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {activeProposals || 0}
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Proposal Pengajuan Pembangunan
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/admin/queue"
            className="group rounded-3xl bg-blue-600 p-8 text-white relative overflow-hidden transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20"
          >
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2">Tinjau Antrian</h3>
              <p className="text-blue-100 text-sm mb-6 max-w-[200px]">
                Proses permohonan verifikasi identitas dari warga.
              </p>
              <div className="flex items-center gap-2 font-bold text-sm bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
                Mulai Proses{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 size-48 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all" />
          </Link>

          <Link
            href="/admin/tracker"
            className="group rounded-3xl bg-white border border-slate-200 p-8 relative overflow-hidden transition-all hover:shadow-lg hover:border-blue-200"
          >
            <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-800 mb-2">
                Manajemen Tracker
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-[200px]">
                Perbarui status dan progres proposal pembangunan.
              </p>
              <div className="flex items-center gap-2 font-bold text-sm text-blue-600 bg-blue-50 w-fit px-4 py-2 rounded-full">
                Kelola Proyek{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
