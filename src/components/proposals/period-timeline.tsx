"use client";

import { Calendar, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { ProposalPeriod } from "@/types/musrenbang";
import { formatPeriodDateTime, getProposalPhase } from "@/lib/proposal-periods";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PeriodTimelineProps {
  period: ProposalPeriod;
  className?: string;
}

export function PeriodTimeline({ period, className }: PeriodTimelineProps) {
  const currentPhase = getProposalPhase(period);

  const phases = [
    {
      id: "proposal",
      label: "Pengumpulan Usulan",
      start: period.proposal_start_at,
      end: period.proposal_end_at,
      isActive: currentPhase === "proposal",
      isPast: ["review", "voting", "results"].includes(currentPhase),
    },
    {
      id: "voting",
      label: "Pemungutan Suara",
      start: period.voting_start_at,
      end: period.voting_end_at,
      isActive: currentPhase === "voting",
      isPast: currentPhase === "results",
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
        <Calendar className="size-4 text-[#11538C]" />
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Linimasa Pelaksanaan
        </h4>
      </div>

      <div className="grid gap-4">
        {phases.map((phase) => (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "relative overflow-hidden rounded-[1.25rem] border p-4 transition-all duration-300",
              phase.isActive
                ? "border-[#11538C] bg-blue-50/50 shadow-sm"
                : phase.isPast
                  ? "border-slate-200 bg-slate-50"
                  : "border-slate-200 bg-white",
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border",
                    phase.isActive
                      ? "bg-[#11538C] border-[#11538C] text-white"
                      : phase.isPast
                        ? "bg-emerald-100 border-emerald-200 text-emerald-600"
                        : "bg-slate-100 border-slate-200 text-slate-300",
                  )}
                >
                  {phase.isPast ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Circle
                      className={cn("size-3", phase.isActive && "fill-white")}
                    />
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm font-bold",
                      phase.isActive ? "text-[#11538C]" : "text-slate-600",
                    )}
                  >
                    {phase.label}
                  </p>
                </div>
              </div>

              {phase.isActive && (
                <span className="rounded bg-[#11538C] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Berlangsung
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="flex-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Mulai
                </p>
                {(() => {
                  const [d, t] = formatPeriodDateTime(phase.start).split(" • ");
                  return (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1A1F2B] leading-none">
                        {d}
                      </span>
                      <span className="text-xs font-medium text-slate-500 mt-1">
                        {t}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <ArrowRight className="size-4 shrink-0 self-center justify-self-center text-slate-300" />
              <div className="flex-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Selesai
                </p>
                {(() => {
                  const [d, t] = formatPeriodDateTime(phase.end).split(" • ");
                  return (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1A1F2B] leading-none">
                        {d}
                      </span>
                      <span className="text-xs font-medium text-slate-500 mt-1">
                        {t}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
