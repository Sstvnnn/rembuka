import { chunkByPasal } from "@/lib/analyzer/chunking";
import { combineSummaries, summarizeChunks } from "@/lib/analyzer/llm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text || typeof text !== "string") {
            return NextResponse.json(
                { error: "Teks tidak ditemukan atau format salah" },
                { status: 400 },
            );
        }

        // 1. Proses Chunking berdasarkan Pasal
        const chunks = chunkByPasal(text);
        console.log(`${chunks.length} chunks found`);

        if (chunks.length === 0) {
            return NextResponse.json(
                { error: "Tidak ada pasal yang terdeteksi" },
                { status: 422 },
            );
        }

        const MAX_CHUNKS = 15;
        const limitedChunks = chunks.slice(0, MAX_CHUNKS);

        const chunkSummaries = await summarizeChunks(limitedChunks);

        const finalSummary = await combineSummaries(chunkSummaries);

        // 5. Response
        return NextResponse.json({
            success: true,
            metadata: {
                total_chunks_detected: chunks.length,
                chunks_processed: limitedChunks.length,
                is_truncated: chunks.length > MAX_CHUNKS,
            },
            data: {
                chunks: chunkSummaries,
                final: finalSummary,
            },
        });
    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: "Gagal memproses dokumen", details: error.message },
            { status: 500 },
        );
    }
}
