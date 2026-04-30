"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MapPin,
  ArrowRight,
  LucideIcon,
  Users,
  CheckCircle2,
  ChevronRight,
  Plus,
  Quote,
  Building2,
  FileText,
  Calendar,
  Gavel,
  ArrowRightLeft,
  Loader2,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROLE_MAPPING } from "@/lib/constants/mappings";
import { Footer } from "@/components/shared/footer";
import { getRoleScope, getRoleNavLinks } from "@/lib/role-routes";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: string;
  trendColor?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendColor = "text-emerald-600 bg-emerald-50",
}: StatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-4 rounded-2xl bg-white border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl",
          iconBg,
        )}
      >
        <Icon className={cn("size-6", iconColor)} />
      </div>
      <div className="min-w-0 flex-grow">
        <div className="flex items-center gap-2">
          <p className="text-2xl font-black text-[#1A1F2B] tracking-tight leading-none">
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                trendColor,
              )}
            >
              {trend}
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-slate-400 mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

interface ActivityItemProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  text: string;
  statusInfo?: string;
  time: string;
}

function ActivityItem({
  icon: Icon,
  iconBg,
  iconColor,
  text,
  statusInfo,
  time,
}: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          iconBg,
        )}
      >
        <Icon className={cn("size-4", iconColor)} />
      </div>
      <div className="min-w-0 flex-grow">
        <p className="text-[#1A1F2B] font-bold leading-relaxed">{text}</p>
        {statusInfo && (
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {statusInfo}
          </p>
        )}
        <p className="text-[11px] text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  );
}

type LegalItem = {
  id: string;
  final_summary: string;
  file_name: string | null;
  created_at: string;
};

type TrackerLog = {
  id: string;
  trackable_type: string;
  trackable_id: string;
  previous_status: string;
  new_status: string;
  change_notes: string | null;
  created_at: string;
  proposals?: { title: string };
  legal_analysis?: { file_name: string | null; final_summary: string | null };
};

type ProposalItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  created_at: string;
  estimated_cost: number | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu Tinjauan",
  approved: "Disetujui",
  rejected: "Ditolak",
  DRAFT_UPLOADED: "Draf Diunggah",
  PUBLIC_OPINION: "Opini Publik",
  VERIFICATION: "Verifikasi",
  REVISED: "Revisi",
  PEMERIKSAAN_DATA: "Pemeriksaan Data",
  PEMILIHAN_PRIORITAS: "Pemilihan Prioritas",
  ALOKASI_DANA: "Alokasi Dana",
  SEDANG_DIBANGUN: "Sedang Dibangun",
  PROYEK_SELESAI: "Proyek Selesai",
};

function fmtStatus(s: string) {
  return STATUS_LABELS[s] || s.replace(/_/g, " ");
}

function timeAgo(d: string) {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} menit yang lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam yang lalu`;
  const dy = Math.floor(h / 24);
  if (dy < 7) return `${dy} hari yang lalu`;
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface HomeClientProps {
  user: {
    user_metadata: {
      full_name?: string;
      nik?: string;
      location?: string;
    };
  };
  profile: {
    full_name?: string;
    nik?: string;
    location?: string;
    verification_status?: string;
    role?: string;
    position?: string;
  } | null;
  userType?: string;
  role?: string;
  position?: string | null;
}

export function HomeClient({
  user,
  profile,
  userType = "citizen",
  role = "citizen",
  position,
}: HomeClientProps) {
  const isGovernance = userType === "governance";
  const roleScope = getRoleScope({ userType, role });
  const navLinks = getRoleNavLinks(roleScope);
  const proposalsHref =
    navLinks.find((link) => link.label === "Building Proposals")?.href ||
    "/citizen/proposals";
  const polisHref =
    navLinks.find(
      (link) => link.label === "POL.IS Vote" || link.label === "POL.IS Rules",
    )?.href || "/citizen/legal";
  const trackerHref =
    navLinks.find((link) => link.label === "Tracker")?.href ||
    "/citizen/tracker";
  const typedProfile = profile as {
    full_name?: string;
    location?: string;
    verification_status?: string;
    nik?: string;
    position?: string;
  } | null;

  const fullName =
    typedProfile?.full_name ??
    user.user_metadata.full_name ??
    (isGovernance ? "Pejabat" : "Warga");
  const location =
    typedProfile?.location ?? user.user_metadata.location ?? "Nasional";

  const currentRole = isGovernance
    ? (position ??
      typedProfile?.position ??
      ROLE_MAPPING[role || "citizen"] ??
      "Pemerintah")
    : (ROLE_MAPPING[role || "citizen"] ?? "Warga");

  const [legalList, setLegalList] = useState<LegalItem[]>([]);
  const [trackerLogs, setTrackerLogs] = useState<TrackerLog[]>([]);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchAll() {
      setLoading(true);

      try {
        let proposalQuery = supabase
          .from("proposals")
          .select(
            "id, title, description, category, location, status, created_at, estimated_cost",
          )
          .order("created_at", { ascending: false });

        if (location && location !== "Nasional") {
          proposalQuery = proposalQuery.eq("location", location);
        }

        const [legalRes, logRes, propRes] = await Promise.all([
          supabase
            .from("legal_analysis")
            .select("id, final_summary, file_name, created_at")
            .order("created_at", { ascending: false })
            .limit(4),
          supabase
            .from("tracker_logs")
            .select(
              "id, trackable_type, trackable_id, previous_status, new_status, change_notes, created_at",
            )
            .order("created_at", { ascending: false })
            .limit(5),
          proposalQuery.limit(4),
        ]);

        if (logRes.error) console.error("Error Tracker Logs:", logRes.error);
        if (propRes.error) console.error("Error Proposals:", propRes.error);

        let enrichedLogs: TrackerLog[] = [];
        if (logRes.data) {
          enrichedLogs = await Promise.all(
            logRes.data.map(async (log) => {
              let extraData = {};

              if (log.trackable_type === "LEGISLATION" && log.trackable_id) {
                const { data } = await supabase
                  .from("documents")
                  .select("title")
                  .eq("id", log.trackable_id)
                  .maybeSingle();

                if (data) {
                  extraData = {
                    legal_analysis: {
                      file_name: data.title,
                      final_summary: null,
                    },
                  };
                }
              } else if (log.trackable_id) {
                const { data } = await supabase
                  .from("proposals")
                  .select("title")
                  .eq("id", log.trackable_id)
                  .single();
                if (data) extraData = { proposals: data };
              }

              return { ...log, ...extraData } as TrackerLog;
            }),
          );
        }

        if (legalRes.data) setLegalList(legalRes.data);
        setTrackerLogs(enrichedLogs);
        if (propRes.data) setProposals(propRes.data as ProposalItem[]);
      } catch (error) {
        console.error("Terjadi kesalahan saat mengambil data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [location]);

  return (
    <div className="min-h-screen bg-[#F6F5F2] font-sans text-[#1A1F2B]">
      <main className="pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
        >
          {/* ── HERO BANNER ─────────────────────────────────────────────── */}
          <motion.section
            variants={itemVariants}
            className="relative overflow-hidden rounded-3xl text-white shadow-xl min-h-[570px] flex items-center"
          >
            <Image
              src="/header-section-rembuka.png"
              alt="Rembuka Header"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a3d6b]/95 via-[#11538C]/70 to-transparent" />
            <div className="relative z-10 p-8 md:p-12 lg:p-14 max-w-2xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.1] drop-shadow-xl font-heading">
                Selamat datang kembali,
                <br />
                <span className="text-blue-300 italic">{fullName}!</span>
              </h1>
              <p className="mt-6 text-base md:text-lg text-blue-50/90 leading-relaxed max-w-lg drop-shadow-sm font-medium">
                {isGovernance
                  ? `Panel Kontrol Pemerintah: Akses resmi untuk wilayah ${location}. Kelola proposal, pantau opini publik, dan tinjau partisipasi warga secara real-time.`
                  : "Bersama Rembuka, mari wujudkan kebijakan yang transparan melalui musyawarah berbasis data dan voting prioritas."}
              </p>
            </div>
          </motion.section>

          {/* ── STAT CARDS ROW ──────────────────────────────────────────── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Warga Aktif"
              value="12.458"
              icon={Users}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              trend="+12%"
              trendColor="text-emerald-600 bg-emerald-50"
            />
            <StatCard
              label="Usulan Aktif"
              value="56"
              icon={FileText}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              trend="+8%"
              trendColor="text-emerald-600 bg-emerald-50"
            />
            <StatCard
              label="Konsensus Tercapai"
              value="89%"
              icon={CheckCircle2}
              iconBg="bg-sky-50"
              iconColor="text-sky-600"
              trend="+5%"
              trendColor="text-emerald-600 bg-emerald-50"
            />
            <StatCard
              label="Kota/Kabupaten"
              value="34"
              icon={Building2}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />
          </section>

          {/* ── REGULASI TERKINI (from legal_analysis) ─────────────────── */}
          <section className="grid lg:grid-cols gap-6">
            <motion.div
              variants={itemVariants}
              className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-[#1A1F2B]">
                  Regulasi Terkini
                </h2>
                <Link
                  href={polisHref}
                  className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Lihat Semua <ArrowRight className="size-4" />
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 text-blue-400 animate-spin" />
                </div>
              ) : legalList.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">
                  Belum ada data regulasi.
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
                  {legalList.map((item) => (
                    <Link
                      key={item.id}
                      href={`${polisHref}/${item.id}`}
                      className="block"
                    >
                      <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 min-w-[280px] hover:shadow-md hover:border-blue-200 transition-all group">
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                          <Gavel className="size-3" /> Regulasi
                        </span>
                        <h4 className="mt-3 text-base font-bold text-[#1A1F2B] leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {item.file_name || item.final_summary || "Regulasi"}
                        </h4>
                        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="size-3" />
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "long", year: "numeric" },
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {legalList.length > 3 && (
                    <div className="flex items-center justify-center shrink-0 pl-2">
                      <Link
                        href={polisHref}
                        className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors shadow-sm"
                      >
                        <ChevronRight className="size-5" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </section>

          <section className="grid lg:grid-cols-3 gap-6">
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-[#1A1F2B]">
                  Proposal Daerah Terbaru
                </h2>
                <Link
                  href={proposalsHref}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Lihat Semua
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 text-blue-400 animate-spin" />
                </div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">
                  Belum ada Proposal daerah.
                </div>
              ) : (
                <div className="space-y-3">
                  {proposals.map((p) => (
                    <Link
                      key={p.id}
                      href={`${proposalsHref}/${p.id}`}
                      className="block"
                    >
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                            {p.category || "Proposal"}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                              p.status === "approved"
                                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                                : p.status === "rejected"
                                  ? "bg-red-50 border border-red-200 text-red-700"
                                  : "bg-amber-50 border border-amber-200 text-amber-700",
                            )}
                          >
                            {fmtStatus(p.status)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#1A1F2B] leading-snug group-hover:text-blue-700 transition-colors">
                          {p.title}
                        </h4>
                        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {p.description}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {p.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(p.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </span>
                          {p.estimated_cost && (
                            <span>
                              Rp {p.estimated_cost.toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Aktivitas Terbaru — 1 col, from tracker_logs */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-[#1A1F2B]">
                  Aktivitas Terbaru
                </h2>
                <Link
                  href={trackerHref}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Lihat Semua
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 text-blue-400 animate-spin" />
                </div>
              ) : trackerLogs.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">
                  Belum ada aktivitas.
                </div>
              ) : (
                <div className="space-y-0">
                  {trackerLogs.map((log) => {
                    const isLeg = log.trackable_type === "LEGISLATION";

                    const itemName = isLeg
                      ? log.legal_analysis?.file_name ||
                        log.legal_analysis?.final_summary ||
                        "Regulasi"
                      : log.proposals?.title || "Usulan";

                    const statusInfo = `${fmtStatus(log.previous_status)} → ${fmtStatus(log.new_status)}`;

                    return (
                      <ActivityItem
                        key={log.id}
                        icon={isLeg ? Gavel : ArrowRightLeft}
                        iconBg={isLeg ? "bg-indigo-50" : "bg-blue-50"}
                        iconColor={isLeg ? "text-indigo-500" : "text-blue-500"}
                        text={itemName}
                        statusInfo={statusInfo}
                        time={timeAgo(log.created_at)}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          </section>

          <motion.section
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a3d6b] via-[#11538C] to-[#0a2540] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-blue-800/50 group"
          >
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-8 opacity-20 pointer-events-none transition-transform duration-700 group-hover:scale-110">
              <div className="w-64 h-64 rounded-full bg-blue-400 blur-3xl"></div>
            </div>
            <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-8 opacity-20 pointer-events-none transition-transform duration-700 group-hover:scale-110">
              <div className="w-48 h-48 rounded-full bg-indigo-400 blur-3xl"></div>
            </div>

            <div className="relative z-10 flex items-start sm:items-center gap-5 w-full md:w-auto">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-inner">
                <Quote className="size-6 text-blue-200" />
              </div>
              <div>
                <p className="text-white font-black text-lg tracking-tight">
                  Opini Jadi Data, Kebijakan Jadi Nyata.
                </p>
                <p className="text-blue-100/80 text-sm mt-1.5 max-w-lg leading-relaxed">
                  Bergabunglah dengan ribuan warga lainnya yang sudah aktif
                  membentuk masa depan kota kita bersama.
                </p>
              </div>
            </div>
            <div className="relative z-10 w-full md:w-auto shrink-0">
              <Button
                asChild
                className="w-full md:w-auto bg-white text-blue-900 hover:bg-blue-50 font-black rounded-xl px-8 h-12 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <Link
                  href={proposalsHref}
                  className="flex items-center justify-center gap-2"
                >
                  Buat Usulan Baru <Plus className="size-4" />
                </Link>
              </Button>
            </div>
          </motion.section>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
