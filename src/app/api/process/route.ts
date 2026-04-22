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
        const { text, fileName } = await req.json();

        const chunks = chunkByPasal(text);
        const limitedChunks = chunks.slice(0, 15);
        const chunkSummaries = await summarizeChunks(limitedChunks);
        const final = await combineSummaries(chunkSummaries);

        const supabase = await createServiceClient();

        const { data: mainData, error: mainError } = await supabase
            .from("legal_analyses")
            .insert({
                user_id: user.id,
                file_name: fileName || "Dokumen Tanpa Nama",
                final_summary: final.final_summary,
                final_key_points: final.key_points,
                metadata: {
                    total_chunks: chunks.length,
                    processed_chunks: limitedChunks.length,
                    is_truncated: chunks.length > 15,
                },
            })
            .select()
            .single();

        if (mainError) throw mainError;

        const chunksToInsert = chunkSummaries.map((c) => ({
            analysis_id: mainData.id,
            title: c.title,
            summary: c.summary,
            key_points: c.key_points,
        }));

        const { error: chunksError } = await supabase
            .from("legal_analysis_chunks")
            .insert(chunksToInsert);

        if (chunksError) throw chunksError;

        return NextResponse.json({
            success: true,
            analysisId: mainData.id,
            data: { final, chunks: chunkSummaries },
        });
    } catch (error: any) {
        console.error("Analysis/Save Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
