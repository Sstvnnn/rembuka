"use client";

import { useState, useTransition } from "react";
import {
  CalendarRange,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from "lucide-react";
import { scheduleProposalPeriodAction } from "@/app/actions/musrenbang";
import {
  formatPeriodDateTime,
  getProposalPhaseDescription,
  getProposalPhaseLabel,
  ProposalPhase,
  toDateTimeInputValue,
} from "@/lib/proposal-periods";
import { ProposalPeriod } from "@/types/musrenbang";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";

interface ProposalPeriodManagerProps {
  location: string;
  currentPeriod: ProposalPeriod | null;
  currentPhase: ProposalPhase;
}

export function ProposalPeriodManager({
  location,
  currentPeriod,
  currentPhase,
}: ProposalPeriodManagerProps) {
  const editablePeriodId =
    currentPeriod && currentPhase !== "results" ? currentPeriod.id : undefined;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    proposalStart: editablePeriodId
      ? toDateTimeInputValue(currentPeriod?.proposal_start_at)
      : "",
    proposalEnd: editablePeriodId
      ? toDateTimeInputValue(currentPeriod?.proposal_end_at)
      : "",
    votingStart: editablePeriodId
      ? toDateTimeInputValue(currentPeriod?.voting_start_at)
      : "",
    votingEnd: editablePeriodId
      ? toDateTimeInputValue(currentPeriod?.voting_end_at)
      : "",
  });

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    setError("");
    setSuccess("");

    if (
      !form.proposalStart ||
      !form.proposalEnd ||
      !form.votingStart ||
      !form.votingEnd
    ) {
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
        setSuccess(
          editablePeriodId
            ? "Jadwal berhasil diperbarui."
            : "Jadwal baru berhasil ditetapkan.",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan jadwal.");
      }
    });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-[#11538C] shadow-sm">
            <CalendarRange className="size-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold tracking-tight text-[#1A1F2B]">
              Manajemen Jadwal Musyawarah
            </h3>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Otoritas Pemerintah Wilayah
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Wilayah Yurisdiksi
              </p>
              <p className="mt-1 text-lg font-bold text-[#1A1F2B]">
                {location}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-[#11538C]">
              <Clock3 className="size-3" />
              {getProposalPhaseLabel(currentPhase)}
            </div>
          </div>

          <p className="mb-4 text-sm text-slate-600">
            {getProposalPhaseDescription(currentPhase)}
          </p>

          {currentPeriod ? (
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-medium text-slate-700 sm:grid-cols-2">
              <p>
                <span className="text-slate-400">Pengumpulan:</span>{" "}
                {formatPeriodDateTime(currentPeriod.proposal_start_at)} -{" "}
                {formatPeriodDateTime(currentPeriod.proposal_end_at)}
              </p>
              <p>
                <span className="text-slate-400">Pemungutan:</span>{" "}
                {formatPeriodDateTime(currentPeriod.voting_start_at)} -{" "}
                {formatPeriodDateTime(currentPeriod.voting_end_at)}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-5">
            <h4 className="mb-2 border-b border-slate-100 pb-2 text-sm font-bold text-[#1A1F2B]">
              Tahap 1: Pengumpulan Usulan
            </h4>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Waktu Mulai
              </Label>
              <Input
                type="datetime-local"
                value={form.proposalStart}
                onChange={(e) => handleChange("proposalStart", e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-white focus-visible:ring-[#11538C]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Batas Akhir
              </Label>
              <Input
                type="datetime-local"
                value={form.proposalEnd}
                onChange={(e) => handleChange("proposalEnd", e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-white focus-visible:ring-[#11538C]"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-[#F8FAFC] p-5">
            <h4 className="mb-2 border-b border-slate-100 pb-2 text-sm font-bold text-[#1A1F2B]">
              Tahap 2: Pemungutan Suara (Voting)
            </h4>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Waktu Mulai
              </Label>
              <Input
                type="datetime-local"
                value={form.votingStart}
                onChange={(e) => handleChange("votingStart", e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-white focus-visible:ring-[#11538C]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Batas Akhir
              </Label>
              <Input
                type="datetime-local"
                value={form.votingEnd}
                onChange={(e) => handleChange("votingEnd", e.target.value)}
                className="h-11 rounded-2xl border-slate-200 bg-white focus-visible:ring-[#11538C]"
              />
            </div>
          </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          <AlertCircle className="size-4" /> {error}
        </div>
      ) : null}

      {success ? (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="size-4" /> {success}
        </div>
      ) : null}

      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-2 sm:flex-row">
        <p className="max-w-sm text-xs leading-relaxed text-slate-500">
          Satu jadwal mencakup seluruh wilayah. Pastikan rentang waktu tahap
          pengajuan dan voting tidak saling tumpang tindih.
        </p>
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="h-12 w-full rounded-2xl bg-[#11538C] px-8 font-bold text-white shadow-lg shadow-[#11538C]/20 transition-all hover:bg-[#0c3e6b] sm:w-auto"
        >
          {isPending ? (
            <LoadingSpinner className="mr-2" />
          ) : editablePeriodId ? (
            "Simpan Perubahan Jadwal"
          ) : (
            "Tetapkan Jadwal Baru"
          )}
        </Button>
      </div>
    </div>
  );
}
