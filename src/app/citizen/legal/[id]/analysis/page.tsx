"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
    ArrowRightLeft,
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    Loader2,
    MapPin,
    MessageSquareQuote,
    Sparkles,
    Users,
} from "lucide-react";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

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

type Point = {
    user: string;
    x: number;
    y: number;
    cluster: number;
    label?: string;
    full_name?: string;
};

type ClusterStat = {
    cluster: number;
    agree: number;
    disagree: number;
    total: number;
    agreeRatio: number;
};

type Consensus = {
    statement_id: string;
    label: "consensus" | "polarized" | "neutral";
    text: string;
    clusters: ClusterStat[];
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0].payload;

        return (
            <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm shadow-lg">
                <p className="font-semibold text-slate-800">{data.full_name}</p>
                <p className="text-slate-500">Klaster {data.cluster}</p>
            </div>
        );
    }
    return null;
};

export default function AnalysisPage() {
    const params = useParams();
    const id = params.id as string;

    const [points, setPoints] = useState<Point[]>([]);
    const [consensus, setConsensus] = useState<Consensus[]>([]);
    const [voteMap, setVoteMap] = useState<
        Record<string, Record<string, number>>
    >({});

    const [selectedStatement, setSelectedStatement] = useState<string | null>(
        null,
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    async function fetchData() {
        try {
            setLoading(true);

            const res = await fetch(`/api/analyze/legal/${id}`);

            if (!res.ok) {
                throw new Error("Failed to fetch analysis");
            }

            const data = await res.json();

            setPoints(data.clustered || []);
            setConsensus(data.consensus || []);

            // bangun peta suara (AMAN)
            const map: Record<string, Record<string, number>> = {};

            data.votes?.forEach((v: any) => {
                if (!map[v.user_id]) map[v.user_id] = {};
                map[v.user_id][v.statement_id] = v.value;
            });

            setVoteMap(map);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false); // 🔥 PERBAIKAN UTAMA
        }
    }

    // ===== MEMUAT =====
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
                <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-6 py-5 flex items-center gap-3 text-slate-600">
                    <Loader2 className="size-5 animate-spin text-blue-500" />
                    <p>Memuat analisis...</p>
                </div>
            </div>
        );
    }

    // ===== KESALAHAN =====
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA] px-4">
                <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 shadow-sm">
                    {error}
                </div>
            </div>
        );
    }

    // ===== KOSONG =====
    if (points.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA] px-4">
                <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-6 py-5 text-slate-600">
                    Data tidak cukup untuk menghasilkan analisis.
                </div>
            </div>
        );
    }

    const consensusList = consensus.filter((c) => c.label === "consensus");
    const polarizedList = consensus.filter((c) => c.label === "polarized");
    const neutralList = consensus.filter((c) => c.label === "neutral");

    // ===== RENDER TITIK =====
    const renderPointDynamic = (props: any) => {
        const { cx, cy, payload } = props;

        const vote = selectedStatement
            ? voteMap[payload.user]?.[selectedStatement]
            : null;

        let color = "#9ca3af";

        if (selectedStatement) {
            if (vote === 1) color = "#22c55e";
            else if (vote === -1) color = "#ef4444";
            else color = "#d1d5db";
        } else {
            color = payload.cluster === 0 ? "#3b82f6" : "#ef4444";
        }

        const opacity = selectedStatement ? (vote !== undefined ? 1 : 0.2) : 1;

        return (
            <g opacity={opacity}>
                <circle cx={cx} cy={cy} r={16} fill={color} />
                <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={10}
                    fontWeight="bold"
                >
                    {payload.label}
                </text>
            </g>
        );
    };

    return (
        <div className="min-h-screen bg-[#F4F6FA] font-sans">
            <main className="pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    <section className="relative overflow-hidden rounded-3xl text-white shadow-xl min-h-[330px] flex items-center">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a3d6b]/95 via-[#11538C]/75 to-[#0a2540]/35" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.24),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.2),transparent_30%)]" />
                        <div className="relative z-10 p-8 md:p-12 lg:p-14 max-w-4xl">
                            <span className="inline-flex w-fit items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100 backdrop-blur-sm">
                                <Users className="size-3" />
                                Analisis Konsensus
                            </span>
                            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black leading-tight drop-shadow-lg">
                                Peta konsensus langsung dan klaster pemungutan
                                suara
                            </h1>
                            <p className="mt-4 max-w-3xl text-sm md:text-base text-blue-100/90 leading-relaxed">
                                Visualisasikan bagaimana peserta dikelompokkan,
                                bandingkan pola persetujuan, dan telusuri
                                pernyataan berdasarkan tingkat konsensus.
                            </p>
                        </div>
                    </section>

                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Poin konsensus
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {consensusList.length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Isu terpolarisasi
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {polarizedList.length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Peserta
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {points.length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Mode filter
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {selectedStatement ? "Aktif" : "Semua"}
                            </p>
                        </div>
                    </section>

                    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-black text-slate-800 mb-2">
                            Ringkasan
                        </h2>
                        <p className="text-sm text-gray-600">
                            Ditemukan <b>{consensusList.length}</b> poin
                            konsensus dan <b>{polarizedList.length}</b> isu
                            terpolarisasi dari <b>{points.length}</b> peserta.
                        </p>
                    </div>

                    {/* <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                            Wawasan naratif
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                            Contoh: sebagian besar peserta sepakat pada beberapa
                            prioritas pembangunan, tetapi penolakan yang kuat
                            muncul pada topik alokasi anggaran.
                        </p>
                    </div> */}

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* KIRI: PETA */}
                        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-5">
                            <h2 className="text-lg font-black text-slate-800 mb-4">
                                Peta Konsensus Langsung
                            </h2>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                                        <Users className="size-4" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-slate-800">
                                            Cara membaca peta ini
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            Jarak antar titik menunjukkan
                                            kemiripan pola pemungutan suara:
                                            makin dekat, makin mirip
                                            pendapatnya.
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Klik sebuah pernyataan untuk
                                            menyorot siapa yang setuju, tidak
                                            setuju, atau melewati. Arahkan
                                            kursor ke titik untuk melihat detail
                                            peserta.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={400}>
                                <ScatterChart>
                                    <CartesianGrid />
                                    <XAxis
                                        dataKey="x"
                                        tick={false}
                                        // axisLine={false}
                                    />
                                    <YAxis
                                        dataKey="y"
                                        tick={false}
                                        // axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />

                                    <Scatter
                                        data={points}
                                        shape={renderPointDynamic}
                                    />
                                </ScatterChart>
                            </ResponsiveContainer>
                            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
                                {/* LEGENDA KLASTER */}
                                <div className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                            <span>Klaster 0</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                            <span>Klaster 1</span>
                                        </div>

                                        <div className="h-4 w-px bg-gray-300" />

                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span>
                                                Klaster menunjukkan kelompok
                                                dengan perilaku suara yang
                                                mirip.
                                            </span>
                                        </div>
                                    </div>

                                    <p className="mt-2 text-xs text-gray-500">
                                        Klaster 0 dan 1 dibuat oleh sistem,
                                        bukan ideologi yang sudah ditentukan
                                        sebelumnya.
                                    </p>

                                    {/* INFO MODE */}
                                    <div className="mt-4 flex flex-wrap items-center gap-4">
                                        {selectedStatement ? (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                                    <span>Setuju</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                                    <span>Tidak setuju</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                                                    <span>
                                                        Lewati / Tidak memilih
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-xs text-slate-500">
                                                Mode default: warna menunjukkan
                                                klaster. Saat pernyataan
                                                dipilih, warna menunjukkan
                                                voting (setuju/tidak setuju/
                                                lewati).
                                            </div>
                                        )}
                                    </div>

                                    <p className="mt-3 text-xs text-gray-500">
                                        Pengguna yang posisinya berdekatan
                                        memiliki pola pemungutan suara yang
                                        mirip. Klaster merepresentasikan
                                        kelompok dengan pendapat yang serupa.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* PANEL KANAN */}
                        <div className="space-y-7">
                            {/* ATUR ULANG */}
                            {selectedStatement && (
                                <button
                                    onClick={() => setSelectedStatement(null)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                                >
                                    Atur ulang sorotan
                                </button>
                            )}

                            {/* KONSENSUS */}
                            <Section
                                title="Konsensus"
                                description="Mayoritas peserta lintas klaster cenderung setuju."
                                color="green"
                                list={consensusList}
                                selected={selectedStatement}
                                setSelected={setSelectedStatement}
                            />

                            {/* TERPOLARISASI */}
                            <Section
                                title="Terpolarisasi"
                                description="Klaster-klaster menunjukkan perbedaan pendapat yang kuat."
                                color="red"
                                list={polarizedList}
                                selected={selectedStatement}
                                setSelected={setSelectedStatement}
                            />

                            {/* NETRAL */}
                            <Section
                                title="Netral"
                                description="Pendapat masih bercampur atau belum cukup jelas untuk dibaca."
                                color="gray"
                                list={neutralList}
                                selected={selectedStatement}
                                setSelected={setSelectedStatement}
                            />

                            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Batasan data
                                </p>
                                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                    Insight bergantung pada jumlah peserta dan
                                    vote yang tersedia. Dataset kecil dapat
                                    menghasilkan klaster yang kurang stabil.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ===== KOMPONEN BAGIAN YANG DAPAT DIGUNAKAN ULANG =====
function Section({
    title,
    description,
    color,
    list,
    selected,
    setSelected,
}: any) {
    return (
        <div>
            <div className="mb-3 space-y-1">
                <h3 className={`text-${color}-600 text-base font-bold`}>
                    {title}
                </h3>
                <p className="text-sm text-slate-500">{description}</p>
            </div>

            <div className="space-y-3">
                {list.map((c: any) => {
                    const isActive = selected === c.statement_id;

                    return (
                        <div
                            key={c.statement_id}
                            onClick={() =>
                                setSelected(isActive ? null : c.statement_id)
                            }
                            className={`p-3 rounded cursor-pointer border transition
                ${
                    isActive
                        ? `bg-${color}-100 ring-2 ring-${color}-300`
                        : `bg-${color}-50 hover:bg-${color}-100`
                }`}
                        >
                            <p className="text-sm font-medium mb-2">{c.text}</p>

                            <div className="text-xs text-gray-600">
                                {(c.clusters || []).map((cl: any) => (
                                    <div key={cl.cluster}>
                                        Klaster {cl.cluster}:{" "}
                                        {(cl.agreeRatio * 100).toFixed(0)}%
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
