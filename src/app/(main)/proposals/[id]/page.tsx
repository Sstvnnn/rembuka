import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Wallet, Trophy, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GovernanceControls } from "./governance-controls";
import { PhaseCountdown } from "@/components/proposals/phase-countdown";
import { PeriodTimeline } from "@/components/proposals/period-timeline";
import { getCurrentProfile } from "@/lib/profile";
import {
  getProposalPhase,
  getProposalPhaseLabel,
} from "@/lib/proposal-periods";
import { getProposalById, getRelevantProposalPeriod } from "@/lib/proposals";
import { CATEGORY_MAPPING, STATUS_MAPPING } from "@/lib/constants/mappings";
import { PROPOSAL_STATUS } from "@/lib/constants/tracker";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal = await getProposalById(id);
  const { user, userType, profile, role } = await getCurrentProfile();

  if (!proposal) notFound();
  if (role === "admin") notFound();
  if (profile?.location && proposal.location !== profile.location) notFound();

  const period = proposal.period_id
    ? {
        id: proposal.period_id,
        location: proposal.location,
        proposal_start_at: proposal.proposal_start_at || "",
        proposal_end_at: proposal.proposal_end_at || "",
        voting_start_at: proposal.voting_start_at || "",
        voting_end_at: proposal.voting_end_at || "",
        created_at: proposal.created_at,
        updated_at: proposal.updated_at || proposal.created_at,
      }
    : null;

  const relevantPeriod = await getRelevantProposalPeriod(proposal.location);
  const isHistorical = period?.id !== relevantPeriod?.id;
  const currentPhase = getProposalPhase(period);
  const isGovernance = userType === "governance" && role === "governance";
  const isOwner = proposal.author_id === user.id;
  const proposalsBasePath = isGovernance
    ? "/governance/proposals"
    : "/citizen/proposals";
  const canVote =
    userType === "citizen" &&
    proposal.status === PROPOSAL_STATUS.PEMILIHAN_PRIORITAS &&
    currentPhase === "voting" &&
    !isHistorical;

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const getImageUrl = (path: string) =>
    `${baseUrl}/storage/v1/object/public/proposal-attachments/${path}`;

  const statusLabel = STATUS_MAPPING[proposal.status] || proposal.status;

  return (
    <main className="min-h-screen bg-[#F6F5F2] text-[#1A1F2B] font-sans selection:bg-[#11538C]/20 px-6 pb-24 pt-32 lg:px-8">
      <div className="mx-auto max-w-[1200px] space-y-10">
        {/* Navigation Back */}
        <Button
          asChild
          variant="ghost"
          className="-ml-4 rounded-xl text-slate-500 hover:text-[#11538C] hover:bg-blue-50/50"
        >
          <Link href={proposalsBasePath} className="flex items-center gap-2">
            <ArrowLeft className="size-4" /> Kembali ke Proposal Pembangunan
          </Link>
        </Button>

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* LEFT COLUMN: Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded border border-[#11538C]/20 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#11538C]">
                  {CATEGORY_MAPPING[proposal.category] || proposal.category}
                </span>
                <span
                  className={cn(
                    "rounded border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                    proposal.status === "rejected"
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : proposal.status === PROPOSAL_STATUS.PEMERIKSAAN_DATA
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : proposal.status === PROPOSAL_STATUS.PEMILIHAN_PRIORITAS
                          ? "border-sky-200 bg-sky-50 text-sky-700"
                          : proposal.status === PROPOSAL_STATUS.ALOKASI_DANA
                            ? "border-violet-200 bg-violet-50 text-violet-700"
                            : proposal.status === PROPOSAL_STATUS.SEDANG_DIBANGUN
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : proposal.status === PROPOSAL_STATUS.PROYEK_SELESAI
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-100 text-slate-500",
                  )}
                >
                  {statusLabel}
                </span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight tracking-tight text-[#1A1F2B]">
                {proposal.title}
              </h1>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {proposal.image_paths && proposal.image_paths.length > 0 ? (
                  <Image
                    src={getImageUrl(proposal.image_paths[0])}
                    alt="Dokumentasi utama"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-50 text-slate-300">
                    <ImageIcon className="size-12 opacity-20" />
                  </div>
                )}
              </div>
              {proposal.image_paths && proposal.image_paths.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {proposal.image_paths.slice(1).map((path, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                      <Image
                        src={getImageUrl(path)}
                        alt={`Dokumentasi ${index + 2}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h2 className="font-heading text-2xl font-bold text-[#1A1F2B]">
                Rincian Usulan
              </h2>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-600 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                {proposal.description}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Metadata & Actions */}
          <div className="space-y-6">
            {isGovernance && proposal.status === PROPOSAL_STATUS.PEMERIKSAAN_DATA && (
              <GovernanceControls proposalId={proposal.id} />
            )}
            {period && !isHistorical && <PhaseCountdown period={period} />}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 space-y-8">
                {/* Score Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Total Bobot Prioritas
                    </p>
                    <div className="flex items-center gap-2">
                      <Trophy className="size-5 text-[#11538C]" />
                      <span className="font-heading text-3xl font-bold text-[#1A1F2B]">
                        {proposal.total_points ?? 0}{" "}
                        <span className="text-sm font-bold text-slate-400">
                          poin
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Dukungan
                    </p>
                    <p className="font-heading text-xl font-bold text-[#1A1F2B]">
                      {proposal.total_votes ?? 0}{" "}
                      <span className="text-xs font-medium text-slate-400">
                        suara
                      </span>
                    </p>
                  </div>
                </div>

                {period && <PeriodTimeline period={period} />}

                {/* Metadata List */}
                <div className="space-y-6 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-400">
                      <MapPin className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Lokasi
                      </p>
                      <p className="text-sm font-bold text-[#1A1F2B]">
                        {proposal.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
                      <Wallet className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Estimasi Anggaran
                      </p>
                      <p className="text-sm font-bold text-emerald-700">
                        Rp{" "}
                        {Number(proposal.estimated_cost).toLocaleString(
                          "id-ID",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#11538C] text-white font-heading font-bold">
                      {isGovernance ? (
                        (proposal.author_name || "W").charAt(0)
                      ) : (
                        <User className="size-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {isGovernance ? "Diwakili Oleh" : "Identitas Pengusul"}
                      </p>
                      <p className="text-sm font-bold text-[#1A1F2B]">
                        {isGovernance
                          ? proposal.author_name || "Anonim"
                          : isOwner
                            ? "Saya (Anda)"
                            : "Warga Terverifikasi"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Area */}
                <div className="pt-4">
                  {canVote ? (
                    <Button
                      asChild
                      className="h-12 w-full rounded-lg bg-[#11538C] font-bold text-white shadow-lg shadow-[#11538C]/20 hover:bg-[#0c3e6b] transition-all hover:scale-105"
                    >
                      <Link href={proposalsBasePath}>
                        Ikuti Musyawarah (Voting)
                      </Link>
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {isHistorical
                        ? "Sesi ini telah dikunci (Arsip)"
                        : proposal.status === PROPOSAL_STATUS.PEMILIHAN_PRIORITAS
                          ? `Tahap Aktif: ${getProposalPhaseLabel(currentPhase)}`
                          : proposal.status === PROPOSAL_STATUS.PEMERIKSAAN_DATA
                            ? "Proposal sedang ditinjau pemerintah"
                            : `Tahap Proposal: ${statusLabel}`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-[#11538C] shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                  Status Usulan
                </p>
                <h4 className="font-heading font-bold text-lg leading-tight">
                  Ini adalah usulan Anda
                </h4>
                <p className="mt-2 text-sm leading-relaxed opacity-90">
                  Anda dapat memantau status tinjauan pemerintah dan menunggu
                  jadwal musyawarah kolektif di wilayah Anda.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
