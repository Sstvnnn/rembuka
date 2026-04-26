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

export default function AnalysisPage() {
    const params = useParams();
    const id = params.id as string;

    const [points, setPoints] = useState<Point[]>([]);
    const [consensus, setConsensus] = useState<Consensus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    async function fetchData() {
        try {
            const res = await fetch(`/api/analyze/legal/${id}`);
            const data = await res.json();

            setPoints(data.clustered || []);
            setConsensus(data.consensus || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading analysis...</p>
            </div>
        );
    }

    if (points.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">
                    Not enough data to generate analysis
                </p>
            </div>
        );
    }

    const cluster0 = points.filter((p) => p.cluster === 0);
    const cluster1 = points.filter((p) => p.cluster === 1);

    const consensusList = consensus.filter((c) => c.label === "consensus");
    const polarizedList = consensus.filter((c) => c.label === "polarized");
    const neutralList = consensus.filter((c) => c.label === "neutral");

    return (
        <div className="min-h-screen bg-gray-50 p-6 pt-24">
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
                                <XAxis dataKey="x" name="Opinion Axis X" />
                                <YAxis dataKey="y" name="Opinion Axis Y" />
                                <Tooltip />

                                <Scatter
                                    name="Cluster 0"
                                    data={cluster0}
                                    fill="#3b82f6"
                                />
                                <Scatter
                                    name="Cluster 1"
                                    data={cluster1}
                                    fill="#ef4444"
                                />
                            </ScatterChart>
                        </ResponsiveContainer>

                        <p className="text-sm text-gray-500 mt-4">
                            Each point represents a user. Colors indicate
                            opinion clusters based on voting patterns.
                        </p>
                    </div>

                    {/* RIGHT: INSIGHTS */}
                    <div className="bg-white p-6 rounded-xl shadow space-y-6">
                        {/* CONSENSUS */}
                        <div>
                            <h3 className="text-green-600 font-semibold mb-3">
                                Consensus (Shared Agreement)
                            </h3>

                            {consensusList.length === 0 && (
                                <p className="text-sm text-gray-400">
                                    No strong agreement found
                                </p>
                            )}

                            <div className="space-y-3">
                                {consensusList.map((c) => (
                                    <div
                                        key={c.statement_id}
                                        className="bg-green-50 p-3 rounded"
                                    >
                                        <p className="text-sm font-medium mb-2">
                                            {c.text}
                                        </p>

                                        <div className="text-xs text-gray-600 space-y-1">
                                            {(c.clusters || []).map((cl) => (
                                                <div key={cl.cluster}>
                                                    Cluster {cl.cluster}:{" "}
                                                    {(
                                                        cl.agreeRatio * 100
                                                    ).toFixed(0)}
                                                    % agree
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* POLARIZED */}
                        <div>
                            <h3 className="text-red-600 font-semibold mb-3">
                                Polarized Issues
                            </h3>

                            {polarizedList.length === 0 && (
                                <p className="text-sm text-gray-400">
                                    No major conflicts detected
                                </p>
                            )}

                            <div className="space-y-3">
                                {polarizedList.map((c) => (
                                    <div
                                        key={c.statement_id}
                                        className="bg-red-50 p-3 rounded"
                                    >
                                        <p className="text-sm font-medium mb-2">
                                            {c.text}
                                        </p>

                                        <div className="text-xs text-gray-600 space-y-1">
                                            {(c.clusters || []).map((cl) => (
                                                <div key={cl.cluster}>
                                                    Cluster {cl.cluster}:{" "}
                                                    {(
                                                        cl.agreeRatio * 100
                                                    ).toFixed(0)}
                                                    % agree
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* NEUTRAL */}
                        <div>
                            <h3 className="text-gray-600 font-semibold mb-3">
                                Unclear / Mixed Opinions
                            </h3>

                            <div className="space-y-2">
                                {neutralList.map((c) => (
                                    <div
                                        key={c.statement_id}
                                        className="bg-gray-100 p-2 rounded text-sm"
                                    >
                                        {c.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
