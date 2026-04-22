import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } },
) {
    const supabase = await createClient();
    const id = params.id;

    const { data, error } = await supabase
        .from("legal_analyses")
        .select(
            `
            *,
            chunks:legal_analysis_chunks(*)
        `,
        )
        .eq("id", id)
        .single();

    if (error || !data) {
        return NextResponse.json(
            { error: "Data tidak ditemukan" },
            { status: 404 },
        );
    }

    return NextResponse.json({
        success: true,
        metadata: data.metadata,
        data: {
            final: {
                final_summary: data.final_summary,
                key_points: data.final_key_points,
            },
            chunks: data.chunks,
        },
    });
}
