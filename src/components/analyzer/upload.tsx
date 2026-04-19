"use client";

import { useState } from "react";

export default function Upload({ onResult }: any) {
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const { text } = await uploadRes.json();
        console.log(text);

        const processRes = await fetch("/api/process", {
            method: "POST",
            body: JSON.stringify({ text }),
        });

        const data = await processRes.json();

        console.log(data);

        onResult(data);
        setLoading(false);
    };

    return (
        <div>
            <input
                type="file"
                accept="application/pdf"
                onChange={handleUpload}
            />
            {loading && <p>Processing...</p>}
        </div>
    );
}
