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
                <p className="text-slate-500">Cluster {data.cluster}</p>
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

            // build vote map (SAFE)
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
            setLoading(false); // 🔥 FIX UTAMA
        }
    }

    // ===== LOADING =====
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
                <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-6 py-5 flex items-center gap-3 text-slate-600">
                    <Loader2 className="size-5 animate-spin text-blue-500" />
                    <p>Loading analysis...</p>
                </div>
            </div>
        );
    }

    // ===== ERROR =====
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA] px-4">
                <div className="max-w-xl rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-700 shadow-sm">
                    {error}
                </div>
            </div>
        );
    }

    // ===== EMPTY =====
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

    // ===== RENDER POINT =====
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
                                Consensus Analysis
                            </span>
                            <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-black leading-tight drop-shadow-lg">
                                Live consensus map and voting clusters
                            </h1>
                            <p className="mt-4 max-w-3xl text-sm md:text-base text-blue-100/90 leading-relaxed">
                                Visualize how participants are grouped, compare
                                agreement patterns, and inspect statements by
                                consensus level.
                            </p>
                        </div>
                    </section>

                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Consensus points
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {consensusList.length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Polarized issues
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {polarizedList.length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Participants
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {points.length}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                            <p className="text-xs font-medium text-slate-400">
                                Filter mode
                            </p>
                            <p className="mt-2 text-2xl font-black text-slate-800 tracking-tight">
                                {selectedStatement ? "Active" : "All"}
                            </p>
                        </div>
                    </section>

                    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-black text-slate-800 mb-2">
                            Summary
                        </h2>
                        <p className="text-sm text-gray-600">
                            Found <b>{consensusList.length}</b> consensus points
                            and <b>{polarizedList.length}</b> polarized issues
                            across <b>{points.length}</b> participants.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* LEFT: MAP */}
                        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-sm p-6">
                            <h2 className="text-lg font-black text-slate-800 mb-4">
                                Live Consensus Map
                            </h2>

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
                                {/* CLUSTER LEGEND */}
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                    <span>Cluster 0</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                    <span>Cluster 1</span>
                                </div>

                                {/* MODE INFO */}
                                {selectedStatement && (
                                    <>
                                        <div className="h-4 w-px bg-gray-300" />

                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                            <span>Agree</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                            <span>Disagree</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                                            <span>Pass / No vote</span>
                                        </div>
                                    </>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Users closer together have similar voting
                                    patterns. Clusters represent groups with
                                    similar opinions.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT PANEL */}
                        <div className="space-y-6">
                            {/* RESET */}
                            {selectedStatement && (
                                <button
                                    onClick={() => setSelectedStatement(null)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
                                >
                                    Reset highlight
                                </button>
                            )}

                            {/* CONSENSUS */}
                            <Section
                                title="Consensus"
                                color="green"
                                list={consensusList}
                                selected={selectedStatement}
                                setSelected={setSelectedStatement}
                            />

                            {/* POLARIZED */}
                            <Section
                                title="Polarized"
                                color="red"
                                list={polarizedList}
                                selected={selectedStatement}
                                setSelected={setSelectedStatement}
                            />

                            {/* NEUTRAL */}
                            <Section
                                title="Neutral"
                                color="gray"
                                list={neutralList}
                                selected={selectedStatement}
                                setSelected={setSelectedStatement}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ===== REUSABLE SECTION COMPONENT =====
function Section({ title, color, list, selected, setSelected }: any) {
    return (
        <div>
            <h3 className={`text-${color}-600 font-semibold mb-3`}>{title}</h3>

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
                                        Cluster {cl.cluster}:{" "}
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
