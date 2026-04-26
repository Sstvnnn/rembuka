"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Legal = {
    id: string;
    final_summary: string;
};

export default function LegalListPage() {
    const supabase = createClient();
    const [list, setList] = useState<Legal[]>([]);

    useEffect(() => {
        console.log("Fetching legal list...");
        fetchLegal();
    }, []);

    async function fetchLegal() {
        try {
            const { data, error } = await supabase
                .from("legal_analysis")
                .select("*");
            console.log("Fetch legal list response:", { data, error });
            if (data) setList(data);
            if (error) {
                console.error("Error fetching legal list:", error);
                return;
            }
        } catch (err) {
            console.error("Unexpected error fetching legal list:", err);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-20 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Daftar Regulasi
                </h1>

                <div className="space-y-4">
                    {list.map((item) => (
                        <Link key={item.id} href={`/legal/${item.id}`}>
                            <div className="bg-white border rounded-xl p-4 hover:shadow cursor-pointer transition">
                                <p className="font-medium">
                                    {item.final_summary}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
