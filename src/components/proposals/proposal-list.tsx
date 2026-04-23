/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trophy, MapPin, Wallet, ChevronRight, Image as ImageIcon, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { castVoteAction } from "@/app/actions/musrenbang";
import { Proposal, ProposalPeriod } from "@/types/musrenbang";
import { cn } from "@/lib/utils";
import { CATEGORY_MAPPING, STATUS_MAPPING } from "@/lib/constants/mappings";
import { formatPeriodDateTime, getProposalPhaseDescription, getProposalPhaseLabel, ProposalPhase } from "@/lib/proposal-periods";

interface ProposalListProps {
  initialProposals: Proposal[];
  userVotes: any[];
  userType: string;
  currentUserId: string;
  currentPhase: ProposalPhase;
  activePeriod: ProposalPeriod | null;
}

export function ProposalList({ initialProposals = [], userVotes = [], userType, currentUserId, currentPhase, activePeriod }: ProposalListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const categories = ["Semua", ...Object.values(CATEGORY_MAPPING)];
  const isCitizen = userType === "citizen";
  const canVote = isCitizen && currentPhase === "voting";
  const phaseBannerClass =
    currentPhase === "proposal"
      ? "border-emerald-100 bg-emerald-50"
      : currentPhase === "voting"
        ? "border-amber-100 bg-amber-50"
        : "border-slate-200 bg-slate-50";

  const filteredProposals = useMemo(() => {
    let list = Array.isArray(initialProposals) ? initialProposals : [];

    if (isCitizen && activeTab === "mine") {
      list = list.filter((proposal) => proposal.author_id === currentUserId);
    }

    return list.filter((proposal) => {
      const title = (proposal.title || "").toLowerCase();
      const description = (proposal.description || "").toLowerCase();
      const searchTerm = search.toLowerCase();
      const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
      const displayCategory = CATEGORY_MAPPING[proposal.category] || proposal.category;
      const matchesCategory = activeCategory === "Semua" || displayCategory === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, activeTab, currentUserId, initialProposals, isCitizen, search]);

  function handleVote(proposalId: string, rank: 1 | 2 | 3) {
    startTransition(async () => {
      try {
        await castVoteAction(proposalId, rank);
        router.refresh();
      } catch (err) {
        console.error("Voting failed", err);
      }
    });
  }

  function getUserVoteForProposal(proposalId: string) {
    return (userVotes || []).find((vote) => vote?.proposal_id === proposalId);
  }

  function getUserProposalForRank(rank: number) {
    return (userVotes || []).find((vote) => vote?.rank === rank);
  }

  function getImageUrl(path: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    return `${baseUrl}/storage/v1/object/public/proposal-attachments/${path}`;
  }

  function getStatusLabel(proposal: Proposal) {
    if (proposal.status === "rejected") {
      return STATUS_MAPPING.rejected;
    }

    if (proposal.status === "approved" && currentPhase === "voting") {
      return STATUS_MAPPING.voting;
    }

    if (proposal.status === "approved" && currentPhase === "results") {
      return STATUS_MAPPING.results;
    }

    if (proposal.status === "approved") {
      return STATUS_MAPPING.approved;
    }

    return STATUS_MAPPING.pending;
  }

  function getStatusClass(proposal: Proposal) {
    if (proposal.status === "rejected") {
      return "bg-rose-50 text-rose-600 border-rose-100";
    }

    if (proposal.status === "approved" && currentPhase === "voting") {
      return "bg-amber-50 text-amber-600 border-amber-100";
    }

    if (proposal.status === "approved") {
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    }

    return "bg-slate-100 text-slate-500 border-slate-200";
  }

  function getVoteMessage(proposal: Proposal) {
    if (proposal.status !== "approved") {
      return proposal.status === "rejected" ? "Proposal ditolak pemerintah wilayah" : "Menunggu tinjauan pemerintah wilayah";
    }

    if (currentPhase === "proposal") {
      return "Voting dibuka setelah masa pengajuan berakhir";
    }

    if (currentPhase === "review") {
      return "Menunggu sesi voting wilayah dimulai";
    }

    if (currentPhase === "results") {
      return "Hasil akhir sesi ini telah tersedia";
    }

    if (currentPhase === "upcoming") {
      return "Jadwal wilayah belum dimulai";
    }

    return "Voting hanya tersedia untuk warga terverifikasi";
  }

  return (
    <div className="space-y-8">
      <div className={cn("rounded-[2rem] border p-6 shadow-sm", phaseBannerClass)}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Mode Ruang Aspirasi Daerah</p>
            <h2 className="mt-2 text-2xl font-black text-slate-800">
              {currentPhase === "proposal"
                ? "Masa Pengajuan Aspirasi"
                : currentPhase === "voting"
                  ? "Masa Pemungutan Suara"
                  : getProposalPhaseLabel(currentPhase)}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{getProposalPhaseDescription(currentPhase)}</p>
          </div>
          {activePeriod ? (
            <div className="min-w-[280px] rounded-2xl bg-white/80 p-4 text-sm text-slate-600">
              <p>Pengajuan: {formatPeriodDateTime(activePeriod.proposal_start_at)} - {formatPeriodDateTime(activePeriod.proposal_end_at)}</p>
              <p className="mt-2">Voting: {formatPeriodDateTime(activePeriod.voting_start_at)} - {formatPeriodDateTime(activePeriod.voting_end_at)}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {isCitizen ? (
          <div className="flex w-fit items-center gap-2 rounded-2xl bg-slate-100 p-1.5">
            <button onClick={() => setActiveTab("all")} className={cn("rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all", activeTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Semua Aspirasi</button>
            <button onClick={() => setActiveTab("mine")} className={cn("rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all", activeTab === "mine" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Aspirasi Saya</button>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-white/60 bg-white/40 p-4 backdrop-blur-md">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Cari aspirasi..." value={search} onChange={(event) => setSearch(event.target.value)} className="h-12 rounded-2xl border-slate-200 bg-white/50 pl-11 transition-all focus:bg-white" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <button key={category} onClick={() => setActiveCategory(category)} className={cn("rounded-xl px-4 py-2 text-xs font-bold transition-all", activeCategory === category ? "bg-[#3F5C73] text-white shadow-lg shadow-[#3F5C73]/20" : "bg-white/50 text-slate-500 hover:bg-white")}>{category}</button>
            ))}
          </div>
        </div>
      </div>

      {isCitizen ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((rank) => {
            const vote = getUserProposalForRank(rank);
            const proposal = vote ? initialProposals.find((item) => item.id === vote.proposal_id) : null;
            return (
              <div key={rank} className={cn("rounded-3xl border p-4 transition-all", proposal ? "border-[#4FB3B3]/20 bg-white/80 shadow-sm" : "border-dashed border-slate-200 bg-slate-50/50")}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Pilihan Saya #{rank}</p>
                {proposal ? (
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-[#4FB3B3] text-xs font-black text-white">{rank}</div>
                    <p className="truncate text-xs font-bold text-slate-800">{proposal.title}</p>
                  </div>
                ) : (
                  <p className="text-xs italic font-medium text-slate-400">Belum ada pilihan</p>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredProposals.map((proposal) => {
            const userVote = getUserVoteForProposal(proposal.id);
            const imagePaths = Array.isArray(proposal.image_paths) ? proposal.image_paths : [];
            const isProposalVoteable = canVote && proposal.status === "approved";

            return (
              <motion.div
                layout
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/40 shadow-lg backdrop-blur-xl transition-all hover:bg-white/60 hover:shadow-2xl"
              >
                <div className="relative aspect-video w-full overflow-hidden border-b border-white/40 bg-slate-100">
                  {imagePaths.length > 0 ? (
                    <div className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scrollbar-hide">
                      {imagePaths.map((path, index) => (
                        <div key={index} className="relative h-full w-full shrink-0 snap-center">
                          <Image src={getImageUrl(path)} alt="Dokumentasi" fill className="object-cover" unoptimized />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <ImageIcon className="size-12 opacity-20" />
                    </div>
                  )}
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">{CATEGORY_MAPPING[proposal.category] || proposal.category}</span>
                  </div>
                  <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 shadow-sm backdrop-blur-md">
                    <Trophy className="size-3 text-amber-500" />
                    <span className="text-[10px] font-black text-slate-700">{proposal.total_points ?? 0} pts</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-8">
                  <h3 className="min-h-[3.5rem] line-clamp-2 text-xl font-bold text-slate-800">{proposal.title || "Tanpa Judul"}</h3>

                  <div className="mt-4 flex items-center gap-3">
                    <div className={cn("rounded-full border px-2 py-0.5 text-[8px] font-black uppercase", getStatusClass(proposal))}>
                      {getStatusLabel(proposal)}
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-500">{proposal.description}</p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"><MapPin className="size-3" /> {proposal.location}</div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"><Wallet className="size-3" /> Rp {Number(proposal.estimated_cost || 0).toLocaleString("id-ID")}</div>
                  </div>

                  <div className="mt-8 border-t border-slate-100/50 pt-6">
                    {isProposalVoteable ? (
                      <div className="space-y-4">
                        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#4FB3B3]">Pilih 3 Prioritas</p>
                        <div className="flex gap-2">
                          {[1, 2, 3].map((rank) => {
                            const isThisRank = userVote?.rank === rank;
                            const isRankTaken = getUserProposalForRank(rank) && getUserProposalForRank(rank)?.proposal_id !== proposal.id;
                            return (
                              <button
                                key={rank}
                                disabled={isPending}
                                onClick={() => handleVote(proposal.id, rank as 1 | 2 | 3)}
                                className={cn(
                                  "flex-1 rounded-xl border-2 py-2 text-xs font-black transition-all",
                                  isThisRank
                                    ? "border-[#4FB3B3] bg-[#4FB3B3] text-white shadow-lg"
                                    : isRankTaken
                                      ? "border-slate-100 bg-slate-50/50 text-slate-300"
                                      : "border-slate-200 text-slate-400 hover:border-[#4FB3B3] hover:text-[#4FB3B3]"
                                )}
                              >
                                #{rank}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {getVoteMessage(proposal)}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex items-center gap-3 pt-6">
                    <div className="flex size-8 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">{userType === "governance" ? (proposal.author_name || "W").charAt(0) : <User className="size-3" />}</div>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-none">{userType === "governance" ? "Diajukan oleh" : "Aspirasi Warga"}</p>
                      <p className="text-[11px] font-bold text-slate-700">{userType === "governance" ? (proposal.author_name || "Anonim") : (proposal.author_id === currentUserId ? "Saya (Privat)" : "Warga Terverifikasi")}</p>
                    </div>
                    <Link href={`/proposals/${proposal.id}`} className="flex size-8 items-center justify-center rounded-full border border-slate-100 text-slate-400 transition-all hover:bg-white"><ChevronRight className="size-4" /></Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
