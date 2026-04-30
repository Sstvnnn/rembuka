"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { reviewProposalAction } from "@/app/actions/musrenbang";
import { PROPOSAL_STATUS } from "@/lib/constants/tracker";

interface GovernanceControlsProps {
  proposalId: string;
}

export function GovernanceControls({ proposalId }: GovernanceControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleReview(
    nextStatus: typeof PROPOSAL_STATUS.PEMILIHAN_PRIORITAS | "rejected",
  ) {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        await reviewProposalAction(proposalId, nextStatus);
        setSuccess(
          nextStatus === PROPOSAL_STATUS.PEMILIHAN_PRIORITAS
            ? "Usulan dipindahkan ke tahap Pemilihan Prioritas."
            : "Usulan ditolak.",
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal memproses usulan.",
        );
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#11538C]/20 bg-[#11538C]/5 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-[#11538C] text-white">
          <ShieldCheck className="size-4" />
        </div>
        <h3 className="font-heading text-lg font-bold text-[#1A1F2B] leading-none mt-1">
          Verifikasi Pemerintah
        </h3>
      </div>

      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        Tinjau kelayakan teknis dan anggaran usulan ini. Usulan yang disetujui
        akan diikutsertakan dalam musyawarah kolektif warga.
      </p>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 border border-rose-100 flex items-center gap-2"
          >
            <AlertCircle className="size-4" /> {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 border border-emerald-100 flex items-center gap-2"
          >
            <CheckCircle2 className="size-4" /> {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={() => handleReview("rejected")}
          disabled={isPending || !!success}
          className="h-12 flex-1 rounded-xl border-rose-200 bg-white font-bold text-rose-600 hover:bg-rose-50 transition-colors shadow-sm"
        >
          {isPending ? (
            <LoadingSpinner className="mr-2" />
          ) : (
            <XCircle className="mr-2 size-4" />
          )}
          Tolak
        </Button>
        <Button
          onClick={() => handleReview(PROPOSAL_STATUS.PEMILIHAN_PRIORITAS)}
          disabled={isPending || !!success}
          className="h-12 flex-1 rounded-xl bg-[#11538C] font-bold text-white hover:bg-[#0c3e6b] hover:shadow-lg shadow-[#11538C]/20 transition-all hover:scale-[1.02]"
        >
          {isPending ? (
            <LoadingSpinner className="mr-2" />
          ) : (
            <CheckCircle2 className="mr-2 size-4" />
          )}
          Setujui ke Voting
        </Button>
      </div>
    </motion.div>
  );
}
