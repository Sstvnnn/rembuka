"use client";

import ViewPdfButton from "@/components/view-pdf-button";
import { createClient } from "@/lib/supabase/client";
import { motion, type Variants } from "framer-motion";
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    FileText,
    Gavel,
    Loader2,
    MessageSquareQuote,
    RefreshCw,
    Sparkles,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: "easeOut" },
    },
};

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
    const [documentPath, setDocumentPath] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!legalId) {
            setErrorMessage("ID legal tidak ditemukan.");
            setLoading(false);
            return;
        }

        fetchSummaryById();
        fetchDocumentFile();
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

    async function fetchDocumentFile() {
        const { data: analysis } = await supabase
            .from("legal_analysis")
            .select("document_id")
            .eq("id", legalId)
            .single();
        if (!analysis?.document_id) {
            console.warn(
                "No document_id found for legal analysis with id:",
                legalId,
            );
            return;
        }

        const { data: doc } = await supabase
            .from("documents")
            .select("file_path")
            .eq("id", analysis.document_id)
            .single();

        setDocumentPath(doc?.file_path || "");
    }

    return (
        <div className="min-h-screen bg-[#F4F6FA] font-sans">
            <main className="pt-20">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
                >
                    <motion.section
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-3xl text-white shadow-xl min-h-[330px] flex items-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a3d6b]/95 via-[#11538C]/75 to-[#0a2540]/35" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.24),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.2),transparent_30%)]" />
                        <div className="relative z-10 p-8 md:p-12 lg:p-14 max-w-4xl">
                            <span className="inline-flex w-fit items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100 backdrop-blur-sm">
                                <Gavel className="size-3" />
                                Ringkasan Regulasi
                            </span>
                            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black leading-tight drop-shadow-lg">
                                {loading
                                    ? "Memuat ringkasan..."
                                    : summary?.file_name || "Legal Summary"}
                            </h1>
                            <p className="mt-4 max-w-3xl text-sm md:text-base text-blue-100/90 leading-relaxed">
                                Tampilan yang lebih fokus untuk membaca
                                ringkasan regulasi, membuka dokumen asli, dan
                                meninjau poin-poin utama.
                            </p>
                        </div>
                    </motion.section>

                    {/* <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Status
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {loading ? "..." : summary ? "Aktif" : "Kosong"}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Key points
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {loading
                                    ? "..."
                                    : summary
                                      ? extractKeyPoints(
                                            summary.final_key_points,
                                        ).length
                                      : 0}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Dokumen
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {documentPath ? "Tersedia" : "Belum"}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Ringkasan
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {loading ? "..." : "Terbuka"}
                            </p>
                        </div>
                    </section> */}

                    {loading && (
                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl bg-white border border-slate-100 shadow-sm p-8 flex items-center justify-center"
                        >
                            <Loader2 className="size-6 animate-spin text-blue-400" />
                        </motion.div>
                    )}

                    {!loading && errorMessage && (
                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm"
                        >
                            {errorMessage}
                        </motion.div>
                    )}

                    {!loading && !errorMessage && !summary && (
                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl bg-white border border-slate-100 shadow-sm p-8 text-slate-600"
                        >
                            Ringkasan untuk dokumen ini belum tersedia.
                        </motion.div>
                    )}

                    {!loading &&
                        !errorMessage &&
                        summary &&
                        (() => {
                            const keyPoints = extractKeyPoints(
                                summary.final_key_points,
                            );

                            return (
                                <section className="grid lg:grid-cols-3 gap-6">
                                    <motion.article
                                        variants={itemVariants}
                                        className="lg:col-span-3 rounded-2xl bg-white border border-slate-100 shadow-sm p-6"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                                            <div>
                                                <h2 className="text-lg font-black text-slate-800">
                                                    {summary.file_name ||
                                                        "Untitled Legal Document"}
                                                </h2>
                                                <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">
                                                    <Calendar className="size-4" />
                                                    {new Date(
                                                        summary.created_at,
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={fetchSummaryById}
                                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                                            >
                                                <RefreshCw className="size-4" />
                                                Refresh
                                            </button>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50/70 border border-slate-100 p-5">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-700">
                                                <MessageSquareQuote className="size-4" />
                                                Final Summary
                                            </div>
                                            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                                {summary.final_summary ||
                                                    "Ringkasan belum tersedia untuk dokumen ini."}
                                            </p>
                                        </div>

                                        <div className="mt-6 flex flex-wrap gap-3">
                                            <ViewPdfButton
                                                filePath={documentPath}
                                            />
                                            {/* <button
                                                onClick={() =>
                                                    window.scrollTo({
                                                        top: 0,
                                                        behavior: "smooth",
                                                    })
                                                }
                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                                            >
                                                <ArrowRight className="size-4" />
                                                View Ori
                                            </button> */}
                                        </div>
                                    </motion.article>

                                    {/* <motion.aside
                                        variants={itemVariants}
                                        className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-base font-black text-slate-800">
                                                Key Points
                                            </h3>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                                                <Sparkles className="size-3" />
                                                Highlights
                                            </span>
                                        </div>

                                        {keyPoints.length > 0 ? (
                                            <ul className="space-y-3">
                                                {keyPoints.map(
                                                    (point, index) => (
                                                        <li
                                                            key={`${summary.id}-${index}`}
                                                            className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-sm text-slate-700"
                                                        >
                                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                                                            <span>{point}</span>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                                Tidak ada key points.
                                            </div>
                                        )}

                                        <div className="mt-6 rounded-xl bg-gradient-to-br from-[#0a3d6b] via-[#11538C] to-[#0a2540] p-4 text-white shadow-lg">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-100">
                                                <FileText className="size-4" />
                                                Dokumen Asli
                                            </div>
                                            <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
                                                Gunakan tombol View Pdf untuk
                                                membuka file asli dari analisis
                                                regulasi ini.
                                            </p>
                                        </div>
                                    </motion.aside> */}
                                </section>
                            );
                        })()}
                </motion.div>
            </main>
        </div>
    );
}
