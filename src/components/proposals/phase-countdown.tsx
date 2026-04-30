"use client";

import { useEffect, useMemo, useState } from "react";
import { Timer, Calendar, Clock } from "lucide-react";
import { ProposalPeriod } from "@/types/musrenbang";
import { getProposalPhase } from "@/lib/proposal-periods";
import { motion } from "framer-motion";

interface PhaseCountdownProps {
  period: ProposalPeriod;
}

export function PhaseCountdown({ period }: PhaseCountdownProps) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { phase, timeLeft } = useMemo(() => {
    const now = new Date(currentTime);
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

    if (!targetDate) {
      return { phase: currentPhase, timeLeft: null };
    }

    const difference = targetDate.getTime() - currentTime;

    if (difference <= 0) {
      return {
        phase: currentPhase,
        timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 },
      };
    }

    return {
      phase: currentPhase,
      timeLeft: {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
      },
    };
  }, [currentTime, period]);

  if (!timeLeft || phase === "results" || phase === "not_scheduled") {
    return null;
  }

  const getPhaseInfo = () => {
    switch (phase) {
      case "upcoming":
        return {
          label: "Mulai Pengajuan",
          color: "text-[#11538C]",
          icon: <Calendar className="size-5" />,
        };
      case "proposal":
        return {
          label: "Sisa Waktu Pengajuan",
          color: "text-emerald-700",
          icon: <Timer className="size-5" />,
        };
      case "review":
        return {
          label: "Mulai Pemungutan Suara",
          color: "text-amber-600",
          icon: <Calendar className="size-5" />,
        };
      case "voting":
        return {
          label: "Sisa Waktu Voting",
          color: "text-rose-600",
          icon: <Clock className="size-5" />,
        };
      default:
        return null;
    }
  };

  const info = getPhaseInfo();
  if (!info) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 bg-white p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex size-12 items-center justify-center rounded-2xl border border-slate-200 bg-[#F8FAFC] ${info.color}`}
          >
            {info.icon}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Tenggat Waktu
            </p>
            <h3 className="font-heading text-lg font-bold text-[#1A1F2B]">
              {info.label}
            </h3>
          </div>
        </div>

        <div className="rounded-full bg-[#F8FAFC] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          countdown aktif
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <TimeUnit value={timeLeft.days} label="H" />
        <TimeSeparator />
        <TimeUnit value={timeLeft.hours} label="J" />
        <TimeSeparator />
        <TimeUnit value={timeLeft.minutes} label="M" />
        <TimeSeparator />
        <TimeUnit value={timeLeft.seconds} label="D" />
      </div>
    </motion.div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div className="flex w-full justify-center rounded-2xl border border-slate-200 bg-[#F8FAFC] px-3 py-3 shadow-inner">
        <span className="font-heading text-lg font-bold tabular-nums text-[#11538C] sm:text-xl">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
    </div>
  );
}

function TimeSeparator() {
  return <div className="mb-5 text-base font-bold text-slate-300">:</div>;
}
