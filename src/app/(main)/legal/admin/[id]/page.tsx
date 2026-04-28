"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    CircleDashed,
    Edit3,
    FileText,
    Loader2,
    PencilLine,
    Sparkles,
    ThumbsUp,
} from "lucide-react";
import ViewPdfButton from "@/components/view-pdf-button";
import { createClient } from "@/lib/supabase/client";

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

type LegalAnalysis = {
    id: string;
    file_name: string | null;
    final_summary: string | null;
    document_id: string | null;
    documents?: {
        id?: string;
        file_path?: string | null;
        title?: string | null;
    };
};

type Statement = {
    id: string;
    text: string;
    approved: boolean;
    legal_analysis_id: string;
};

export default function LegalStatementAdminPage() {
    const supabase = useMemo(() => createClient(), []);
    const params = useParams();
    const legalId = params.id as string;

    const [legal, setLegal] = useState<LegalAnalysis | null>(null);
    const [statements, setStatements] = useState<Statement[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!legalId) return;
        fetchData();
    }, [legalId]);

    async function fetchData() {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const [analysisRes, statementsRes] = await Promise.all([
                fetch("/api/legal-analysis"),
                supabase
                    .from("polis_statements")
                    .select("id, text, approved, legal_analysis_id")
                    .eq("legal_analysis_id", legalId),
            ]);

            const analysisJson = await analysisRes.json();
            const analysisList: LegalAnalysis[] = analysisJson.data || [];
            const currentAnalysis =
                analysisList.find((item) => item.id === legalId) || null;

            if (!analysisRes.ok) {
                throw new Error(
                    analysisJson.error || "Gagal memuat legal analysis.",
                );
            }

            if (statementsRes.error) {
                throw statementsRes.error;
            }

            setLegal(currentAnalysis);
            setStatements((statementsRes.data as Statement[]) || []);
        } catch (err) {
            console.error("Failed to load statement admin page:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal memuat data statement.",
            );
        } finally {
            setLoading(false);
        }
    }

    async function saveStatement(statementId: string) {
        setSavingId(statementId);
        setError(null);
        setMessage(null);

        try {
            const { error: updateError } = await supabase
                .from("polis_statements")
                .update({ text: editText })
                .eq("id", statementId);

            if (updateError) throw updateError;

            setMessage("Statement berhasil diperbarui.");
            setEditingId(null);
            setEditText("");
            await fetchData();
        } catch (err) {
            console.error("Failed to update statement:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal menyimpan statement.",
            );
        } finally {
            setSavingId(null);
        }
    }

    async function toggleApprove(statement: Statement) {
        setSavingId(statement.id);
        setError(null);
        setMessage(null);

        try {
            const { error: updateError } = await supabase
                .from("polis_statements")
                .update({ approved: !statement.approved })
                .eq("id", statement.id);

            if (updateError) throw updateError;

            setMessage(
                statement.approved
                    ? "Statement dibatalkan persetujuannya."
                    : "Statement berhasil disetujui.",
            );
            await fetchData();
        } catch (err) {
            console.error("Failed to update approval:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal memperbarui status statement.",
            );
        } finally {
            setSavingId(null);
        }
    }

    const approvedCount = statements.filter(
        (statement) => statement.approved,
    ).length;
    const pendingCount = statements.length - approvedCount;

    if (loading) {
        return (
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(79,179,179,0.1),transparent_50%),#f8fafc] px-4 py-32">
                <div className="mx-auto flex max-w-md items-center justify-center rounded-[2.5rem] border border-slate-100 bg-white p-12 shadow-2xl">
                    <div className="flex items-center gap-3 text-slate-600">
                        <Loader2 className="size-5 animate-spin text-[#4FB3B3]" />
                        <span className="font-medium">Memuat statement...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(79,179,179,0.1),transparent_50%),#f8fafc] px-4 pb-12 pt-32 sm:px-8">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="mx-auto max-w-7xl space-y-8"
            >
                <motion.section
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-xl"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_30%)]" />
                    <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex w-fit items-center gap-1 rounded-full border border-[#4FB3B3]/20 bg-[#4FB3B3]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#3F5C73] backdrop-blur-sm">
                                    <PencilLine className="size-3" />
                                    Atur Statement
                                </span>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Editorial Queue
                                </span>
                            </div>

                            <h1 className="text-4xl font-black tracking-tight text-slate-800">
                                {legal?.file_name ||
                                    "Kelola Statement Regulasi"}
                            </h1>
                            <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-500">
                                Approve atau ubah statement untuk regulasi ini
                                sebelum dipakai di halaman voting dan analisis.
                            </p>

                            {legal?.final_summary ? (
                                <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-4 shadow-sm">
                                    <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                        <Sparkles className="size-3" />
                                        Final Summary
                                    </div>
                                    <p className="max-w-4xl whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                                        {legal.final_summary}
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <ButtonLikeLink
                                href="/legal/admin"
                                label="Kembali"
                            />
                            <ViewPdfButton
                                filePath={legal?.documents?.file_path || null}
                                label="View Original PDF"
                            />
                        </div>
                    </div>
                </motion.section>

                <section className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        label="Total Statement"
                        value={String(statements.length)}
                        icon={FileText}
                    />
                    <StatCard
                        label="Disetujui"
                        value={String(approvedCount)}
                        icon={CheckCircle2}
                    />
                    <StatCard
                        label="Menunggu"
                        value={String(pendingCount)}
                        icon={CircleDashed}
                    />
                </section>

                {error ? (
                    <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    </div>
                ) : null}

                {message ? (
                    <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-700 shadow-sm">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                    </div>
                ) : null}

                <motion.section
                    variants={itemVariants}
                    className="rounded-[2.5rem] border border-slate-100 bg-white/80 p-8 shadow-xl"
                >
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                            <Sparkles className="size-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
                                Statement Manager
                            </p>
                            <h2 className="text-2xl font-black tracking-tight text-slate-800">
                                Daftar Statement Regulasi
                            </h2>
                        </div>
                    </div>

                    {statements.length === 0 ? (
                        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <FileText className="size-8" />
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-slate-800">
                                Belum ada statement
                            </h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                                Tambahkan statement dari proses analisis
                                terlebih dahulu agar bisa di-approve di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {statements.map((statement) => {
                                const isEditing = editingId === statement.id;
                                return (
                                    <article
                                        key={statement.id}
                                        className="rounded-[2rem] border border-slate-100 bg-slate-50/70 p-5 shadow-sm transition hover:border-[#4FB3B3]/30 hover:bg-white"
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0 flex-1 space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                                                            statement.approved
                                                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                : "border border-amber-200 bg-amber-50 text-amber-700"
                                                        }`}
                                                    >
                                                        <ThumbsUp className="size-3" />
                                                        {statement.approved
                                                            ? "Disetujui"
                                                            : "Belum Disetujui"}
                                                    </span>
                                                </div>

                                                {isEditing ? (
                                                    <textarea
                                                        value={editText}
                                                        onChange={(e) =>
                                                            setEditText(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="min-h-40 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none transition focus:border-[#4FB3B3] focus:ring-4 focus:ring-[#4FB3B3]/10"
                                                        placeholder="Ubah teks statement..."
                                                    />
                                                ) : (
                                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                                                        {statement.text}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    saveStatement(
                                                                        statement.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    savingId ===
                                                                    statement.id
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-2xl bg-[#3F5C73] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3F5C73]/20 transition hover:bg-[#314b60] disabled:cursor-not-allowed disabled:opacity-70"
                                                            >
                                                                {savingId ===
                                                                statement.id ? (
                                                                    <Loader2 className="size-4 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle2 className="size-4" />
                                                                )}
                                                                Simpan
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(
                                                                        null,
                                                                    );
                                                                    setEditText(
                                                                        "",
                                                                    );
                                                                }}
                                                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                                            >
                                                                Batal
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    toggleApprove(
                                                                        statement,
                                                                    )
                                                                }
                                                                disabled={
                                                                    savingId ===
                                                                    statement.id
                                                                }
                                                                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-70 ${
                                                                    statement.approved
                                                                        ? "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700"
                                                                        : "bg-[#3F5C73] shadow-[#3F5C73]/20 hover:bg-[#314b60]"
                                                                }`}
                                                            >
                                                                {savingId ===
                                                                statement.id ? (
                                                                    <Loader2 className="size-4 animate-spin" />
                                                                ) : (
                                                                    <CheckCircle2 className="size-4" />
                                                                )}
                                                                {statement.approved
                                                                    ? "Batalkan Approval"
                                                                    : "Approve Statement"}
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(
                                                                        statement.id,
                                                                    );
                                                                    setEditText(
                                                                        statement.text,
                                                                    );
                                                                }}
                                                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#4FB3B3]/30 hover:text-[#3F5C73]"
                                                            >
                                                                <Edit3 className="size-4" />
                                                                Edit Statement
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </motion.section>
            </motion.div>
        </div>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl">
            <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#4FB3B3]/10 text-[#3F5C73]">
                    <Icon className="size-6" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        {label}
                    </p>
                    <p className="text-2xl font-black text-slate-800">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

function ButtonLikeLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#4FB3B3]/30 hover:text-[#3F5C73]"
        >
            <ArrowLeft className="size-4" />
            {label}
        </Link>
    );
}
