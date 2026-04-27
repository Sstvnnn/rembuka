import { createClient } from "../supabase/server";

export async function fetchStatements(legalAnalysisId: string) {
    const supabase = createClient();

    const { data, error } = await (await supabase)
        .from("polis_statements")
        .select("id, text")
        .eq("legal_analysis_id", legalAnalysisId)
        .eq("approved", true);

    if (error) {
        console.error("Fetch statements error:", error);
        return [];
    }

    return data || [];
}
