import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Wallet, Trophy, Clock, User, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GovernanceControls } from "./governance-controls";
import { getCurrentProfile } from "@/lib/profile";
import { formatPeriodDateTime, getProposalPhase, getProposalPhaseLabel } from "@/lib/proposal-periods";
import { getProposalById } from "@/lib/proposals";
import { CATEGORY_MAPPING, STATUS_MAPPING } from "@/lib/constants/mappings";

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposal = await getProposalById(id);
  const { user, userType, profile, role } = await getCurrentProfile();

  if (!proposal) {
    notFound();
  }

  if (role === "admin") {
    notFound();
  }

  if (profile?.location && proposal.location !== profile.location) {
    notFound();
  }

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

  const currentPhase = getProposalPhase(period);
  const isGovernance = userType === "governance" && role === "governance";
  const isOwner = proposal.author_id === user.id;
  const canVote = userType === "citizen" && proposal.status === "approved" && currentPhase === "voting";

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const getImageUrl = (path: string) => `${baseUrl}/storage/v1/object/public/proposal-attachments/${path}`;

  const statusLabel = proposal.status === "approved" && currentPhase === "voting"
    ? STATUS_MAPPING.voting
    : proposal.status === "approved" && currentPhase === "results"
      ? STATUS_MAPPING.results
      : STATUS_MAPPING[proposal.status] || proposal.status;

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 pb-12 pt-32 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Button asChild variant="ghost" className="-ml-4 rounded-xl text-slate-500 hover:text-slate-800">
          <Link href="/proposals" className="flex items-center gap-2">
            <ArrowLeft className="size-4" /> Kembali ke Ruang Aspirasi Daerah
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {CATEGORY_MAPPING[proposal.category] || proposal.category}
                </span>
                <span className={cn(
                  "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                  proposal.status === "rejected"
                    ? "border-rose-100 bg-rose-50 text-rose-600"
                    : proposal.status === "approved"
                      ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                      : "border-slate-200 bg-slate-100 text-slate-500"
                )}>
                  {statusLabel}
                </span>
              </div>
              <h1 className="font-heading text-4xl font-black leading-tight tracking-tight text-slate-800">{proposal.title}</h1>
            </div>

            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-2xl">
                {proposal.image_paths && proposal.image_paths.length > 0 ? (
                  <Image src={getImageUrl(proposal.image_paths[0])} alt="Dokumentasi utama" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-50 text-slate-300">
                    <ImageIcon className="size-16 opacity-10" />
                  </div>
                )}
              </div>

              {proposal.image_paths && proposal.image_paths.length > 1 ? (
                <div className="grid grid-cols-3 gap-4">
                  {proposal.image_paths.slice(1).map((path, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-2xl border border-white bg-white shadow-md">
                      <Image src={getImageUrl(path)} alt={`Dokumentasi ${index + 2}`} fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800">Ringkasan Aspirasi</h2>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-600">{proposal.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            {isGovernance && proposal.status === "pending" ? <GovernanceControls proposalId={proposal.id} /> : null}

            <Card className="rounded-[2.5rem] border-white/60 bg-white/40 shadow-xl backdrop-blur-xl">
              <CardContent className="space-y-6 p-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Peringkat Saat Ini</p>
                    <div className="flex items-center gap-2">
                      <Trophy className="size-5 text-amber-500" />
                      <span className="text-2xl font-black text-slate-800">{proposal.total_points ?? 0} <span className="text-sm font-bold text-slate-400">poin</span></span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Suara</p>
                    <p className="text-lg font-bold text-slate-800">{proposal.total_votes ?? 0}</p>
                  </div>
                </div>

                {period ? (
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                        <CalendarRange className="size-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fase Wilayah</p>
                        <p className="text-sm font-bold text-slate-800">{getProposalPhaseLabel(currentPhase)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                        <Clock className="size-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Masa Pengajuan</p>
                        <p className="text-sm font-bold text-slate-800">{formatPeriodDateTime(period.proposal_start_at)} - {formatPeriodDateTime(period.proposal_end_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                        <Clock className="size-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Masa Voting</p>
                        <p className="text-sm font-bold text-slate-800">{formatPeriodDateTime(period.voting_start_at)} - {formatPeriodDateTime(period.voting_end_at)}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lokasi</p>
                    <p className="text-sm font-bold text-slate-800">{proposal.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                    <Wallet className="size-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estimasi Anggaran</p>
                    <p className="text-sm font-bold text-[#4FB3B3]">Rp {Number(proposal.estimated_cost).toLocaleString("id-ID")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#3F5C73] text-white">
                    {isGovernance ? (proposal.author_name || "W").charAt(0) : <User className="size-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{isGovernance ? "Diajukan oleh" : "Identitas Pengusul"}</p>
                    <p className="text-sm font-bold text-slate-800">{isGovernance ? (proposal.author_name || "Anonim") : (isOwner ? "Saya (Privat)" : "Warga Terverifikasi")}</p>
                  </div>
                </div>

                {canVote ? (
                  <Button asChild className="h-14 w-full rounded-2xl bg-[#4FB3B3] font-bold text-slate-900 shadow-lg shadow-[#4FB3B3]/20 hover:bg-[#3da3a3]">
                    <Link href="/proposals">Buka Sesi Voting Wilayah</Link>
                  </Button>
                ) : (
                  <div className="flex items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                    {proposal.status === "approved" ? `Fase saat ini: ${getProposalPhaseLabel(currentPhase)}` : "Menunggu keputusan pemerintah wilayah"}
                  </div>
                )}
              </CardContent>
            </Card>

            {isOwner ? (
              <div className="rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Status Pemilik</p>
                <h4 className="mt-1 font-bold">Ini adalah aspirasi Anda</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">Anda dapat memantau status tinjauan pemerintah dan menunggu sesi voting wilayah sesuai jadwal yang telah ditetapkan.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
