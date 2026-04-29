"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import {
    ArrowRight,
    CheckCircle2,
    Edit3,
    FileText,
    Loader2,
    PencilLine,
    Sparkles,
} from "lucide-react";

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
    const router = useRouter();
    if (!data || !data.success) return null;
    const legalId = data.analysisId;

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
        <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white rounded-xl shadow-sm border border-slate-200">
            {/* Header & Stats */}
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#1A1F2B]">
                        Hasil Analisis Hukum
                    </h2>
                </div>
            </div>

            {/* Kesimpulan Utama (Final Summary) */}
            <section className="bg-slate-50 p-6 rounded-lg border-l-4 border-blue-600">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Ringkasan Eksekutif
                </h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                    {content.final?.final_summary}
                </p>
                {content.final?.key_points?.length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Poin Utama:
                        </h4>
                    </div>
                )}
            </section>

            {/* Breakdown Per Pasal */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-[#1A1F2B]">
                    Detail Per Pasal
                </h3>
                <div className="grid gap-4">
                    {content.chunks.map((item, i) => (
                        <div
                            key={i}
                            className="p-4 border rounded-lg hover:border-blue-200 transition-colors"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded">
                                    {item.title}
                                </span>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed mb-3">
                                {item.summary}
                            </p>

                            {/* Key Points per Pasal (Opsional) */}
                            {item.key_points?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {item.key_points.map((kp, idx) => (
                                        <span
                                            key={idx}
                                            className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100"
                                        >
                                            {kp}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="rounded-[2rem] border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        Panjang Ringkasan
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-800">
                        {summary.trim().length} chars
                    </p>
                </div>
                {/* <div className="rounded-[2rem] border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        Aksi
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-800">
                        {isEditing ? "Save draft" : "Open editor"}
                    </p>
                </div> */}
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <section className="lg:col-span-2 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                Content
                            </p>
                            <h3 className="mt-1 text-lg font-black text-slate-800">
                                Summary Editor
                            </h3>
                        </div>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-2 rounded-2xl bg-[#3F5C73] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3F5C73]/20 transition hover:bg-[#314b60]"
                            >
                                <Edit3 className="size-4" />
                                Edit
                            </button>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        setSummary(
                                            data.data.final.final_summary,
                                        );
                                        setIsEditing(false);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-[#3F5C73] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3F5C73]/20 transition hover:bg-[#314b60] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="size-4" />
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {!isEditing ? (
                        <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5">
                            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                                {summary || "Belum ada ringkasan."}
                            </p>
                        </div>
                    ) : (
                        <textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="min-h-64 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700 outline-none transition focus:border-[#4FB3B3] focus:bg-white focus:ring-4 focus:ring-[#4FB3B3]/10"
                        />
                    )}
                </section>

                <aside className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        <PencilLine className="size-4" />
                        Quick Actions
                    </div>

                    <p className="text-sm leading-relaxed text-slate-600">
                        Simpan perubahan ringkasan lalu kembali ke daftar
                        administrasi untuk memeriksa item lain.
                    </p>

                    <div className="mt-5 space-y-3">
                        <Button
                            asChild
                            className="h-12 w-full rounded-2xl bg-slate-800 font-bold text-white hover:bg-slate-700"
                        >
                            <Link
                                href="/legal/admin"
                                className="flex items-center justify-center gap-2"
                            >
                                Lihat Semua Analisis
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>

                        <div className="rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
                            Gunakan mode edit hanya saat Anda sudah siap
                            memperbarui ringkasan final.
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
