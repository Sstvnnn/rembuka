"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface AnalysisResponse {
    success: boolean;
    analysisId: string;
    data: {
        final: {
            id: string;
            final_summary: string;
        };
    };
}

export default function Result({ data }: { data: AnalysisResponse }) {
    if (!data || !data.success) return null;
    const router = useRouter();
    const legalId = data.analysisId;

    console.log("Rendering Result component with data:", data);
    console.log("ID: ", legalId);

    const [summary, setSummary] = useState(data.data.final.final_summary || "");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSave() {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch("/api/legal-analysis", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: legalId,
                    final_summary: summary,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Failed to save");
            }

            setIsEditing(false);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow border space-y-4">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                    Ringkasan Eksekutif
                </h2>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Edit
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setSummary(data.data.final.final_summary);
                                setIsEditing(false);
                            }}
                            className="text-sm text-gray-500"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                )}
            </div>

            {/* ERROR */}
            {error && (
                <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}

            {/* CONTENT */}
            {!isEditing ? (
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {summary || "Belum ada ringkasan."}
                </p>
            ) : (
                <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full h-40 p-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            )}
            <div className="" onClick={() => router.push("/lega/admin")}>
                <Button>Lihat Semua Analisis</Button>
            </div>
        </div>
    );
}
