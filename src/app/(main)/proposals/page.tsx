import Link from "next/link";
import {
  AlertTriangle,
  CalendarRange,
  History,
  LayoutPanelTop,
  Plus,
  Trophy,
} from "lucide-react";
import { PROPOSAL_STATUS } from "@/lib/constants/tracker";
import { Button } from "@/components/ui/button";
import { ProposalList } from "@/components/proposals/proposal-list";
import { ProposalPeriodManager } from "@/components/proposals/proposal-period-manager";
import { PhaseCountdown } from "@/components/proposals/phase-countdown";
import { PeriodTimeline } from "@/components/proposals/period-timeline";
import { PeriodSelector } from "@/components/proposals/period-selector";
import { getCurrentProfile } from "@/lib/profile";
import { getProposalPhase, getProposalPhaseLabel } from "@/lib/proposal-periods";
import {
  getProposals,
  getProposalVotes,
  getRelevantProposalPeriod,
  getTopRankedProposals,
  getProposalPeriods,
  getProposalPeriodById,
} from "@/lib/proposals";
import { Proposal } from "@/types/musrenbang";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProposalVote = {
  proposal_id: string;
  rank: number;
};

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ periodId?: string }>;
}) {
  try {
    const { periodId: selectedPeriodId } = await searchParams;
    const profileData = await getCurrentProfile();
    const user = profileData.user;
    const userType = profileData.userType;
    const role = profileData.role;
    const location = profileData.profile?.location || "";
    const basePath =
      userType === "governance" ? "/governance/proposals" : "/citizen/proposals";

    if (role === "admin") {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#F6F5F2] p-8 selection:bg-[#11538C]/20">
          <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-amber-100 bg-amber-50 text-amber-600">
              <AlertTriangle className="size-8" />
            </div>
            <div className="space-y-3">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-[#1A1F2B]">
                Akses Dibatasi
              </h2>
              <p className="text-sm font-medium leading-relaxed text-slate-600">
                Ruang Proposal Daerah hanya dapat diakses oleh warga dan
                pemerintah daerah. Admin difokuskan pada manajemen verifikasi
                pengguna.
              </p>
            </div>
            <Button
              asChild
              className="h-12 w-full rounded-lg bg-[#11538C] font-bold text-white shadow-[#11538C]/20 transition-all hover:bg-[#0c3e6b] hover:shadow-lg"
            >
              <Link href="/admin/queue">Menuju Dasbor Admin</Link>
            </Button>
          </div>
        </main>
      );
    }

    const [relevantPeriod, allPeriods] = await Promise.all([
      getRelevantProposalPeriod(location),
      getProposalPeriods(location),
    ]);

    const period = selectedPeriodId
      ? allPeriods.find((item) => item.id === selectedPeriodId) ||
        (await getProposalPeriodById(selectedPeriodId))
      : relevantPeriod;

    const isHistorical = period?.id !== relevantPeriod?.id;
    const currentPhase = getProposalPhase(period);
    const pageTitle =
      currentPhase === "proposal"
        ? "Usulan Warga Daerah"
        : currentPhase === "voting"
          ? "Penentuan Prioritas"
          : "Proposal Daerah";

    let proposals: Proposal[] = [];
    let userVotes: ProposalVote[] = [];
    let topProposals: Proposal[] = [];

    if (period) {
      const [fetchedProposals, fetchedVotes, fetchedTop] = await Promise.all([
        getProposals({
          periodId: period.id,
          userType,
          role,
          userLocation: location,
        }),
        getProposalVotes(user.id, period.id),
        currentPhase === "results"
          ? getTopRankedProposals(period.id, 3)
          : Promise.resolve([]),
      ]);

      proposals = fetchedProposals;
      userVotes = fetchedVotes;
      topProposals = fetchedTop;

      if (currentPhase === "results" && topProposals.length > 0) {
        const winningIds = new Set(topProposals.map((proposal) => proposal.id));
        proposals = proposals.map((proposal) =>
          winningIds.has(proposal.id) &&
          proposal.status === PROPOSAL_STATUS.PEMILIHAN_PRIORITAS
            ? { ...proposal, status: PROPOSAL_STATUS.ALOKASI_DANA }
            : proposal,
        );
      }
    }

    const isWaitingForNewSession = !period && allPeriods.length > 0;

    return (
      <main className="min-h-screen bg-[#F4F6FA] text-[#1A1F2B] font-sans selection:bg-[#11538C]/20">
        <div className="mx-auto max-w-7xl space-y-6 px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          <section className="relative overflow-hidden rounded-[2rem] text-white shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a3d6b]/95 via-[#11538C]/75 to-[#0a2540]/35" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.22),transparent_30%)]" />
            <div className="relative z-10 grid gap-8 p-8 md:p-10 lg:grid-cols-[1.35fr_0.9fr] lg:p-12">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-100/80">
                    {location}
                  </span>
                  {isHistorical ? (
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Arsip Historis
                    </span>
                  ) : null}
                  {isWaitingForNewSession ? (
                    <span className="inline-flex items-center rounded-full bg-amber-300/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-100">
                      Menunggu Jadwal Baru
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-4 text-3xl font-black leading-tight drop-shadow-lg md:text-4xl lg:text-5xl">
                  {pageTitle}
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-blue-100/90 md:text-base">
                  {currentPhase === "voting"
                    ? "Tiga pilihan prioritas warga sedang menentukan usulan mana yang paling layak dibiayai pada periode ini."
                    : isWaitingForNewSession
                      ? "Periode aktif sedang tidak tersedia. Arsip hasil sesi sebelumnya tetap dapat dibuka melalui pemilih jadwal."
                      : "Satu ruang untuk mengajukan kebutuhan wilayah, meninjau progresnya, lalu menentukan prioritas pendanaan secara bersama."}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <span className="relative flex size-2">
                      {period ? (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-200 opacity-75" />
                      ) : null}
                      <span
                        className={cn(
                          "relative inline-flex size-2 rounded-full",
                          period ? "bg-blue-100" : "bg-slate-300",
                        )}
                      />
                    </span>
                    <p className="text-xs font-bold uppercase tracking-wider text-white">
                      {period
                        ? `Status: ${getProposalPhaseLabel(currentPhase)}`
                        : "Sesi Tidak Aktif"}
                    </p>
                  </div>

                  {period ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-50/95 backdrop-blur-sm">
                      <CalendarRange className="size-3.5" />
                      {currentPhase === "results"
                        ? "Hasil Prioritas Tersedia"
                        : "Siklus Pendanaan Berjalan"}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-100/70">
                      Proposal
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">
                      {proposals.length}
                    </p>
                    <p className="mt-1 text-xs text-blue-100/75">
                      usulan tampil pada sesi ini
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-100/70">
                      Prioritas
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">
                      {topProposals.length || 3}
                    </p>
                    <p className="mt-1 text-xs text-blue-100/75">
                      slot unggulan pendanaan
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <PeriodSelector
                    periods={allPeriods}
                    currentPeriodId={period?.id}
                    activePeriodId={relevantPeriod?.id}
                  />

                  {!isHistorical &&
                  !isWaitingForNewSession &&
                  userType === "citizen" &&
                  currentPhase === "proposal" ? (
                    <Button
                      asChild
                      className="h-12 rounded-2xl bg-white px-5 font-bold text-[#11538C] shadow-lg shadow-[#0a2540]/10 hover:bg-blue-50"
                    >
                      <Link
                        href={`${basePath}/submit`}
                        className="flex items-center gap-2"
                      >
                        <Plus className="size-4" /> Buat Usulan
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {isWaitingForNewSession ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-8 shadow-sm md:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-[#F8FAFC] text-slate-400 shadow-sm">
                  <History className="size-5" />
                </div>
                <div className="max-w-2xl">
                  <h3 className="font-heading text-xl font-bold text-[#1A1F2B]">
                    Sesi Pendanaan Ditutup
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    Periode aktif belum tersedia. Arsip hasil keputusan warga
                    tetap dapat dibuka melalui pemilih sesi.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {period && !isHistorical ? (
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <PhaseCountdown period={period} />
            </div>
          ) : null}

          {topProposals.length > 0 || period ? (
            <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              {topProposals.length > 0 ? (
                <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <Trophy className="size-5" />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-bold tracking-tight text-[#1A1F2B]">
                        Proposal Prioritas
                      </h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Tiga usulan teratas
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {topProposals.map((proposal, index) => (
                      <div
                        key={proposal.id}
                        className="rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-4 transition-all hover:border-[#11538C]/25"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[#11538C] text-sm font-bold text-white shadow-sm">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#1A1F2B]">
                              {proposal.title}
                            </h3>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                              <span className="rounded-full bg-white px-3 py-1 text-emerald-700">
                                {proposal.total_points ?? 0} poin
                              </span>
                              <span className="rounded-full bg-white px-3 py-1">
                                {proposal.total_votes ?? 0} dukungan
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {period ? (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <PeriodTimeline period={period} />
                </div>
              ) : null}
            </section>
          ) : null}

          {!isHistorical && userType === "governance" && role !== "admin" ? (
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-[#EAF2FB] text-[#11538C]">
                    <LayoutPanelTop className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                      Governance Tools
                    </p>
                    <h2 className="font-heading text-lg font-bold text-[#1A1F2B]">
                      Kendali Sesi Wilayah
                    </h2>
                  </div>
                </div>
              </div>
              <ProposalPeriodManager
                location={location}
                currentPeriod={period}
                currentPhase={currentPhase}
              />
            </div>
          ) : null}

          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            <ProposalList
              initialProposals={proposals}
              userVotes={userVotes}
              userType={userType}
              currentUserId={user.id}
              currentPhase={currentPhase}
              activePeriod={period}
              isHistorical={isHistorical}
            />
          </div>
        </div>
      </main>
    );
  } catch (err) {
    console.error("ProposalsPage data fetch error:", err);

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F5F2] p-8 selection:bg-[#11538C]/20">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-600">
            <AlertTriangle className="size-8" />
          </div>
          <div className="space-y-3">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-[#1A1F2B]">
              Gagal Memuat Data
            </h2>
            <p className="text-sm font-medium leading-relaxed text-slate-600">
              Kami mengalami kendala teknis saat menyinkronkan data Proposal Pembangunan. Silakan muat ulang halaman atau kembali ke beranda.
            </p>
          </div>
          <Button
            asChild
            className="h-12 w-full rounded-lg bg-[#1A1F2B] font-bold text-white transition-colors hover:bg-slate-800"
          >
            <Link href="/home">Kembali ke Beranda</Link>
          </Button>
        </div>
      </main>
    );
  }
}
