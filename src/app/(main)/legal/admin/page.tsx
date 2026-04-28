"use client";

import Link from "next/link";
import ViewPdfButton from "@/components/view-pdf-button";
import { useEffect, useState } from "react";
import {
    AlertTriangle,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Edit3,
    FileText,
    Gavel,
    Loader2,
    PencilLine,
    Sparkles,
} from "lucide-react";

type Document = {
    id: string;
    file_path: string;
    title: string;
};

type Analysis = {
    id: string;
    file_name: string;
    final_summary: string;
    document_id: string;
    documents?: Document;
};

export default function LegalAnalysisPage() {
    const [data, setData] = useState<Analysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const fetchData = async () => {
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/legal-analysis");
            const json = await res.json();
            console.log("Fetched data:", json);
            setData(json.data || []);
        } catch (err) {
            console.error("Failed to fetch legal analysis:", err);
            setError("Gagal memuat daftar legal analysis.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdate = async (id: string) => {
        await fetch("/api/legal-analysis", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id,
                final_summary: editValue,
            }),
        });

        setEditingId(null);
        setEditValue("");
        fetchData();
    };

    const totalItems = data.length;
    const itemsWithPdf = data.filter(
        (item) => item.documents?.file_path,
    ).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(79,179,179,0.1),transparent_50%),#f8fafc] px-4 py-32">
                <div className="mx-auto flex max-w-md items-center justify-center rounded-[2.5rem] border border-slate-100 bg-white p-12 shadow-2xl">
                    <div className="flex items-center gap-3 text-slate-600">
                        <Loader2 className="size-5 animate-spin text-[#4FB3B3]" />
                        <span className="font-medium">
                            Memuat legal analysis...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(79,179,179,0.1),transparent_50%),#f8fafc] px-4 pb-12 pt-32 sm:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4FB3B3]">
                                Legal Admin
                            </p>
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                                Editorial Queue
                            </span>
                        </div>
                        <h1 className="font-heading text-4xl font-black tracking-tight text-slate-800">
                            Kelola Ringkasan Regulasi
                        </h1>
                        <p className="max-w-2xl text-sm font-medium text-slate-500">
                            Periksa file regulasi, edit ringkasan final, dan
                            buka PDF sumber langsung dari satu tampilan yang
                            lebih terstruktur.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                Total Item
                            </p>
                            <p className="mt-1 text-2xl font-black text-slate-800">
                                {totalItems}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                File Tersedia
                            </p>
                            <p className="mt-1 text-2xl font-black text-slate-800">
                                {itemsWithPdf}
                            </p>
                        </div>
                    </div>
                </div>
                {error && (
                    <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    </div>
                )}

                <section className="rounded-[2.5rem] border border-slate-100 bg-white/80 p-8 shadow-xl">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                            <PencilLine className="size-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
                                Editor Queue
                            </p>
                            <h2 className="text-2xl font-black tracking-tight text-slate-800">
                                Daftar Analisis Regulasi
                            </h2>
                        </div>
                    </div>

                    {data.length === 0 ? (
                        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <Gavel className="size-8" />
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-slate-800">
                                Belum ada data legal analysis
                            </h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                                Data akan tampil di sini setelah hasil analisis
                                regulasi masuk ke sistem.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.map((item) => (
                                <article
                                    key={item.id}
                                    className="rounded-[2rem] border border-slate-100 bg-slate-50/70 p-5 shadow-sm transition hover:border-[#4FB3B3]/30 hover:bg-white"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                                                    <Gavel className="size-3" />
                                                    Regulasi
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                                    <ArrowRight className="size-3" />
                                                    {item.documents?.title ||
                                                        item.file_name}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-black text-slate-800">
                                                {item.file_name}
                                            </h3>

                                            {editingId === item.id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        value={editValue}
                                                        onChange={(e) =>
                                                            setEditValue(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="min-h-44 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none transition focus:border-[#4FB3B3] focus:ring-4 focus:ring-[#4FB3B3]/10"
                                                        placeholder="Tulis ringkasan final baru..."
                                                    />

                                                    <div className="flex flex-wrap gap-3">
                                                        <button
                                                            onClick={() =>
                                                                handleUpdate(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-2xl bg-[#3F5C73] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#3F5C73]/20 transition hover:bg-[#314b60]"
                                                        >
                                                            <CheckCircle2 className="size-4" />
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(
                                                                    null,
                                                                );
                                                                setEditValue(
                                                                    "",
                                                                );
                                                            }}
                                                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                                        >
                                                            Batal
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="max-w-4xl whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                                                        {item.final_summary}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                                        <ViewPdfButton
                                                            filePath={
                                                                item.documents
                                                                    ?.file_path
                                                            }
                                                        />

                                                        <Link
                                                            href={`/legal/admin/${item.id}`}
                                                            className="inline-flex items-center gap-2 rounded-2xl border border-[#4FB3B3]/20 bg-[#4FB3B3]/10 px-4 py-2.5 text-sm font-semibold text-[#3F5C73] shadow-sm transition hover:border-[#4FB3B3]/40 hover:bg-[#4FB3B3]/15"
                                                        >
                                                            Atur Statement
                                                            <ArrowRight className="size-4" />
                                                        </Link>

                                                        <button
                                                            onClick={() => {
                                                                setEditingId(
                                                                    item.id,
                                                                );
                                                                setEditValue(
                                                                    item.final_summary,
                                                                );
                                                            }}
                                                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#4FB3B3]/30 hover:text-[#3F5C73]"
                                                        >
                                                            <Edit3 className="size-4" />
                                                            Ubah Ringkasan
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
