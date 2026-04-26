"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { tr } from "framer-motion/client";

type Statement = {
    id: string;
    text: string;
};

type VoteMap = {
    [statementId: string]: number;
};

export default function LegalVotingPage() {
    const supabase = createClient();
    const params = useParams();
    const legalId = params.id as string;

    const [title, setTitle] = useState("");
    const [statements, setStatements] = useState<Statement[]>([]);
    const [user, setUser] = useState<any>(null);
    const [votes, setVotes] = useState<VoteMap>({});

    useEffect(() => {
        init();
    }, []);

    async function init() {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        setUser(user);

        await fetchLegal();
        await fetchStatements();

        if (user) {
            await fetchVotes(user.id);
        }
    }

    async function fetchLegal() {
        const { data } = await supabase
            .from("legal_analysis")
            .select("file_name")
            .eq("id", legalId)
            .single();

        if (data) setTitle(data.file_name);
    }

    async function fetchStatements() {
        const { data } = await supabase
            .from("polis_statements")
            .select("id, text")
            .eq("approved", true)
            .eq("legal_analysis_id", legalId);

        if (data) setStatements(data);
    }

    async function fetchVotes(userId: string) {
        const { data } = await supabase
            .from("polis_votes")
            .select("statement_id, value")
            .eq("user_id", userId);

        if (data) {
            const map: VoteMap = {};
            data.forEach((v) => {
                map[v.statement_id] = v.value;
            });
            setVotes(map);
        }
    }

    async function handleVote(statementId: string, value: number) {
        if (!user) {
            alert("Login dulu");
            return;
        }

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
        const base = "px-4 py-2 rounded-lg text-sm font-medium transition";

        if (!active) return `${base} bg-gray-100 hover:bg-gray-200`;

        if (type === "agree") return `${base} bg-green-500 text-white`;
        if (type === "disagree") return `${base} bg-red-500 text-white`;
        return `${base} bg-blue-500 text-white`;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                {/* TITLE */}
                <h1 className="text-2xl font-bold text-center mb-2">
                    {title || "Loading..."}
                </h1>

                <p className="text-center text-gray-500 mb-6">
                    Berikan pendapatmu terhadap pernyataan berikut
                </p>

                {/* EMPTY STATE */}
                {statements.length === 0 && (
                    <div className="text-center text-gray-500">
                        <p>Belum ada pernyataan untuk regulasi ini.</p>
                        <p className="text-sm mt-2">
                            Tunggu admin menambahkan atau kirim opini kamu dulu.
                        </p>
                    </div>
                )}

                {/* STATEMENTS */}
                <div className="space-y-4">
                    {statements.map((s) => {
                        const currentVote = votes[s.id];

                        return (
                            <div
                                key={s.id}
                                className="bg-white shadow-sm border rounded-xl p-4"
                            >
                                <p className="mb-4 text-gray-800">{s.text}</p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleVote(s.id, 1)}
                                        className={getButtonStyle(
                                            currentVote === 1,
                                            "agree",
                                        )}
                                    >
                                        👍 Agree
                                    </button>

                                    <button
                                        onClick={() => handleVote(s.id, -1)}
                                        className={getButtonStyle(
                                            currentVote === -1,
                                            "disagree",
                                        )}
                                    >
                                        👎 Disagree
                                    </button>

                                    <button
                                        onClick={() => handleVote(s.id, 0)}
                                        className={getButtonStyle(
                                            currentVote === 0,
                                            "pass",
                                        )}
                                    >
                                        ⏭ Pass
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
