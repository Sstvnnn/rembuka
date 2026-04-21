/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Trophy, 
  MapPin, 
  Wallet,
  Clock,
  ChevronRight,
  Image as ImageIcon,
  User,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { castVoteAction } from "@/app/actions/musrenbang";
import { Proposal } from "@/types/musrenbang";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CATEGORY_MAPPING, STATUS_MAPPING } from "@/lib/constants/mappings";

interface ProposalListProps {
  initialProposals: Proposal[];
  userVotes: any[];
  userType: string;
  currentUserId: string;
}

export function ProposalList({ 
  initialProposals = [], 
  userVotes = [], 
  userType, 
  currentUserId 
}: ProposalListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const categories = ["Semua", ...Object.values(CATEGORY_MAPPING)];

  const filteredProposals = useMemo(() => {
    let list = Array.isArray(initialProposals) ? initialProposals : [];
    if (activeTab === "mine") {
      list = list.filter(p => p.author_id === currentUserId);
    }
    return list.filter(p => {
      const title = (p?.title || "").toLowerCase();
      const description = (p?.description || "").toLowerCase();
      const searchTerm = search.toLowerCase();
      const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
      
      const dbCategory = p?.category;
      const displayCategory = CATEGORY_MAPPING[dbCategory] || dbCategory;
      const matchesCategory = activeCategory === "Semua" || displayCategory === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [initialProposals, search, activeCategory, activeTab, currentUserId]);

  const handleVote = async (proposalId: string, rank: 1 | 2 | 3) => {
    startTransition(async () => {
      try {
        await castVoteAction(proposalId, rank);
        router.refresh();
      } catch (err) {
        console.error("Voting failed", err);
      }
    });
  };

  const getUserVoteForProposal = (proposalId: string) => {
    return (userVotes || []).find(v => v?.proposal_id === proposalId);
  };

  const getUserProposalForRank = (rank: number) => {
    return (userVotes || []).find(v => v?.rank === rank);
  };

  const getImageUrl = (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    return `${baseUrl}/storage/v1/object/public/proposal-attachments/${path}`;
  };

  return (
    <div className="space-y-8">
      {/* Search & Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
          <button onClick={() => setActiveTab("all")} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Semua Proposal</button>
          <button onClick={() => setActiveTab("mine")} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === "mine" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>Proposal Saya</button>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-white/60">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input placeholder="Cari proposal..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-12 rounded-2xl border-slate-200 bg-white/50 focus:bg-white transition-all" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", activeCategory === cat ? "bg-[#3F5C73] text-white shadow-lg shadow-[#3F5C73]/20" : "bg-white/50 text-slate-500 hover:bg-white")}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map(rank => {
          const vote = getUserProposalForRank(rank);
          const proposal = vote ? (initialProposals || []).find(p => p.id === vote.proposal_id) : null;
          return (
            <div key={rank} className={cn("p-4 rounded-3xl border transition-all", proposal ? "bg-white/80 border-[#4FB3B3]/20 shadow-sm" : "bg-slate-50/50 border-dashed border-slate-200")}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Favorit Saya #{rank}</p>
              {proposal ? (
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-[#4FB3B3] flex items-center justify-center text-white font-black text-xs">{rank}</div>
                  <p className="text-xs font-bold text-slate-800 truncate">{proposal.title || "Tanpa Judul"}</p>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-400 italic">Belum ada pilihan</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredProposals.map((proposal) => {
            const userVote = getUserVoteForProposal(proposal.id);
            const isGovernance = userType === "governance";
            
            const isVotingStatus = proposal?.status === "voting";
            const isExpired = proposal?.expiry_date ? new Date(proposal.expiry_date) < new Date() : false;
            const isVotingOpen = isVotingStatus && !isExpired;

            const imagePaths = Array.isArray(proposal?.image_paths) ? proposal.image_paths : [];

            return (
              <motion.div layout key={proposal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="group relative flex flex-col rounded-[2.5rem] border border-white/80 bg-white/40 overflow-hidden shadow-lg backdrop-blur-xl transition-all hover:shadow-2xl hover:bg-white/60">
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-white/40">
                  {imagePaths.length > 0 ? (
                    <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                      {imagePaths.map((path, i) => (
                        <div key={i} className="relative h-full w-full shrink-0 snap-center">
                          <Image src={getImageUrl(path)} alt="Documentation" fill className="object-cover" unoptimized />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <ImageIcon className="size-12 opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">{CATEGORY_MAPPING[proposal?.category] || proposal?.category || "Umum"}</span>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 shadow-sm">
                    <Trophy className="size-3 text-amber-500" />
                    <span className="text-[10px] font-black text-slate-700">{proposal?.total_points ?? 0} pts</span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-800 line-clamp-2 min-h-[3.5rem]">{proposal?.title || "Untitled Proposal"}</h3>
                  
                  <div className="mt-4 flex items-center gap-3">
                    <div className={cn(
                      "rounded-full px-2 py-0.5 text-[8px] font-black uppercase border",
                      isVotingOpen ? "bg-amber-50 text-amber-600 border-amber-100" :
                      isExpired ? "bg-rose-50 text-rose-600 border-rose-100" :
                      proposal?.status === "pending" ? "bg-slate-100 text-slate-500 border-slate-200" :
                      "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                      {isExpired ? STATUS_MAPPING["expired"] : 
                       STATUS_MAPPING[proposal?.status] || proposal?.status}
                    </div>
                    {proposal?.expiry_date && !isExpired && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="size-2.5" />
                        <span className="text-[8px] font-bold uppercase tracking-tighter">
                          Berakhir {new Date(proposal.expiry_date).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-500 line-clamp-2">{proposal?.description}</p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><MapPin className="size-3" /> {proposal?.location}</div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Wallet className="size-3" /> Rp {Number(proposal?.estimated_cost || 0).toLocaleString()}</div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100/50">
                    {isVotingOpen ? (
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-[#4FB3B3] uppercase tracking-[0.2em] text-center">Tentukan Prioritas</p>
                        <div className="flex gap-2">
                          {[1, 2, 3].map((rank) => {
                            const isThisRank = userVote?.rank === rank;
                            const isRankTaken = getUserProposalForRank(rank) && getUserProposalForRank(rank)?.proposal_id !== proposal.id;
                            return (
                              <button key={rank} disabled={isPending} onClick={() => handleVote(proposal.id, rank as 1|2|3)} className={cn("flex-1 py-2 rounded-xl text-xs font-black transition-all border-2", isThisRank ? "bg-[#4FB3B3] border-[#4FB3B3] text-white shadow-lg" : isRankTaken ? "border-slate-100 text-slate-300 bg-slate-50/50" : "border-slate-200 text-slate-400 hover:border-[#4FB3B3] hover:text-[#4FB3B3]")}>#{rank}</button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {proposal?.status === 'pending' ? 'Tahap Verifikasi' : 'Voting Dinonaktifkan'}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-6 flex items-center gap-3">
                    <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">{isGovernance ? (proposal?.author_name || "U").charAt(0) : <User className="size-3" />}</div>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{isGovernance ? "Diajukan oleh" : "Laporan Warga"}</p>
                      <p className="text-[11px] font-bold text-slate-700">{isGovernance ? (proposal?.author_name || 'Anonim') : (proposal.author_id === currentUserId ? "Saya (Privat)" : "Warga Terverifikasi")}</p>
                    </div>
                    <Link href={`/proposals/${proposal.id}`} className="size-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-white transition-all"><ChevronRight className="size-4" /></Link>
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
