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
        <div className="mx-auto max-w-5xl space-y-6 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-xl sm:p-8">
            <div
                className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-xl sm:p-8"
                style={{
                    backgroundImage:
                        "linear-gradient(135deg, #0a3d6b 0%, #11538C 55%, #0a2540 100%)",
                }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.24),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.18),transparent_30%)]" />
                <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-3xl space-y-3">
                        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100 backdrop-blur-sm">
                            <Sparkles className="size-3" />
                            Executive Summary
                        </span>
                        <h2 className="text-2xl font-black leading-tight sm:text-3xl">
                            Ringkasan Eksekutif
                        </h2>
                        <p className="max-w-2xl text-sm leading-relaxed text-blue-100/90">
                            Tinjau, edit, dan simpan ringkasan final untuk
                            analisis regulasi ini sebelum dipublikasikan.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-blue-50 backdrop-blur-sm">
                        <FileText className="size-4" />
                        {data.data.final.id}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[2rem] border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        Status
                    </p>
                    <p className="mt-2 text-lg font-black text-slate-800">
                        {isEditing ? "Editing" : "Reviewed"}
                    </p>
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
                                href="/governance/legal"
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
