"use client";

import { INDONESIA_LOCATIONS } from "@/lib/constants/locations";
import { useEffect, useState } from "react";

export default function Upload({
    onResult,
}: {
    onResult: (data: any) => void;
}) {
    const [file, setFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [province, setProvince] = useState("");
    const [city, setCity] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleSubmit = async () => {
        if (!file) return setError("File PDF wajib dipilih");
        if (!title || !province || !city) {
            return setError("Judul dan lokasi wajib diisi");
        }

        setLoading(true);
        setError(null);

        try {
            /**
             * STEP 1: Upload + extract text + create document
             */
            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", title);
            formData.append("province", province);
            formData.append("city", city);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) {
                throw new Error(uploadData.error || "Upload gagal");
            }

            const { text, document } = uploadData;

            /**
             * STEP 2: Process analysis
             */
            const processRes = await fetch("/api/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    fileName: document.title,
                    document_id: document.id,
                }),
            });

            const processData = await processRes.json();

            if (!processRes.ok || !processData.success) {
                throw new Error(processData.error || "Proses analisis gagal");
            }

            /**
             * DONE
             */
            onResult(processData);
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 max-w-xl mx-auto">
            {/* TITLE */}
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul peraturan"
                className="w-full border p-3 rounded"
                disabled={loading}
            />

            {/* PROVINCE */}
            <select
                value={province}
                onChange={(e) => {
                    setProvince(e.target.value);
                    setCity("");
                }}
                className="w-full border p-3 rounded"
                disabled={loading}
            >
                <option value="">Pilih Provinsi</option>
                {Object.keys(INDONESIA_LOCATIONS).map((p) => (
                    <option key={p} value={p}>
                        {p}
                    </option>
                ))}
            </select>

            {/* CITY */}
            <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border p-3 rounded"
                disabled={!province || loading}
            >
                <option value="">Pilih Kota</option>
                {province &&
                    INDONESIA_LOCATIONS[province].map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
            </select>

            {/* FILE INPUT */}
            <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFile(f);
                }}
                disabled={loading}
                className="w-full"
            />

            {/* FILE STATUS */}
            {file && (
                <p className="text-sm text-green-600">
                    File dipilih: {file.name}
                </p>
            )}

            {/* SUBMIT BUTTON */}
            <button
                onClick={handleSubmit}
                disabled={!file || loading}
                className="w-full bg-blue-600 text-white p-3 rounded"
            >
                {loading ? "Memproses..." : "Submit Analisis"}
            </button>

            {/* ERROR */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
}
