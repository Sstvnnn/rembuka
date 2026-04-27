"use server";

import { createClient } from "@/lib/supabase/server";

export async function getArchivedDocuments(userLocation?: string | null) {
  const supabase = await createClient();

  const completedStatuses = ["REVISI", "PROYEK_SELESAI", "rejected"];

  let query = supabase
    .from("vw_board_tracker")
    .select("*")
    .in("status", completedStatuses)
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
