import { extractTextFromPDF } from "@/lib/analyzer/pdf";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 },
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        let text = "";

        try {
            text = await extractTextFromPDF(buffer);
        } catch (e) {
            console.error("PDF parse error:", e);
            return NextResponse.json(
                { error: "Failed to parse PDF" },
                { status: 500 },
            );
        }

        return NextResponse.json({ text });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to process uploaded PDF";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
