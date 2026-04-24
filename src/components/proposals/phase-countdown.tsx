"use client";

import { useEffect, useState, useCallback } from "react";
import { Timer, Calendar, Clock } from "lucide-react";
import { ProposalPeriod } from "@/types/musrenbang";
import { getProposalPhase, ProposalPhase } from "@/lib/proposal-periods";

interface PhaseCountdownProps {
  period: ProposalPeriod;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function PhaseCountdown({ period }: PhaseCountdownProps) {
  const [phase, setPhase] = useState<ProposalPhase>(() => getProposalPhase(period));
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => {
    const now = new Date();
    const currentPhase = getProposalPhase(period, now);
    let targetDate: Date | null = null;

    switch (currentPhase) {
      case "upcoming":
        targetDate = new Date(period.proposal_start_at);
        break;
      case "proposal":
        targetDate = new Date(period.proposal_end_at);
        break;
      case "review":
        targetDate = new Date(period.voting_start_at);
        break;
      case "voting":
        targetDate = new Date(period.voting_end_at);
        break;
      default:
        targetDate = null;
    }

    if (!targetDate) return null;
    const difference = targetDate.getTime() - now.getTime();
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    };
  });

  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const currentPhase = getProposalPhase(period, now);
    setPhase(currentPhase);

    let targetDate: Date | null = null;
    // ... rest of logic remains same but I'll update it to be cleaner

    switch (currentPhase) {
      case "upcoming":
        targetDate = new Date(period.proposal_start_at);
        break;
      case "proposal":
        targetDate = new Date(period.proposal_end_at);
        break;
      case "review":
        targetDate = new Date(period.voting_start_at);
        break;
      case "voting":
        targetDate = new Date(period.voting_end_at);
        break;
      default:
        targetDate = null;
    }

    if (!targetDate) {
      setTimeLeft(null);
      return;
    }

    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      // Trigger a reload when a phase actually hits zero to refresh page state
      if (typeof window !== "undefined") {
        window.location.reload();
      }
      return;
    }

    setTimeLeft({
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    });
  }, [period]);

  useEffect(() => {
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (!timeLeft || phase === "results" || phase === "not_scheduled") {
    return null;
  }

  const getPhaseInfo = () => {
    switch (phase) {
      case "upcoming":
        return {
          label: "Masa Pengajuan Dimulai",
          color: "bg-blue-50 text-blue-600 border-blue-100",
          icon: <Calendar className="size-5" />,
        };
      case "proposal":
        return {
          label: "Masa Pengajuan Berakhir",
          color: "bg-emerald-50 text-emerald-600 border-emerald-100",
          icon: <Timer className="size-5" />,
        };
      case "review":
        return {
          label: "Masa Voting Dimulai",
          color: "bg-amber-50 text-amber-600 border-amber-100",
          icon: <Calendar className="size-5" />,
        };
      case "voting":
        return {
          label: "Masa Voting Berakhir",
          color: "bg-rose-50 text-rose-600 border-rose-100",
          icon: <Clock className="size-5" />,
        };
      default:
        return null;
    }
  };

  const info = getPhaseInfo();
  if (!info) return null;

  return (
    <div className={`flex flex-col items-center justify-between gap-4 rounded-[2rem] border p-6 shadow-sm sm:flex-row ${info.color}`}>
      <div className="flex items-center gap-4">
        <div className={`flex size-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm`}>
          {info.icon}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Status Wilayah</p>
          <h3 className="text-lg font-black tracking-tight">{info.label}</h3>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TimeUnit value={timeLeft.days} label="Hari" />
        <TimeSeparator />
        <TimeUnit value={timeLeft.hours} label="Jam" />
        <TimeSeparator />
        <TimeUnit value={timeLeft.minutes} label="Menit" />
        <TimeSeparator />
        <TimeUnit value={timeLeft.seconds} label="Detik" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[60px]">
      <div className="bg-white/90 px-3 py-2 rounded-xl shadow-sm min-w-[50px] flex justify-center">
        <span className="text-xl font-black tabular-nums">{value.toString().padStart(2, "0")}</span>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider mt-1.5 opacity-60">{label}</span>
    </div>
  );
}

function TimeSeparator() {
  return <div className="text-xl font-black mb-5 opacity-30">:</div>;
}
