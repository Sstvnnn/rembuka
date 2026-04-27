"use client";

import { useEffect, useState } from "react";

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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const fetchData = async () => {
        setLoading(true);
        const res = await fetch("/api/legal-analysis");
        const json = await res.json();
        console.log("Fetched data:", json);
        setData(json.data || []);
        setLoading(false);
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

    const handleViewFile = async (filePath: string) => {
        const res = await fetch("/api/signed-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file_path: filePath }),
        });

        const data = await res.json();

        if (data.url) {
            window.open(data.url, "_blank");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-4">
            <h1 className="text-xl font-bold">Legal Analysis List</h1>

            {data.map((item) => (
                <div key={item.id} className="border p-4 rounded space-y-2">
                    <p className="font-semibold">{item.file_name}</p>

                    {editingId === item.id ? (
                        <>
                            <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full border p-2 rounded"
                            />

                            <button
                                onClick={() => handleUpdate(item.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded"
                            >
                                Save
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-gray-700">
                                {item.final_summary}
                            </p>

                            <button
                                onClick={() =>
                                    handleViewFile(
                                        item.documents?.file_path || "",
                                    )
                                }
                                className="text-sm text-indigo-600 bg-indigo-100 px-2 py-1 rounded"
                            >
                                View Original PDF
                            </button>

                            <button
                                onClick={() => {
                                    setEditingId(item.id);
                                    setEditValue(item.final_summary);
                                }}
                                className="text-blue-600 text-sm"
                            >
                                Edit
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
