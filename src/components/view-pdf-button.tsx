"use client";

import { FileText, ExternalLink, AlertTriangle } from "lucide-react";

interface ViewPdfButtonProps {
    filePath?: string | null;
    label?: string;
}

export default function ViewPdfButton({
    filePath,
    label = "Lihat File Asli",
}: ViewPdfButtonProps) {
    const handleView = () => {
        if (!filePath) {
            console.warn("No file path provided");
            return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!baseUrl) {
            console.error("Missing SUPABASE URL");
            return;
        }

        const url = `${baseUrl}/storage/v1/object/public/pdf-documents/${filePath}`;
        window.open(url, "_blank");
    };

    return (
        <button
            onClick={handleView}
            disabled={!filePath}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-300
                ${
                    filePath
                        ? "bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/15 active:translate-y-0"
                        : "cursor-not-allowed bg-slate-100 text-slate-400"
                }
            `}
        >
            {filePath ? (
                <FileText className="size-4" />
            ) : (
                <AlertTriangle className="size-4" />
            )}
            <span>{label}</span>
            {filePath ? <ExternalLink className="size-4 opacity-80" /> : null}
        </button>
    );
}
