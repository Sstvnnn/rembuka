// src/app/actions/transparency.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function getArchivedDocuments(userLocation?: string | null) {
  const supabase = await createClient();

  // Definisikan status mana saja yang dianggap "SUDAH SELESAI"
  const completedStatuses = [
    "REVISED", // RUU Selesai Direvisi
    "NO_REVISION", // RUU Disahkan Tanpa Revisi
    "approved", // Proposal Daerah Disetujui
    "rejected", // Proposal Daerah Ditolak
  ];

  let query = supabase
    .from("vw_board_tracker")
    .select("*")
    .in("current_status", completedStatuses) // HANYA AMBIL YANG SUDAH SELESAI
    .order("created_at", { ascending: false });

  // Filter berdasarkan domisili untuk usulan daerah
  if (userLocation) {
    query = query.or(
      `item_type.eq.LEGISLATION,and(item_type.eq.PROPOSAL,location.eq."${userLocation}")`,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching archived data:", error);
    return { error: error.message };
  }

  return { data };
}
