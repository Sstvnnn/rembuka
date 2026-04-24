/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { Plus, AlertTriangle, Trophy, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProposalList } from "@/components/proposals/proposal-list";
import { ProposalPeriodManager } from "@/components/proposals/proposal-period-manager";
import { PhaseCountdown } from "@/components/proposals/phase-countdown";
import { PeriodTimeline } from "@/components/proposals/period-timeline";
import { PeriodSelector } from "@/components/proposals/period-selector";
import { getCurrentProfile } from "@/lib/profile";
import { getProposalPhase, getProposalPhaseLabel } from "@/lib/proposal-periods";
import { getProposals, getProposalVotes, getRelevantProposalPeriod, getTopRankedProposals, getProposalPeriods, getProposalPeriodById } from "@/lib/proposals";
import { Proposal } from "@/types/musrenbang";

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

    if (role === "admin") {
      return (
        <main className="flex min-h-screen items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6 rounded-[2.5rem] border border-slate-100 bg-white p-12 text-center shadow-2xl">
            <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-500">
              <AlertTriangle className="size-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-800">Akses Dibatasi</h2>
              <p className="text-sm font-medium text-slate-500">Ruang Aspirasi Daerah hanya digunakan oleh warga dan pemerintah wilayah. Admin fokus pada antrian verifikasi identitas.</p>
            </div>
            <Button asChild className="h-12 w-full rounded-2xl bg-slate-800 font-bold text-white hover:bg-slate-700">
              <Link href="/admin/queue">Buka Antrian Admin</Link>
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
      ? (allPeriods.find(p => p.id === selectedPeriodId) || await getProposalPeriodById(selectedPeriodId))
      : relevantPeriod;

    const isHistorical = period?.id !== relevantPeriod?.id;
    const currentPhase = getProposalPhase(period);
    const pageTitle =
      currentPhase === "proposal"
        ? "Aspirasi Warga per Wilayah"
        : currentPhase === "voting"
          ? "Pemungutan Suara Wilayah"
          : "Ruang Aspirasi Daerah";

    let proposals: Proposal[] = [];
    let userVotes: any[] = [];
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
        currentPhase === "results" ? getTopRankedProposals(period.id, 3) : Promise.resolve([]),
      ]);

      proposals = fetchedProposals;
      userVotes = fetchedVotes;
      topProposals = fetchedTop;
    }

    const isWaitingForNewSession = !period && allPeriods.length > 0;

    return (
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(79,179,179,0.1),transparent_50%),#f8fafc] px-4 pb-12 pt-32 sm:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4FB3B3]">Ruang Aspirasi Daerah</p>
                {isHistorical && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Arsip Historis</span>
                )}
                {isWaitingForNewSession && (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">Menunggu Jadwal Baru</span>
                )}
              </div>
              <h1 className="font-heading text-4xl font-black tracking-tight text-slate-800">{pageTitle}</h1>
              <p className="max-w-2xl text-sm font-medium text-slate-500">
                {currentPhase === "voting"
                  ? "Masa pengajuan telah ditutup. Warga sekarang memilih tiga proposal terbaik yang sudah disetujui pemerintah wilayah."
                  : isWaitingForNewSession
                    ? "Sesi sebelumnya telah berakhir. Silakan pilih riwayat sesi melalui menu dropdown untuk melihat hasil pemenang sebelumnya."
                    : "Warga mengajukan satu aspirasi dalam jadwal wilayah yang aktif. Pemerintah wilayah meninjau proposal, lalu warga memilih tiga prioritas terbaik saat sesi voting dibuka."}
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                {period ? `Fase aktif: ${getProposalPhaseLabel(currentPhase)}` : "Tidak ada sesi aktif di wilayah ini"}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <History className="hidden" /> {/* pre-warm icon if needed */}
              <PeriodSelector 
                periods={allPeriods} 
                currentPeriodId={period?.id} 
                activePeriodId={relevantPeriod?.id}
              />
              
              {!isHistorical && !isWaitingForNewSession && userType === "citizen" && currentPhase === "proposal" ? (
                <Button asChild className="h-12 rounded-2xl bg-[#3F5C73] px-6 font-bold text-white shadow-xl shadow-[#3F5C73]/20 hover:bg-[#314b60]">
                  <Link href="/proposals/submit" className="flex items-center gap-2">
                    <Plus className="size-4" /> Ajukan Aspirasi
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          {isWaitingForNewSession && (
            <div className="rounded-[2.5rem] border border-dashed border-slate-200 bg-white/50 p-12 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <History className="size-8" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-800">Sesi Wilayah Selesai</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">Sesi saat ini telah berakhir. Anda dapat melihat hasil pemenang dan proposal sesi sebelumnya menggunakan tombol riwayat di atas.</p>
            </div>
          )}

          {!isHistorical && userType === "governance" && role !== "admin" ? (
            <ProposalPeriodManager location={location} currentPeriod={period} currentPhase={currentPhase} />
          ) : null}

          {topProposals.length > 0 && period ? (
            <div className="mb-8 rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-xl">
               <PeriodTimeline period={period} />
            </div>
          ) : null}

          {topProposals.length > 0 ? (
            <section className="rounded-[2.5rem] border border-amber-100 bg-white/80 p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <Trophy className="size-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Hasil Wilayah</p>
                  <h2 className="text-2xl font-black tracking-tight text-slate-800">3 Aspirasi Teratas</h2>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {topProposals.map((proposal, index) => (
                  <div key={proposal.id} className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Peringkat #{index + 1}</p>
                    <h3 className="mt-3 text-lg font-bold text-slate-800">{proposal.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{proposal.total_points ?? 0} poin - {proposal.total_votes ?? 0} suara</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {period && !isHistorical ? <PhaseCountdown period={period} /> : null}

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
      </main>
    );
  } catch (err) {
    console.error("ProposalsPage data fetch error:", err);

    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6 rounded-[2.5rem] border border-slate-100 bg-white p-12 text-center shadow-2xl">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
            <AlertTriangle className="size-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-800">Kesalahan Akses</h2>
            <p className="text-sm font-medium text-slate-500">Kami mengalami masalah saat memuat Ruang Aspirasi Daerah. Silakan coba lagi nanti.</p>
          </div>
          <Button asChild className="h-12 w-full rounded-2xl bg-slate-800 font-bold text-white hover:bg-slate-700">
            <Link href="/home">Kembali ke Beranda</Link>
          </Button>
        </div>
      </main>
    );
  }
}

