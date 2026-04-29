import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";

export async function GET() {
    const supabase = await createClient();
    const { profile } = await getCurrentProfile();

    const allowedCities = [profile?.location].filter((value): value is string =>
        Boolean(value),
    );

    console.log("Allowed cities for legal analysis:", allowedCities);

    const { data, error } = await supabase
        .from("legal_analysis")
        .select(
            `
        id,
        file_name,
        final_summary,
        document_id,
        documents!inner (
            file_path,
            title,
            city
        )
    `,
        )
        .in("documents.city", allowedCities)
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
