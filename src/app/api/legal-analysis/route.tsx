import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("legal_analysis")
        .select(
            `
        id,
        file_name,
        final_summary,
        document_id,
        documents (
            file_path,
            title
        )
    `,
        )
        .order("created_at", { ascending: false });
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
}

export async function PATCH(req: Request) {
    const supabase = await createClient();

    try {
        const { id, final_summary } = await req.json();

        const { data, error } = await supabase
            .from("legal_analysis")
            .update({
                final_summary,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
