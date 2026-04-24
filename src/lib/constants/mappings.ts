export const CATEGORY_MAPPING: Record<string, string> = {
  Infrastructure: "Infrastruktur",
  Education: "Pendidikan",
  Health: "Kesehatan",
  Environment: "Lingkungan",
  Social: "Sosial",
  Safety: "Keamanan",
};

export const REVERSE_CATEGORY_MAPPING: Record<string, string> = Object.entries(CATEGORY_MAPPING).reduce(
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

export const STATUS_MAPPING: Record<string, string> = {
  pending: "Menunggu Tinjauan",
  approved: "Disetujui",
  rejected: "Ditolak",
  voting: "Pemungutan Suara",
  results: "Hasil Tersedia",
};

export const ROLE_MAPPING: Record<string, string> = {
  admin: "Administrator",
  governance: "Pemerintah",
  citizen: "Warga",
};

export const VERIFICATION_STATUS_MAPPING: Record<string, string> = {
  verified: "Terverifikasi",
  pending_review: "Menunggu Tinjauan",
  unverified: "Menunggu Tinjauan",
  rejected: "Ditolak",
  missing_card: "Lengkapi Data",
};
