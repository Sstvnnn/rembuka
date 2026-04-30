/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Gavel,
    Loader2,
    MessageSquareQuote,
    ThumbsDown,
    ThumbsUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

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

export default function LegalDetailPage() {
    const supabase = createClient();
    const params = useParams();
    const legalId = params.id as string;

    const [statements, setStatements] = useState<any[]>([]);
    const [legal, setLegal] = useState<any>(null);
    const [text, setText] = useState("");
    const [user, setUser] = useState<any>(null);
    const [votes, setVotes] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        init();
    }, []);

    async function init() {
        setLoading(true);

        const {
            data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        await fetchStatements();
        await fetchLegal();

        if (user) {
            await fetchVotes(user.id);
        }

        setLoading(false);
    }

    async function fetchStatements() {
        const { data } = await supabase
            .from("polis_statements")
            .select("*")
            .eq("legal_analysis_id", legalId)
            .eq("approved", true);

        if (data) setStatements(data);
    }
    async function fetchLegal() {
        const { data, error } = await supabase
            .from("legal_analysis")
            .select("*")
            .eq("id", legalId)
            .single();
        console.log("Fetch legal result:", { data, error });
        if (data) setLegal(data);
    }

    async function fetchVotes(userId: string) {
        console.log(
            "Fetching votes for user ID:",
            userId,
            "and legal analysis ID:",
            legalId,
        );
        const { data } = await supabase
            .from("polis_votes")
            .select(
                `
                    statement_id,
                    value,
                    polis_statements!inner (
                        id,
                        legal_analysis_id
                    )
                `,
            )
            .eq("user_id", userId)
            .eq("polis_statements.legal_analysis_id", legalId);

        if (data) {
            const map: Record<string, number> = {};
            data.forEach((v) => {
                map[v.statement_id] = v.value;
            });
            setVotes(map);
        }
    }

    async function handleVote(statementId: string, value: number) {
        if (!user) return alert("Login dulu");

        try {
            const { data, error } = await supabase.from("polis_votes").upsert(
                {
                    user_id: user.id,
                    statement_id: statementId,
                    value,
                },
                {
                    onConflict: "user_id,statement_id",
                },
            );
            console.log("Vote upsert result:", { data, error });
        } catch (error) {
            console.error("Error submitting vote:", error);
        }

        setVotes((prev) => ({
            ...prev,
            [statementId]: value,
        }));
    }

    function getButtonStyle(
        active: boolean,
        type: "agree" | "disagree" | "pass",
    ) {
        const base =
            "inline-flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm transition-all duration-300 focus:outline-none focus:ring-4";

        if (!active)
            return `${base} border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:ring-slate-200`;

        if (type === "agree")
            return `${base} border-emerald-200 bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600 focus:ring-emerald-200`;
        if (type === "disagree")
            return `${base} border-rose-200 bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600 focus:ring-rose-200`;
        return `${base} border-sky-200 bg-sky-500 text-white shadow-sky-500/20 hover:bg-sky-600 focus:ring-sky-200`;
    }

    async function submitOpinion() {
        if (!user) return alert("Login dulu");

        await supabase.from("polis_opinions").insert({
            user_id: user.id,
            legal_analysis_id: legalId,
            text,
        });

        try {
            await supabase.from("polis_statements").insert({
                legal_analysis_id: legalId,
                text,
            });
        } catch (error) {
            console.error("Error submitting statement:", error);
        }
        setText("");
        alert("Opini terkirim");
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
                        className="relative overflow-hidden rounded-3xl text-white shadow-xl min-h-[340px] flex items-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a3d6b]/95 via-[#11538C]/75 to-[#0a2540]/35" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.24),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.2),transparent_30%)]" />
                        <div className="relative z-10 p-8 md:p-12 lg:p-14 max-w-4xl">
                            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black leading-tight drop-shadow-lg">
                                {loading
                                    ? "Memuat regulasi..."
                                    : legal?.file_name ||
                                      "Voting untuk Regulasi"}
                            </h1>
                            <p className="mt-4 max-w-3xl text-sm md:text-base text-blue-100/90 leading-relaxed">
                                Tinjau ringkasan, lihat dokumen asli, dan
                                berikan suara pada pernyataan yang Anda anggap
                                paling tepat.
                            </p>
                        </div>
                    </motion.section>

                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Pernyataan
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {loading ? "..." : statements.length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Riwayat suara saya
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {Object.keys(votes).length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Status
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                Aktif
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Akses dokumen
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                Cepat
                            </p>
                        </div>
                    </section>

                    <section className="grid lg:grid-cols-3 gap-6">
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-6"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                                <div>
                                    <h2 className="text-lg font-black text-slate-800">
                                        Ringkasan Regulasi
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {legal?.file_name ||
                                            "Dokumen belum tersedia"}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        onClick={() =>
                                            router.push(
                                                `/legal/${legalId}/summary`,
                                            )
                                        }
                                        className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-5 h-11 shadow-sm"
                                    >
                                        Lihat Dokumen Asli
                                        <ChevronRight className="ml-2 size-4" />
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            router.push(
                                                `/legal/${legalId}/analysis`,
                                            )
                                        }
                                        className="bg-blue-600 text-white hover:bg-blue-500 rounded-xl px-5 h-11 shadow-sm"
                                    >
                                        Lihat Hasil Analisis
                                        <ArrowRight className="ml-2 size-4" />
                                    </Button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="size-6 text-blue-400 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <div className="rounded-2xl bg-slate-50/70 border border-slate-100 p-5">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-700">
                                            <MessageSquareQuote className="size-4" />
                                            Kesimpulan
                                        </div>
                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                                            {legal?.final_summary ||
                                                "Kesimpulan belum tersedia untuk regulasi ini."}
                                        </p>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <h3 className="text-base font-black text-slate-800">
                                            Pernyataan Voting
                                        </h3>

                                        {statements.length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                                                Belum ada pernyataan yang
                                                disetujui.
                                            </div>
                                        ) : (
                                            statements.map((s) => {
                                                const currentVote = votes[s.id];

                                                return (
                                                    <motion.div
                                                        key={s.id}
                                                        variants={itemVariants}
                                                        className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                                                    >
                                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                                            {s.text}
                                                        </p>

                                                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                                            <button
                                                                onClick={() =>
                                                                    handleVote(
                                                                        s.id,
                                                                        1,
                                                                    )
                                                                }
                                                                className={getButtonStyle(
                                                                    currentVote ===
                                                                        1,
                                                                    "agree",
                                                                )}
                                                            >
                                                                <ThumbsUp className="size-4" />
                                                                Setuju
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleVote(
                                                                        s.id,
                                                                        -1,
                                                                    )
                                                                }
                                                                className={getButtonStyle(
                                                                    currentVote ===
                                                                        -1,
                                                                    "disagree",
                                                                )}
                                                            >
                                                                <ThumbsDown className="size-4" />
                                                                Tidak Setuju
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleVote(
                                                                        s.id,
                                                                        0,
                                                                    )
                                                                }
                                                                className={getButtonStyle(
                                                                    currentVote ===
                                                                        0,
                                                                    "pass",
                                                                )}
                                                            >
                                                                <CheckCircle2 className="size-4" />
                                                                Lewati
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-black text-slate-800">
                                    Tulis Opini
                                </h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wide">
                                    <Calendar className="size-3" />
                                    Publik
                                </span>
                            </div>

                            <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                Sampaikan masukan singkat dan langsung untuk
                                regulasi ini.
                            </p>

                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="min-h-40 w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                placeholder="Tulis opini Anda di sini..."
                            />

                            <Button
                                onClick={submitOpinion}
                                className="mt-4 w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-11 font-semibold"
                            >
                                Kirim Opini
                            </Button>

                            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                                Opini yang dikirim akan membantu proses
                                penilaian kebijakan.
                            </div>
                        </motion.div>
                    </section>
                </motion.div>
            </main>
        </div>
    );
}
