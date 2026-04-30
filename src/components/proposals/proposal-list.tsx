"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Search,
  Trophy,
  MapPin,
  Wallet,
  Image as ImageIcon,
  User,
  Layers,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { castVoteAction } from "@/app/actions/musrenbang";
import { Proposal, ProposalPeriod } from "@/types/musrenbang";
import { cn } from "@/lib/utils";
import { CATEGORY_MAPPING, STATUS_MAPPING } from "@/lib/constants/mappings";
import { PROPOSAL_STATUS } from "@/lib/constants/tracker";
import { ProposalPhase } from "@/lib/proposal-periods";

interface ProposalListProps {
  initialProposals: Proposal[];
  userVotes: ProposalVote[];
  userType: string;
  currentUserId: string;
  currentPhase: ProposalPhase;
  activePeriod: ProposalPeriod | null;
  isHistorical?: boolean;
}

type ProposalVote = {
  proposal_id: string;
  rank: number;
};

export function ProposalList({
  initialProposals = [],
  userVotes = [],
  userType,
  currentUserId,
  currentPhase,
  activePeriod,
  isHistorical = false,
}: ProposalListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "mine" | "review" | "priority" | "funding" | "rejected"
  >("all");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const categories = ["Semua", ...Object.values(CATEGORY_MAPPING)];
  const isCitizen = userType === "citizen";
  const canVote = isCitizen && currentPhase === "voting" && !isHistorical;

  const filteredProposals = useMemo(() => {
    let list = Array.isArray(initialProposals) ? initialProposals : [];

    if (activeTab === "mine") {
      list = list.filter((proposal) => proposal.author_id === currentUserId);
    } else if (activeTab === "review") {
      list = list.filter(
        (proposal) => proposal.status === PROPOSAL_STATUS.PEMERIKSAAN_DATA,
      );
    } else if (activeTab === "priority") {
      list = list.filter(
        (proposal) => proposal.status === PROPOSAL_STATUS.PEMILIHAN_PRIORITAS,
      );
    } else if (activeTab === "funding") {
      const implementationStatuses = new Set<string>([
        PROPOSAL_STATUS.ALOKASI_DANA,
        PROPOSAL_STATUS.SEDANG_DIBANGUN,
        PROPOSAL_STATUS.PROYEK_SELESAI,
      ]);
      list = list.filter((proposal) =>
        implementationStatuses.has(proposal.status),
      );
    } else if (activeTab === "rejected") {
      list = list.filter((proposal) => proposal.status === "rejected");
    }

    return list.filter((proposal) => {
      const title = (proposal.title || "").toLowerCase();
      const description = (proposal.description || "").toLowerCase();
      const searchTerm = search.toLowerCase();
      const matchesSearch =
        title.includes(searchTerm) || description.includes(searchTerm);
      const displayCategory =
        CATEGORY_MAPPING[proposal.category] || proposal.category;
      const matchesCategory =
        activeCategory === "Semua" || displayCategory === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, activeTab, currentUserId, initialProposals, search]);

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
    return STATUS_MAPPING[proposal.status] || proposal.status;
  }

  function getStatusClass(proposal: Proposal) {
    if (proposal.status === "rejected") {
      return "border-rose-200 bg-rose-50 text-rose-600";
    }
    if (proposal.status === PROPOSAL_STATUS.PEMERIKSAAN_DATA) {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }
    if (proposal.status === PROPOSAL_STATUS.PEMILIHAN_PRIORITAS) {
      return "border-sky-200 bg-sky-50 text-sky-700";
    }
    if (proposal.status === PROPOSAL_STATUS.ALOKASI_DANA) {
      return "border-violet-200 bg-violet-50 text-violet-700";
    }
    if (proposal.status === PROPOSAL_STATUS.SEDANG_DIBANGUN) {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }
    if (proposal.status === PROPOSAL_STATUS.PROYEK_SELESAI) {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
    return "border-slate-200 bg-slate-50 text-slate-500";
  }

  function getVoteMessage(proposal: Proposal) {
    if (isHistorical) return "Sesi musyawarah ini telah dikunci (arsip)";
    if (proposal.status !== PROPOSAL_STATUS.PEMILIHAN_PRIORITAS) {
      return proposal.status === "rejected"
        ? "Ditolak oleh pemerintah daerah"
        : proposal.status === PROPOSAL_STATUS.PEMERIKSAAN_DATA
          ? "Menunggu verifikasi pemerintah daerah"
          : proposal.status === PROPOSAL_STATUS.ALOKASI_DANA
            ? "Dana sedang dialokasikan pemerintah"
            : proposal.status === PROPOSAL_STATUS.SEDANG_DIBANGUN
              ? "Proposal sedang masuk tahap pembangunan"
              : proposal.status === PROPOSAL_STATUS.PROYEK_SELESAI
                ? "Proyek telah selesai dilaksanakan"
                : "Status proposal sedang diperbarui";
    }
    if (currentPhase === "proposal") {
      return "Pemberian suara akan dibuka setelah tahap pengumpulan usulan ditutup";
    }
    if (currentPhase === "review") {
      return "Menunggu sesi musyawarah dimulai";
    }
    if (currentPhase === "results") {
      return "Pemenang pendanaan telah ditetapkan untuk sesi ini";
    }
    if (currentPhase === "upcoming") return "Sesi belum dimulai";
    return "Musyawarah hanya dapat diikuti oleh warga terverifikasi";
  }

  const phaseLabelMap: Record<string, string> = {
    proposal: "Tahap Pengajuan",
    review: "Tahap Review",
    voting: "Tahap Voting",
    results: "Tahap Hasil",
    upcoming: "Belum Dimulai",
    not_scheduled: "Belum Dijadwalkan",
  };

  const tabOptions: Array<{
    id: "all" | "mine" | "review" | "priority" | "funding" | "rejected";
    label: string;
    icon: typeof Layers;
    activeClass: string;
  }> = [
    {
      id: "all",
      label: "Semua",
      icon: Layers,
      activeClass: "border-[#1A1F2B] bg-[#1A1F2B] text-white",
    },
    {
      id: "review",
      label: "Pemeriksaan",
      icon: ShieldCheck,
      activeClass: "border-amber-600 bg-amber-600 text-white",
    },
    {
      id: "priority",
      label: "Prioritas",
      icon: Trophy,
      activeClass: "border-sky-600 bg-sky-600 text-white",
    },
    {
      id: "funding",
      label: "Implementasi",
      icon: Wallet,
      activeClass: "border-violet-600 bg-violet-600 text-white",
    },
    {
      id: "rejected",
      label: "Ditolak",
      icon: XCircle,
      activeClass: "border-rose-600 bg-rose-600 text-white",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="border-b border-slate-200 px-5 py-5 md:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                Daftar Proposal
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-[#1A1F2B]">
                Jelajahi usulan yang sedang bergerak di wilayah Anda
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
                  {filteredProposals.length} jumlah proposal
                </span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
                  {phaseLabelMap[currentPhase] || currentPhase}
                </span>
                {activePeriod ? (
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
                    Sesi terpilih aktif
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 xl:max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari judul atau masalah warga..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-12 w-full rounded-2xl border-slate-200 bg-white pl-11 text-sm shadow-sm transition-all focus-visible:border-[#11538C] focus-visible:ring-1 focus-visible:ring-[#11538C] focus-visible:ring-offset-0"
                />
              </div>

              {isCitizen ? (
                <button
                  onClick={() => setActiveTab("mine")}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all xl:self-end",
                    activeTab === "mine"
                      ? "border-[#11538C] bg-[#11538C] text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <User className="size-3.5" /> Proposal Saya
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5 md:px-6">
          <div className="flex flex-wrap gap-2">
            {tabOptions.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all",
                    activeTab === tab.id
                      ? tab.activeClass
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                  )}
                >
                  <Icon className="size-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-[11px] font-bold transition-all",
                  activeCategory === category
                    ? "border-[#11538C] bg-[#11538C] text-white shadow-sm"
                    : "border-slate-200 bg-[#F8FAFC] text-slate-500 hover:bg-slate-50",
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isCitizen && currentPhase === "voting" && !isHistorical ? (
        <div className="rounded-[1.75rem] border border-blue-100 bg-[linear-gradient(135deg,rgba(17,83,140,0.06),rgba(79,179,179,0.08))] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Voting Warga
              </p>
              <h3 className="mt-1 font-heading text-lg font-bold text-[#1A1F2B]">
                Pilihan Prioritas Anda
              </h3>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#11538C] shadow-sm">
              format 3-2-1
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((rank) => {
              const vote = getUserProposalForRank(rank);
              const proposal = vote
                ? initialProposals.find((item) => item.id === vote.proposal_id)
                : null;

              return (
                <div
                  key={rank}
                  className={cn(
                    "relative flex min-h-[5rem] flex-col justify-center rounded-[1.25rem] border p-4 transition-all",
                    proposal
                      ? "border-[#11538C]/20 bg-white shadow-sm"
                      : "border-dashed border-slate-300 bg-white/70",
                  )}
                >
                  <div
                    className={cn(
                      "absolute -right-3 -top-3 flex size-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold shadow-sm",
                      proposal
                        ? "bg-[#11538C] text-white"
                        : "bg-slate-200 text-slate-400",
                    )}
                  >
                    +{rank === 1 ? 3 : rank === 2 ? 2 : 1}
                  </div>

                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Pilihan #{rank}
                  </p>

                  {proposal ? (
                    <p className="line-clamp-2 text-xs font-bold leading-tight text-[#1A1F2B]">
                      {proposal.title}
                    </p>
                  ) : (
                    <p className="text-[11px] italic font-medium text-slate-400">
                      Pilih dari kartu di bawah
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {filteredProposals.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="font-medium text-slate-500">
            Tidak ada proposal yang cocok dengan filter atau pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProposals.map((proposal) => {
              const userVote = getUserVoteForProposal(proposal.id);
              const imagePaths = Array.isArray(proposal.image_paths)
                ? proposal.image_paths
                : [];
              const isProposalVoteable =
                canVote && proposal.status === PROPOSAL_STATUS.PEMILIHAN_PRIORITAS;

              return (
                <motion.div
                  layout
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-[#11538C]/30 hover:shadow-lg hover:shadow-[#11538C]/10"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    {imagePaths.length > 0 ? (
                      <div className="flex h-full w-full snap-x snap-mandatory overflow-x-auto">
                        {imagePaths.map((path, index) => (
                          <div
                            key={index}
                            className="relative h-full w-full shrink-0 snap-center"
                          >
                            <Image
                              src={getImageUrl(path)}
                              alt="Dokumentasi"
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <ImageIcon className="size-8 opacity-40" />
                      </div>
                    )}

                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />

                    <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/95 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#1A1F2B] shadow-sm backdrop-blur-sm">
                        {CATEGORY_MAPPING[proposal.category] || proposal.category}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border bg-white/95 px-3 py-1 text-[9px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm",
                          getStatusClass(proposal),
                        )}
                      >
                        {getStatusLabel(proposal)}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-[#1A1F2B]/80 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                      <Trophy className="size-3 text-amber-300" />
                      {proposal.total_points ?? 0} poin
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[#1A1F2B] transition-colors group-hover:text-[#11538C]">
                        {proposal.title || "Tanpa Judul"}
                      </h3>
                      <Link
                        href={`/proposals/${proposal.id}`}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-[#F8FAFC] p-2 text-slate-500 transition-colors hover:border-[#11538C]/20 hover:text-[#11538C]"
                        aria-label={`Lihat detail ${proposal.title || "proposal"}`}
                      >
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                      {proposal.description}
                    </p>

                    <div className="mt-4 grid gap-2 text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2">
                        <MapPin className="size-3.5 text-slate-400" />
                        <span className="truncate">{proposal.location}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-[#F8FAFC] px-3 py-2 text-emerald-700">
                        <Wallet className="size-3.5 text-emerald-600" />
                        Rp{" "}
                        {Number(proposal.estimated_cost || 0).toLocaleString(
                          "id-ID",
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-2xl bg-slate-100 text-[10px] font-bold text-slate-600">
                          {userType === "governance" ? (
                            (proposal.author_name || "W").charAt(0)
                          ) : (
                            <User className="size-3" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[8px] font-bold uppercase leading-none tracking-widest text-slate-400">
                            Pengusul
                          </p>
                          <p className="max-w-[120px] truncate text-[10px] font-bold text-[#1A1F2B]">
                            {userType === "governance"
                              ? proposal.author_name || "Anonim"
                              : proposal.author_id === currentUserId
                                ? "Saya"
                                : "Warga Terverifikasi"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-full bg-[#F8FAFC] px-3 py-1 text-[10px] font-bold text-slate-500">
                        {proposal.total_votes ?? 0} suara
                      </div>
                    </div>

                    <div className="mt-4">
                      {isProposalVoteable ? (
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Berikan Bobot Suara
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3].map((rank) => {
                              const isThisRank = userVote?.rank === rank;
                              const selectedForRank = getUserProposalForRank(rank);
                              const isRankTaken =
                                selectedForRank &&
                                selectedForRank.proposal_id !== proposal.id;
                              const rankPoints =
                                rank === 1 ? "+3" : rank === 2 ? "+2" : "+1";

                              return (
                                <button
                                  key={rank}
                                  disabled={isPending}
                                  onClick={() =>
                                    handleVote(proposal.id, rank as 1 | 2 | 3)
                                  }
                                  className={cn(
                                    "flex flex-col items-center justify-center rounded-2xl border py-2.5 transition-all",
                                    isThisRank
                                      ? "border-[#11538C] bg-[#11538C] text-white shadow-md"
                                      : isRankTaken
                                        ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                                        : "border-slate-200 bg-[#F8FAFC] text-slate-500 hover:border-[#11538C] hover:text-[#11538C]",
                                  )}
                                >
                                  <span className="text-xs font-black">
                                    #{rank}
                                  </span>
                                  <span
                                    className={cn(
                                      "mt-0.5 text-[9px] font-bold",
                                      isThisRank
                                        ? "text-white/80"
                                        : isRankTaken
                                          ? "text-slate-300"
                                          : "text-slate-400",
                                    )}
                                  >
                                    {rankPoints}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {getVoteMessage(proposal)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
