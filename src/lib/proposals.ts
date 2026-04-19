import { createClient } from "@/lib/supabase/server";
import { Proposal } from "@/types/musrenbang";

export async function getProposals(filters?: { status?: string; category?: string }) {
  try {
    const supabase = await createClient();
    
    let query = supabase
      .from("proposal_rankings")
      .select("*")
      .order("total_points", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("Supabase Query Error:", error);
      return [];
    }
    
    return (data || []) as Proposal[];
  } catch (err) {
    console.error("Unexpected error in getProposals:", err);
    return [];
  }
}

export async function getProposalById(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("proposal_rankings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as Proposal | null;
  } catch (err) {
    console.error("Error fetching proposal:", err);
    return null;
  }
}

export async function getProposalVotes(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("proposal_votes")
      .select("*")
      .eq("user_id", userId);

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}
