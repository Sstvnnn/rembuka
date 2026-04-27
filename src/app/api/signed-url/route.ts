import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        const { file_path } = await req.json();

        const { data, error } = await supabase.storage
            .from("pdf-documents")
            .createSignedUrl(file_path, 60 * 5); // 5 menit

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ url: data.signedUrl });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unexpected error";
        console.error("Error generating signed URL:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
