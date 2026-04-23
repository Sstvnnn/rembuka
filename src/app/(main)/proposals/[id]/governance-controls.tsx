"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { reviewProposalAction } from "@/app/actions/musrenbang";

interface GovernanceControlsProps {
  proposalId: string;
}

export function GovernanceControls({ proposalId }: GovernanceControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleReview(nextStatus: "approved" | "rejected") {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        await reviewProposalAction(proposalId, nextStatus);
        setSuccess(nextStatus === "approved" ? "Proposal disetujui untuk sesi voting wilayah." : "Proposal ditolak.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memproses proposal.");
      }
    });
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <Card className="overflow-hidden rounded-[2.5rem] border-[#4FB3B3]/30 bg-[#4FB3B3]/5 shadow-xl">
        <CardHeader className="border-b border-[#4FB3B3]/20 bg-[#4FB3B3]/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#4FB3B3]" />
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-800">Tindakan Pemerintah Wilayah</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <p className="text-xs font-medium leading-relaxed text-slate-600">
            Tinjau kelayakan aspirasi warga ini. Proposal yang disetujui akan masuk ke daftar yang dapat dipilih saat sesi voting wilayah dibuka.
          </p>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 text-[10px] font-bold text-rose-500">
                <AlertCircle className="size-3" /> {error}
              </motion.div>
            ) : null}
            {success ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                <CheckCircle2 className="size-3" /> {success}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => handleReview("rejected")}
              disabled={isPending || !!success}
              className="h-11 rounded-xl border-rose-200 bg-rose-50 font-bold text-rose-600 hover:bg-rose-100"
            >
              {isPending ? <LoadingSpinner className="mr-2" /> : <XCircle className="mr-2 size-4" />}
              Tolak Proposal
            </Button>
            <Button
              onClick={() => handleReview("approved")}
              disabled={isPending || !!success}
              className="h-11 rounded-xl bg-[#3F5C73] font-bold text-white hover:bg-[#314b60]"
            >
              {isPending ? <LoadingSpinner className="mr-2" /> : <CheckCircle2 className="mr-2 size-4" />}
              Setujui untuk Voting
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
