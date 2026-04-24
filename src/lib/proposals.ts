import { createClient } from "@/lib/supabase/server";
import { Proposal, ProposalPeriod } from "@/types/musrenbang";

type ProposalFilters = {
  status?: string;
  category?: string;
  periodId?: string;
  userType?: string;
  role?: string;
  userLocation?: string;
};

function isLocationScopedAccess(filters?: ProposalFilters) {
  if (!filters?.userLocation) {
    return false;
  }

  return filters.userType === "citizen" || (filters.userType === "governance" && filters.role === "governance");
}

export async function getRelevantProposalPeriod(location: string) {
  if (!location) {
    return null;
  }

  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const activeQuery = await supabase
      .from("proposal_periods")
      .select("*")
      .eq("location", location)
      .lte("proposal_start_at", now)
      .gte("voting_end_at", now)
      .order("proposal_start_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeQuery.data) {
      return activeQuery.data as ProposalPeriod;
    }

    // If no active session, look for the NEXT upcoming one
    const upcomingQuery = await supabase
      .from("proposal_periods")
      .select("*")
      .eq("location", location)
      .gt("proposal_start_at", now)
      .order("proposal_start_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (upcomingQuery.data) {
      return upcomingQuery.data as ProposalPeriod;
    }

    // Default to the most recently ended session so the page isn't empty
    const latestQuery = await supabase
      .from("proposal_periods")
      .select("*")
      .eq("location", location)
      .lt("voting_end_at", now)
      .order("voting_end_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return (latestQuery.data ?? null) as ProposalPeriod | null;
  } catch (err) {
    console.error("Unexpected error in getRelevantProposalPeriod:", err);
    return null;
  }
}

export async function getProposalPeriods(location: string) {
  if (!location) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("proposal_periods")
      .select("*")
      .eq("location", location)
      .order("proposal_start_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as ProposalPeriod[];
  } catch (err) {
    console.error("Error fetching proposal periods:", err);
    return [];
  }
}

export async function getProposalPeriodById(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("proposal_periods")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as ProposalPeriod | null;
  } catch (err) {
    console.error("Error fetching proposal period by id:", err);
    return null;
  }
}

export async function getProposals(filters?: ProposalFilters) {
  if (!filters?.periodId) {
    return [];
  }

  if (filters.userType === "governance" && filters.role === "admin") {
    return [];
  }

  try {
    const supabase = await createClient();

    let query = supabase
      .from("proposal_rankings")
      .select("*")
      .eq("period_id", filters.periodId)
      .order("created_at", { ascending: false });

    if (isLocationScopedAccess(filters)) {
      query = query.eq("location", filters.userLocation as string);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.category) {
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

    if (error) {
      throw error;
    }

    return data as Proposal | null;
  } catch (err) {
    console.error("Error fetching proposal:", err);
    return null;
  }
}

export async function getProposalVotes(userId: string, periodId?: string) {
  if (!periodId) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("proposal_votes")
      .select("*")
      .eq("user_id", userId)
      .eq("period_id", periodId);

    if (error) {
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

export async function getTopRankedProposals(periodId: string, limit = 3) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("proposal_rankings")
      .select("*")
      .eq("period_id", periodId)
      .eq("status", "approved")
      .order("total_points", { ascending: false })
      .order("total_votes", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching top ranked proposals:", error);
      return [];
    }

    return (data || []) as Proposal[];
  } catch (err) {
    console.error("Unexpected error in getTopRankedProposals:", err);
    return [];
  }
}
