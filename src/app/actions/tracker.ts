"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { LegislationStatus, ProposalStatus } from "@/lib/constants/tracker";

// 1. Fungsi untuk mengambil semua data yang akan ditampilkan di Kanban Board
export async function getBoardTrackerData(userLocation?: string | null) {
  const supabase = await createClient();

  let query = supabase
    .from("vw_board_tracker")
    .select("*")
    .order("created_at", { ascending: false });

  if (userLocation) {
    query = query.or(
      `item_type.eq.LEGISLATION,and(item_type.eq.PROPOSAL,location.eq."${userLocation}")`,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching board tracker data:", error);
    return { error: error.message };
  }

  return { data };
}

// 2. Fungsi untuk mengambil riwayat perpindahan status (Timeline/History)
export async function getTrackerTimeline(trackableId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tracker_logs")
    .select(
      `
      *,
      governance (
        full_name,
        role
      )
    `,
    )
    .eq("trackable_id", trackableId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching tracker timeline:", error);
    return { error: error.message };
  }

  return { data };
}

// 3. Fungsi untuk Admin: Mengubah status dan mencatatnya ke dalam Log
export async function updateStatusAndLog(
  id: string,
  type: "LEGISLATION" | "PROPOSAL",
  newStatus: string,
  previousStatus: string,
  adminId: string | null,
  notes?: string,
) {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  if (type === "LEGISLATION") {
    const { error } = await supabase
      .from("legislation_drafts")
      .update({ status: newStatus, updated_at: timestamp })
      .eq("id", id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("proposals")
      .update({ status: newStatus, updated_at: timestamp })
      .eq("id", id);

    if (error) return { error: error.message };
  }

  const { error: logError } = await supabase.from("tracker_logs").insert({
    trackable_type: type,
    trackable_id: id,
    previous_status: previousStatus,
    new_status: newStatus,
    changed_by: adminId,
    change_notes: notes || null,
  });

  if (logError) return { error: logError.message };

  revalidatePath("/track");
  revalidatePath("/admin/tracker");

  return { success: true };
}
