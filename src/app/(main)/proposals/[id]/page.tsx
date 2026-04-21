import { getProposalById } from "@/lib/proposals";
import { getCurrentProfile } from "@/lib/profile";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  MapPin, 
  Tag, 
  Wallet, 
  Trophy, 
  Clock, 
  User, 
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { GovernanceControls } from "./governance-controls";
import { CATEGORY_MAPPING, STATUS_MAPPING } from "@/lib/constants/mappings";

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposal = await getProposalById(id);
  const { user, userType, profile, role } = await getCurrentProfile();

  if (!proposal) {
    notFound();
  }

  // Location restriction for non-admin governance
  if (userType === "governance" && role !== "admin") {
    if (proposal.location !== profile?.location) {
      notFound();
    }
  }

  const isGovernance = userType === "governance";
  const isOwner = proposal.author_id === user.id;

  // Status Logic
  const isPending = proposal.status === "pending";
  const isVoting = proposal.status === "voting";
  const isExpired = proposal.expiry_date ? new Date(proposal.expiry_date) < new Date() : false;
  const canVote = isVoting && !isExpired;

  const getImageUrl = (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    return `${baseUrl}/storage/v1/object/public/proposal-attachments/${path}`;
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 pt-32 pb-12 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <Button asChild variant="ghost" className="rounded-xl text-slate-500 hover:text-slate-800 -ml-4">
          <Link href="/proposals" className="flex items-center gap-2">
            <ArrowLeft className="size-4" /> Kembali ke Proposal
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 border border-blue-100">
                  {CATEGORY_MAPPING[proposal.category] || proposal.category}
                </span>
                <span className={ `rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                  canVote ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                  isExpired ? 'bg-rose-50 text-rose-600 border-rose-100' :
                  isPending ? 'bg-slate-100 text-slate-500 border-slate-200' :
                  'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {isExpired ? STATUS_MAPPING["expired"] : (STATUS_MAPPING[proposal.status] || proposal.status)}
                </span>
              </div>
              <h1 className="font-heading text-4xl font-black text-slate-800 tracking-tight leading-tight">
                {proposal.title}
              </h1>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-2xl">
                {proposal.image_paths && proposal.image_paths.length > 0 ? (
                  <Image 
                    src={getImageUrl(proposal.image_paths[0])} 
                    alt="Primary documentation" 
                    fill 
                    className="object-cover" 
                    unoptimized 
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-50 text-slate-300">
                    <ImageIcon className="size-16 opacity-10" />
                  </div>
                )}
              </div>
              
              {proposal.image_paths && proposal.image_paths.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {proposal.image_paths.slice(1).map((path, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-2xl border border-white bg-white shadow-md">
                      <Image 
                        src={getImageUrl(path)} 
                        alt={`documentation ${i+2}`} 
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
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800">Ringkasan Proyek</h2>
              <p className="text-base leading-relaxed text-slate-600 whitespace-pre-wrap">
                {proposal.description}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Governance Action Card */}
            {isGovernance && isPending && (
              <GovernanceControls proposalId={proposal.id} />
            )}

            <Card className="rounded-[2.5rem] border-white/60 bg-white/40 shadow-xl backdrop-blur-xl">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peringkat Saat Ini</p>
                    <div className="flex items-center gap-2">
                      <Trophy className="size-5 text-amber-500" />
                      <span className="text-2xl font-black text-slate-800">{proposal.total_points ?? 0} <span className="text-sm font-bold text-slate-400">poin</span></span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Suara</p>
                    <p className="text-lg font-bold text-slate-800">{proposal.total_votes ?? 0}</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  {proposal.expiry_date && (
                    <div className="flex items-center gap-4">
                      <div className={cn("size-10 rounded-xl flex items-center justify-center", isExpired ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500")}>
                        <Clock className="size-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Periode Voting</p>
                        <p className={cn("text-sm font-bold", isExpired ? "text-rose-600" : "text-amber-600")}>
                          {isExpired ? "Berakhir pada " : "Hingga "}
                          {new Date(proposal.expiry_date).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Lokasi</p>
                      <p className="text-sm font-bold text-slate-800">{proposal.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Wallet className="size-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Estimasi Anggaran</p>
                      <p className="text-sm font-bold text-[#4FB3B3]">Rp {Number(proposal.estimated_cost).toLocaleString("id-ID")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <div className="size-10 rounded-full bg-[#3F5C73] flex items-center justify-center text-white">
                      {isGovernance ? (proposal.author_name || "U").charAt(0) : <User className="size-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {isGovernance ? "Diajukan oleh (Tampilan Admin)" : "Identitas Pelapor"}
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {isGovernance ? (proposal.author_name || 'Anonim') : (isOwner ? "Saya (Privat)" : "Warga Terverifikasi")}
                      </p>
                    </div>
                  </div>
                </div>

                {canVote ? (
                  <Button asChild className="w-full h-14 rounded-2xl bg-[#4FB3B3] font-bold text-slate-900 hover:bg-[#3da3a3] shadow-lg shadow-[#4FB3B3]/20">
                    <Link href="/proposals">Berikan Suara di Katalog</Link>
                  </Button>
                ) : (
                  <div className="flex items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                    {isPending ? "Verifikasi Sedang Berlangsung" : "Voting telah ditutup"}
                  </div>
                )}
              </CardContent>
            </Card>

            {isOwner && (
               <div className="rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dasbor Kepemilikan</p>
                 <h4 className="mt-1 font-bold">Ini adalah proposal Anda</h4>
                 <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                   Sebagai penulis, Anda dapat memantau statusnya. Hanya pejabat pemerintah yang dapat menyetujuinya untuk voting publik.
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
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
