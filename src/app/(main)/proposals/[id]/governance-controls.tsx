"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { verifyProposalAction } from "@/app/actions/musrenbang";

interface GovernanceControlsProps {
  proposalId: string;
}

export function GovernanceControls({ proposalId }: GovernanceControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [expiryDate, setExpiryDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleVerify() {
    if (!expiryDate) {
      setError("Please set an expiry date for the voting period.");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await verifyProposalAction(proposalId, new Date(expiryDate).toISOString());
        setSuccess("Proposal verified! Voting is now open.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to verify proposal.");
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card className="rounded-[2.5rem] border-[#4FB3B3]/30 bg-[#4FB3B3]/5 shadow-xl overflow-hidden">
        <CardHeader className="bg-[#4FB3B3]/10 border-b border-[#4FB3B3]/20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#4FB3B3]" />
            <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Governance Action
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            Review this citizen report. Approving it will move it to the <strong>Voting Stage</strong> where the entire community can participate.
          </p>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Voting Deadline</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-11 rounded-xl border-slate-200 pl-10 focus:ring-[#4FB3B3]/20"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 text-[10px] font-bold text-rose-500">
                <AlertCircle className="size-3" /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                <CheckCircle2 className="size-3" /> {success}
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            onClick={handleVerify}
            disabled={isPending || !!success}
            className="w-full h-11 rounded-xl bg-[#3F5C73] font-bold text-white shadow-lg hover:bg-[#314b60] transition-transform active:scale-95"
          >
            {isPending ? <LoadingSpinner className="mr-2" /> : "Verify & Open Voting"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
