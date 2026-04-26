import { createClient } from "../supabase/server";

export async function fetchVotes(legalAnalysisId: string) {
    const supabase = createClient();

    const { data, error } = await (
        await supabase
    )
        .from("polis_votes")
        .select(
            `
      user_id,
      value,
      statement_id,
      polis_statements!inner (
        legal_analysis_id
      )
    `,
        )
        .eq("polis_statements.legal_analysis_id", legalAnalysisId);

    if (error) {
        console.error("Fetch votes error:", error);
        return [];
    }

    return data;
}
