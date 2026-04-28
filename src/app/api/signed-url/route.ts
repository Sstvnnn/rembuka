import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        const { file_path } = await req.json();
        console.log("Received file_path for signed URL:", file_path);

        const { data, error } = await supabase.storage
            .from("pdf-documents")
            .createSignedUrl(file_path, 60 * 5);
        console.log("Supabase signed URL response:", { data, error });

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
