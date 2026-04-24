import { ProposalPeriod } from "@/types/musrenbang";

export type ProposalPhase = "not_scheduled" | "upcoming" | "proposal" | "review" | "voting" | "results";

export function getProposalPhase(period: ProposalPeriod | null | undefined, now = new Date()): ProposalPhase {
  if (!period) {
    return "not_scheduled";
  }

  const proposalStart = new Date(period.proposal_start_at);
  const proposalEnd = new Date(period.proposal_end_at);
  const votingStart = new Date(period.voting_start_at);
  const votingEnd = new Date(period.voting_end_at);

  if (now < proposalStart) {
    return "upcoming";
  }

  if (now <= proposalEnd) {
    return "proposal";
  }

  if (now < votingStart) {
    return "review";
  }

  if (now <= votingEnd) {
    return "voting";
  }

  return "results";
}

export function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().split("T")[0] ?? "";
}

export function toDateTimeInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function formatPeriodDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  
  const datePart = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).replace(".", ":");

  return `${datePart} • ${timePart}`;
}

export function isPhaseActive(phase: ProposalPhase) {
  return phase === "proposal" || phase === "voting" || phase === "review";
}

export function getProposalPhaseLabel(phase: ProposalPhase) {
  switch (phase) {
    case "upcoming":
      return "Jadwal Mendatang";
    case "proposal":
      return "Pengajuan Dibuka";
    case "review":
      return "Tahap Tinjauan";
    case "voting":
      return "Pemungutan Suara";
    case "results":
      return "Hasil Tersedia";
    default:
      return "Belum Dijadwalkan";
  }
}

export function getProposalPhaseDescription(phase: ProposalPhase) {
  switch (phase) {
    case "upcoming":
      return "Jadwal sudah dibuat, tetapi masa pengajuan belum dimulai.";
    case "proposal":
      return "Warga dapat mengajukan satu aspirasi untuk wilayahnya.";
    case "review":
      return "Masa pengajuan selesai. Pemerintah wilayah meninjau proposal sebelum voting dimulai.";
    case "voting":
      return "Warga memilih tiga proposal prioritas terbaik di wilayahnya.";
    case "results":
      return "Sesi voting selesai. Hasil tiga besar dapat dilihat.";
    default:
      return "Belum ada jadwal aktif untuk wilayah ini.";
  }
}
