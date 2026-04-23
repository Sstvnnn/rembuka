"use client";

import { useState, useTransition } from "react";
import { CalendarRange, CheckCircle2, AlertCircle, Clock3 } from "lucide-react";
import { scheduleProposalPeriodAction } from "@/app/actions/musrenbang";
import { formatPeriodDateTime, getProposalPhaseDescription, getProposalPhaseLabel, ProposalPhase, toDateTimeInputValue } from "@/lib/proposal-periods";
import { ProposalPeriod } from "@/types/musrenbang";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";

interface ProposalPeriodManagerProps {
  location: string;
  currentPeriod: ProposalPeriod | null;
  currentPhase: ProposalPhase;
}

export function ProposalPeriodManager({ location, currentPeriod, currentPhase }: ProposalPeriodManagerProps) {
  const editablePeriodId = currentPeriod && currentPhase !== "results" ? currentPeriod.id : undefined;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    proposalStart: editablePeriodId ? toDateTimeInputValue(currentPeriod?.proposal_start_at) : "",
    proposalEnd: editablePeriodId ? toDateTimeInputValue(currentPeriod?.proposal_end_at) : "",
    votingStart: editablePeriodId ? toDateTimeInputValue(currentPeriod?.voting_start_at) : "",
    votingEnd: editablePeriodId ? toDateTimeInputValue(currentPeriod?.voting_end_at) : "",
  });

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    setError("");
    setSuccess("");

    if (!form.proposalStart || !form.proposalEnd || !form.votingStart || !form.votingEnd) {
      setError("Semua tanggal wajib diisi.");
      return;
    }

    startTransition(async () => {
      try {
        await scheduleProposalPeriodAction({
          periodId: editablePeriodId,
          proposalStart: form.proposalStart,
          proposalEnd: form.proposalEnd,
          votingStart: form.votingStart,
          votingEnd: form.votingEnd,
        });
        setSuccess(editablePeriodId ? "Jadwal berhasil diperbarui." : "Jadwal baru berhasil dibuat.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan jadwal.");
      }
    });
  }

  return (
    <Card className="rounded-[2.5rem] border-white/70 bg-white/70 shadow-xl backdrop-blur-xl">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#3F5C73] text-white shadow-lg shadow-[#3F5C73]/20">
            <CalendarRange className="size-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4FB3B3]">Ruang Aspirasi Daerah</p>
            <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Jadwal Wilayah</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Wilayah Tugas</p>
          <p className="mt-2 text-lg font-bold text-slate-800">{location}</p>
          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Clock3 className="size-4 text-[#4FB3B3]" />
            Fase saat ini: {getProposalPhaseLabel(currentPhase)}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{getProposalPhaseDescription(currentPhase)}</p>
          {currentPeriod ? (
            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>Pengajuan: {formatPeriodDateTime(currentPeriod.proposal_start_at)} - {formatPeriodDateTime(currentPeriod.proposal_end_at)}</p>
              <p>Voting: {formatPeriodDateTime(currentPeriod.voting_start_at)} - {formatPeriodDateTime(currentPeriod.voting_end_at)}</p>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Mulai Pengajuan</Label>
            <Input type="datetime-local" value={form.proposalStart} onChange={(event) => handleChange("proposalStart", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Akhir Pengajuan</Label>
            <Input type="datetime-local" value={form.proposalEnd} onChange={(event) => handleChange("proposalEnd", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Mulai Voting</Label>
            <Input type="datetime-local" value={form.votingStart} onChange={(event) => handleChange("votingStart", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Akhir Voting</Label>
            <Input type="datetime-local" value={form.votingEnd} onChange={(event) => handleChange("votingEnd", event.target.value)} />
          </div>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 text-sm leading-relaxed text-amber-800">
          Satu jadwal mencakup seluruh wilayah. Anda sekarang dapat mengatur tanggal dan jam secara presisi, misalnya 26 April 00:00 sampai 27 April 00:00.
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-600">
            <AlertCircle className="size-4" /> {error}
          </div>
        ) : null}

        {success ? (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-600">
            <CheckCircle2 className="size-4" /> {success}
          </div>
        ) : null}

        <Button onClick={handleSave} disabled={isPending} className="h-12 rounded-2xl bg-[#3F5C73] font-bold text-white hover:bg-[#314b60]">
          {isPending ? <LoadingSpinner className="mr-2" /> : editablePeriodId ? "Perbarui Jadwal" : "Buat Jadwal Baru"}
        </Button>
      </CardContent>
    </Card>
  );
}
