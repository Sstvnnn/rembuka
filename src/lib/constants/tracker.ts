export const LEGISLATION_STATUS = {
  DRAFT_UPLOADED: "DRAFT_UPLOADED",
  PUBLIC_OPINION: "PUBLIC_OPINION",
  VERIFICATION: "VERIFICATION",
  REVISED: "REVISED",
  NO_REVISION: "NO_REVISION",
} as const;

export const PROPOSAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type LegislationStatus = keyof typeof LEGISLATION_STATUS;
export type ProposalStatus = keyof typeof PROPOSAL_STATUS;

export const STATUS_LABELS: Record<string, string> = {
  [LEGISLATION_STATUS.DRAFT_UPLOADED]: "Draf Masuk",
  [LEGISLATION_STATUS.PUBLIC_OPINION]: "Masa Opini Publik",
  [LEGISLATION_STATUS.VERIFICATION]: "Proses Verifikasi",
  [LEGISLATION_STATUS.REVISED]: "Direvisi",
  [LEGISLATION_STATUS.NO_REVISION]: "Tidak Ada Revisi",

  [PROPOSAL_STATUS.PENDING]: "Menunggu Tinjauan",
  [PROPOSAL_STATUS.APPROVED]: "Disetujui",
  [PROPOSAL_STATUS.REJECTED]: "Ditolak",
};
