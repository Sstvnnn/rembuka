"use client";

import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type LegalSummaryRow = {
    id: string;
    created_at: string;
    file_name: string | null;
    final_summary: string | null;
    final_key_points: unknown;
    metadata: unknown;
    legislation_draft_id: string | null;
};

function extractKeyPoints(value: unknown): string[] {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value.map((item) => String(item)).filter(Boolean);
    }

    if (typeof value === "object") {
        const candidate = (value as { key_points?: unknown }).key_points;
        if (Array.isArray(candidate)) {
            return candidate.map((item) => String(item)).filter(Boolean);
        }

        return Object.values(value as Record<string, unknown>)
            .map((item) => String(item))
            .filter(Boolean);
    }

    return [];
}

export default function LegalSummaryPage() {
    const supabase = useMemo(() => createClient(), []);
    const params = useParams();
    const legalId = params.id as string;
    const [summary, setSummary] = useState<LegalSummaryRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!legalId) {
            setErrorMessage("ID legal tidak ditemukan.");
            setLoading(false);
            return;
        }

        fetchSummaryById();
    }, [legalId]);

    async function fetchSummaryById() {
        setLoading(true);
        setErrorMessage(null);

        const { data, error } = await supabase
            .from("legal_analysis")
            .select(
                "id, created_at, file_name, final_summary, final_key_points, metadata, legislation_draft_id",
            )
            .eq("id", legalId)
            .single();

        if (error) {
            setErrorMessage(error.message || "Gagal memuat ringkasan.");
            setSummary(null);
            setLoading(false);
            return;
        }

        setSummary((data as LegalSummaryRow) || null);
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">Legal Summary</h1>
                    <button
                        onClick={fetchSummaryById}
                        className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-100"
                    >
                        Refresh
                    </button>
                </div>

                {loading && (
                    <div className="rounded-xl border bg-white p-4 text-gray-600">
                        Loading summary...
                    </div>
                )}

                {!loading && errorMessage && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        {errorMessage}
                    </div>
                )}

                {!loading && !errorMessage && !summary && (
                    <div className="rounded-xl border bg-white p-4 text-gray-600">
                        Ringkasan untuk dokumen ini belum tersedia.
                    </div>
                )}

                {!loading &&
                    !errorMessage &&
                    summary &&
                    (() => {
                        const keyPoints = extractKeyPoints(
                            summary.final_key_points,
                        );

                        return (
                            <article className="rounded-xl border bg-white p-5 shadow-sm">
                                <header className="mb-3 space-y-1">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {summary.file_name ||
                                            "Untitled Legal Document"}
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        {new Date(
                                            summary.created_at,
                                        ).toLocaleString()}
                                    </p>
                                </header>

                                <section className="mb-4">
                                    <h3 className="mb-1 font-medium text-gray-800">
                                        Final Summary
                                    </h3>
                                    <p className="whitespace-pre-wrap text-sm text-gray-700">
                                        {summary.final_summary ||
                                            "Ringkasan belum tersedia untuk dokumen ini."}
                                    </p>
                                </section>

                                {/* <section>
                                    <h3 className="mb-1 font-medium text-gray-800">
                                        Key Points
                                    </h3>

                                    {keyPoints.length > 0 ? (
                                        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                                            {keyPoints.map((point, index) => (
                                                <li
                                                    key={`${summary.id}-${index}`}
                                                >
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Tidak ada key points.
                                        </p>
                                    )}
                                </section> */}
                            </article>
                        );
                    })()}
            </div>
        </div>
    );
}
