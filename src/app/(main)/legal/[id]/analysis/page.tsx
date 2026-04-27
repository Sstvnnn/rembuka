"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

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
            <div className="bg-white border rounded px-3 py-2 text-sm shadow">
                <p className="font-medium">{data.full_name}</p>
                <p className="text-gray-500">Cluster {data.cluster}</p>
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
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading analysis...</p>
            </div>
        );
    }

    // ===== ERROR =====
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    // ===== EMPTY =====
    if (points.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">
                    Not enough data to generate analysis
                </p>
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
        <div className="min-h-screen bg-gray-50 p-6 pt-30">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* SUMMARY */}
                <div className="bg-white p-4 rounded-xl shadow">
                    <h2 className="text-lg font-semibold mb-2">Summary</h2>
                    <p className="text-sm text-gray-600">
                        Found <b>{consensusList.length}</b> consensus points and{" "}
                        <b>{polarizedList.length}</b> polarized issues across{" "}
                        <b>{points.length}</b> participants.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* LEFT: MAP */}
                    <div className="col-span-2 bg-white p-6 rounded-xl shadow">
                        <h2 className="text-xl font-semibold mb-4">
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
                                patterns. Clusters represent groups with similar
                                opinions.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="space-y-6">
                        {/* RESET */}
                        {selectedStatement && (
                            <button
                                onClick={() => setSelectedStatement(null)}
                                className="text-sm text-blue-600 underline"
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
