import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function fetchVotes() {
    const { data, error } = await supabase
        .from("polis_votes")
        .select("user_id, statement_id, value");

    if (error) {
        console.error("Fetch error:", error);
        return [];
    }

    return data || [];
}
