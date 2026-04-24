"use client";

import { Calendar, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { ProposalPeriod } from "@/types/musrenbang";
import { formatPeriodDateTime, getProposalPhase } from "@/lib/proposal-periods";
import { cn } from "@/lib/utils";

interface PeriodTimelineProps {
  period: ProposalPeriod;
  className?: string;
}

export function PeriodTimeline({ period, className }: PeriodTimelineProps) {
  const currentPhase = getProposalPhase(period);

  const phases = [
    {
      id: "proposal",
      label: "Masa Pengajuan",
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
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="size-4 text-slate-400" />
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Jadwal Pelaksanaan</h4>
      </div>
      
      <div className="grid gap-3">
        {phases.map((phase) => (
          <div 
            key={phase.id}
            className={cn(
              "relative overflow-hidden rounded-2xl border p-4 transition-all",
              phase.isActive 
                ? "border-[#4FB3B3] bg-[#4FB3B3]/5 shadow-sm" 
                : phase.isPast 
                  ? "border-slate-100 bg-slate-50/50" 
                  : "border-slate-100 bg-white"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex size-8 items-center justify-center rounded-full",
                  phase.isActive 
                    ? "bg-[#4FB3B3] text-white" 
                    : phase.isPast 
                      ? "bg-emerald-100 text-emerald-600" 
                      : "bg-slate-100 text-slate-400"
                )}>
                  {phase.isPast ? <CheckCircle2 className="size-4" /> : <Circle className={cn("size-4", phase.isActive && "fill-white")} />}
                </div>
                <div>
                  <p className={cn(
                    "text-xs font-bold",
                    phase.isActive ? "text-[#4FB3B3]" : "text-slate-600"
                  )}>
                    {phase.label}
                  </p>
                </div>
              </div>
              
              {phase.isActive && (
                <span className="rounded-full bg-[#4FB3B3] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                  Aktif
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 rounded-xl bg-white/50 p-2.5 border border-slate-100/50 shadow-sm">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Mulai</p>
                {(() => {
                  const [d, t] = formatPeriodDateTime(phase.start).split(" • ");
                  return (
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 leading-none">{d}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1">{t}</span>
                    </div>
                  );
                })()}
              </div>
              <ArrowRight className="size-3 text-slate-300 shrink-0" />
              <div className="flex-1 rounded-xl bg-white/50 p-2.5 border border-slate-100/50 shadow-sm">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Selesai</p>
                {(() => {
                  const [d, t] = formatPeriodDateTime(phase.end).split(" • ");
                  return (
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 leading-none">{d}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1">{t}</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
