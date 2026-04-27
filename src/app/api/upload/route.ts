import { extractTextFromPDF } from "@/lib/analyzer/pdf";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        console.log("UPLOAD START");

        const formData = await req.formData();

        const file = formData.get("file") as File | null;
        const title = formData.get("title") as string | null;
        const province = formData.get("province") as string | null;
        const city = formData.get("city") as string | null;

        if (!file || !title) {
            return NextResponse.json(
                { error: "File and title are required" },
                { status: 400 },
            );
        }

        console.log("FILE:", file.name, file.size);

        const buffer = Buffer.from(await file.arrayBuffer());

        console.log("BUFFER READY:", buffer.length);

        // extract text
        const text = await extractTextFromPDF(buffer);

        console.log("PDF PARSED SUCCESS");

        // filename
        const safeTitle = slugify(title);
        const fileName = `${safeTitle}-${Date.now()}.pdf`;

        console.log("UPLOADING TO SUPABASE:", fileName);

        // upload file
        const { data, error } = await supabase.storage
            .from("pdf-documents")
            .upload(fileName, buffer, {
                contentType: file.type || "application/pdf",
            });

        if (error) {
            console.error("SUPABASE UPLOAD ERROR:", error);
            throw new Error(error.message);
        }

        console.log("UPLOAD SUCCESS:", data);

        // insert metadata
        const { data: meta, error: metaError } = await supabase
            .from("documents")
            .insert({
                title,
                province,
                city,
                file_path: data.path,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (metaError) {
            console.error("METADATA INSERT ERROR:", metaError);
            throw new Error(metaError.message);
        }

        return NextResponse.json({
            success: true,
            text,
            document: meta,
        });
    } catch (error: any) {
        console.error("UPLOAD CRASH:", error);

        return NextResponse.json(
            {
                error: error?.message || "Internal Server Error",
            },
            { status: 500 },
        );
    }
}
