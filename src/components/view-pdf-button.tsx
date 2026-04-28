"use client";

interface ViewPdfButtonProps {
    filePath?: string | null;
    label?: string;
}

export default function ViewPdfButton({
    filePath,
    label = "View Original PDF",
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
            className={`
                text-sm px-2 py-1 rounded
                ${
                    filePath
                        ? "text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                        : "text-gray-400 bg-gray-100 cursor-not-allowed"
                }
            `}
        >
            {label}
        </button>
    );
}
