"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LegalDetailPage() {
    const supabase = createClient();
    const params = useParams();
    const legalId = params.id as string;

    const [statements, setStatements] = useState<any[]>([]);
    const [legal, setLegal] = useState<any>(null);
    const [text, setText] = useState("");
    const [user, setUser] = useState<any>(null);
    const [votes, setVotes] = useState<Record<string, number>>({});

    const router = useRouter();

    useEffect(() => {
        init();
    }, []);

    async function init() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        await fetchStatements();
        await fetchLegal();

        if (user) {
            await fetchVotes(user.id);
        }
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
        const { data } = await supabase
            .from("polis_votes")
            .select("statement_id, value")
            .eq("user_id", userId);

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
        const base = "px-3 py-1 rounded transition";

        if (!active) return `${base} bg-gray-200 text-black hover:bg-gray-300`;

        if (type === "agree") return `${base} bg-green-500 text-white`;
        if (type === "disagree") return `${base} bg-red-500 text-white`;
        return `${base} bg-blue-500 text-white`;
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
        <div className="min-h-screen bg-gray-50 py-20 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* STATEMENTS */}
                <div>
                    <h2 className="text-xl font-bold mb-4">
                        Voting for {legal?.file_name}
                    </h2>
                    <Button
                        onClick={() => router.push(`/legal/${legalId}/summary`)}
                        className="hover:cursor-pointer mb-4 hover:bg-gray-700"
                    >
                        View Original Document
                    </Button>
                    <Button
                        onClick={() =>
                            router.push(`/legal/${legalId}/analysis`)
                        }
                        className="hover:cursor-pointer mb-4 hover:bg-gray-700"
                    >
                        View Analysis Summary
                    </Button>

                    <div className="space-y-3">
                        {statements.map((s) => {
                            const currentVote = votes[s.id];

                            return (
                                <div
                                    key={s.id}
                                    className="bg-white p-4 rounded-xl border"
                                >
                                    <p className="mb-3">{s.text}</p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleVote(s.id, 1)}
                                            className={getButtonStyle(
                                                currentVote === 1,
                                                "agree",
                                            )}
                                        >
                                            👍
                                        </button>

                                        <button
                                            onClick={() => handleVote(s.id, -1)}
                                            className={getButtonStyle(
                                                currentVote === -1,
                                                "disagree",
                                            )}
                                        >
                                            👎
                                        </button>

                                        <button
                                            onClick={() => handleVote(s.id, 0)}
                                            className={getButtonStyle(
                                                currentVote === 0,
                                                "pass",
                                            )}
                                        >
                                            ⏭
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SUBMIT OPINION */}
                <div className="bg-white p-4 rounded-xl border">
                    <h2 className="font-bold mb-2">Tulis Opini</h2>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full border p-2 rounded mb-3"
                    />

                    <button
                        onClick={submitOpinion}
                        className="bg-black text-white px-4 py-2 rounded"
                    >
                        Kirim
                    </button>
                </div>
            </div>
        </div>
    );
}
