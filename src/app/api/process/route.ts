import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { chunkByPasal } from "@/lib/analyzer/chunking";
import { combineSummaries, summarizeChunks } from "@/lib/analyzer/llm";

export async function POST(req: Request) {
    const authClient = await createClient();
    const {
        data: { user },
    } = await authClient.auth.getUser();

    if (!user)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { text, fileName, document_id } = await req.json();

        const chunks = chunkByPasal(text);
        const limitedChunks = chunks.slice(0, 1);

        const chunkSummaries = await summarizeChunks(limitedChunks);
        const final = await combineSummaries(chunkSummaries);

        const supabase = await createServiceClient();

        // ONLY INSERT MAIN ANALYSIS
        const { data: mainData, error: mainError } = await supabase
            .from("legal_analysis")
            .insert({
                file_name: fileName || "Dokumen Tanpa Nama",
                document_id: document_id, // dari metadata upload sebelumnya
                final_summary: final.final_summary,
            })
            .select()
            .single();

        if (mainError) throw mainError;

        // ❌ CHUNKS INSERT DIHAPUS SEMENTARA

        return NextResponse.json({
            success: true,
            analysisId: mainData.id,
            data: { final },
        });
    } catch (error: any) {
        console.error("Analysis/Save Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
