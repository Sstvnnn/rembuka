// actions/tracker.ts
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

  if (userLocation && userLocation !== "Nasional") {
    query = query.in("location", ["Nasional", userLocation]);
  } else if (userLocation === "Nasional") {
    query = query.eq("location", "Nasional");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching archived data:", error);
    return { error: error.message };
  }

  return { data };
}
