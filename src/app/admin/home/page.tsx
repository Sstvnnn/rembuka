import Link from "next/link";
import {
  ArrowRight,
  FileCheck,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";
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

  const { count: verifiedUser } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "verified");

  const { count: rejectedUser } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "rejected");

  return (
    <main className="min-h-screen bg-[#F6F5F2] px-4 pb-12 pt-8 sm:px-8 text-[#1A1F2B]">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <h1 className="mt-3 font-heading text-4xl font-black tracking-tight text-[#11538C]">
            Selamat Datang, Admin
          </h1>
          <p className="mt-4 max-w-4xl text-sm font-medium leading-relaxed text-slate-500">
            Kelola antrian pendaftaran dan pastikan keabsahan identitas warga
            untuk menjaga integritas prinsip "Satu KTP, Satu Suara"
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {[
            {
              label: "Antrian Verifikasi",
              value: pendingCount || 0,
              icon: Users,
            },
            {
              label: "Warga Terverifikasi",
              value: verifiedUser || 0,
              icon: Users,
            },
            {
              label: "Warga Ditolak",
              value: rejectedUser || 0,
              icon: Users,
            },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-[#11538C]">
                <item.icon className="size-6" />
              </div>
              <p className="mt-5 text-3xl font-black tracking-tight text-[#1A1F2B]">
                {item.value}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {item.label}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Link
            href="/admin/queue"
            className="group rounded-[2rem] bg-[#11538C] p-8 text-white shadow-lg shadow-[#11538C]/15 transition-all hover:bg-[#0c3e6b]"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck className="size-6" />
            </div>
            <h2 className="mt-6 text-2xl font-black tracking-tight">
              Antrian Verifikasi
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100">
              Tinjau permohonan warga yang menunggu validasi identitas dan
              proses hasilnya dari satu panel yang konsisten.
            </p>
            <span className="mt-6 inline-flex items-center text-sm font-bold">
              Buka Antrian
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}
