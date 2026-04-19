import { chunkByPasal } from "@/lib/analyzer/chunking";
import { combineSummaries, summarizeChunks } from "@/lib/analyzer/llm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { text } = await req.json();

    if (!text) {
        return NextResponse.json({ error: "No text" }, { status: 400 });
    }

    const chunks = chunkByPasal(text);

    const chunkSummaries = await summarizeChunks(chunks.slice(0, 5));
    // limit dulu biar aman

    const final = await combineSummaries(chunkSummaries);

    return NextResponse.json({
        total_chunks: chunks.length,
        processed_chunks: chunkSummaries.length,
        chunk_summaries: chunkSummaries,
        final,
    });
}
