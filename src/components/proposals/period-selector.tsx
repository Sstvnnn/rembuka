"use client";

import { Check, ChevronDown, History, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProposalPeriod } from "@/types/musrenbang";
import { cn } from "@/lib/utils";
import { formatPeriodDateTime, getProposalPhase, isPhaseActive } from "@/lib/proposal-periods";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface PeriodSelectorProps {
  periods: ProposalPeriod[];
  currentPeriodId?: string;
  activePeriodId?: string; // This is the period returned by getRelevantProposalPeriod
}

export function PeriodSelector({ periods, currentPeriodId, activePeriodId }: PeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedPeriod = periods.find(p => p.id === currentPeriodId) || periods[0];
  const selectedPhase = selectedPeriod ? getProposalPhase(selectedPeriod) : "not_scheduled";
  const isSelectedActive = isPhaseActive(selectedPhase);

  const isViewingHistorical = currentPeriodId !== activePeriodId;

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodId", id);
    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("periodId");
    router.push(`?${params.toString()}`);
  };

  const formatSessionLabel = (period: ProposalPeriod) => {
    const start = new Date(period.proposal_start_at);
    const end = new Date(period.voting_end_at);
    
    const startStr = start.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const endStr = end.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    
    return `${startStr} - ${endStr}`;
  };

  if (periods.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      {isViewingHistorical && activePeriodId && (
        <Button 
          onClick={handleReset}
          variant="secondary"
          className="h-12 rounded-2xl bg-emerald-50 px-6 font-bold text-emerald-600 hover:bg-emerald-100 shadow-sm transition-all"
        >
          <div className="mr-2 size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Sesi Aktif
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="h-12 gap-3 rounded-2xl border-slate-200 bg-white px-6 font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <History className="size-4 text-[#4FB3B3]" />
            <span className="max-w-[200px] truncate sm:max-w-none">
              {isSelectedActive ? "Sesi Aktif: " : selectedPhase === "results" ? "Hasil Sesi: " : "Sesi: "}
              {selectedPeriod ? formatSessionLabel(selectedPeriod) : "Pilih Sesi"}
            </span>
            <ChevronDown className="size-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[320px] rounded-2xl p-2 shadow-2xl">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Pilih Jadwal Wilayah</p>
          {periods.map((period) => {
            const isSelected = period.id === currentPeriodId;
            const phase = getProposalPhase(period);
            const active = isPhaseActive(phase);
            
            return (
              <DropdownMenuItem
                key={period.id}
                onClick={() => handleSelect(period.id)}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition-all",
                  isSelected ? "bg-[#4FB3B3]/10 text-[#4FB3B3]" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{formatSessionLabel(period)}</p>
                  </div>
                  {active ? (
                    <div className="flex items-center gap-1.5">
                      <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase text-emerald-600 tracking-tight">Sesi Berjalan</span>
                    </div>
                  ) : phase === "results" ? (
                    <div className="flex items-center gap-1.5">
                      <Check className="size-3 text-slate-400" />
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-tight">Sesi Selesai (Arsip)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-amber-500" />
                      <span className="text-[10px] font-bold uppercase text-amber-600 tracking-tight">Segera Dimulai</span>
                    </div>
                  )}
                </div>
                {isSelected && <Check className="size-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
