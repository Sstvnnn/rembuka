"use client";

import { useState, useRef } from "react";

interface UploadProps {
    onResult: (data: any) => void;
}

export default function Upload({ onResult }: UploadProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset state
        setLoading(true);
        setError(null);

        try {
            // 1. Ekstraksi Teks (Upload File)
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok)
                throw new Error("Gagal mengunggah dan mengekstrak PDF");

            const { text } = await uploadRes.json();

            if (!text)
                throw new Error("Teks tidak dapat diekstraksi dari PDF ini");

            // 2. Analisis & Summarization (Proses LLM)
            // Catatan: Pastikan endpoint ini sesuai dengan file route.ts Anda (misal: /api/analyze)
            const processRes = await fetch("/api/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            const result = await processRes.json();

            if (!result.success) {
                throw new Error(result.error || "Gagal menganalisis dokumen");
            }

            // 3. Kirim hasil ke Parent Component
            onResult(result);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
            // Reset input file agar bisa upload file yang sama lagi jika mau
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <div
                className={`
        relative border-2 border-dashed rounded-xl p-8 transition-all
        ${loading ? "bg-slate-50 border-blue-200" : "bg-white border-slate-300 hover:border-blue-400"}
      `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="application/pdf"
                    onChange={handleUpload}
                    disabled={loading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />

                <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon Loader atau Upload */}
                    {loading ? (
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>
                    )}

                    <div className="space-y-1">
                        <p className="text-lg font-medium text-slate-700">
                            {loading
                                ? "Sedang Menganalisis Dokumen..."
                                : "Klik atau seret PDF Peraturan"}
                        </p>
                        <p className="text-sm text-slate-500">
                            {loading
                                ? "Tahap ini memerlukan waktu sekitar 10-30 detik."
                                : "Pastikan file berupa PDF (Maks. 5MB)"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {error}
                </div>
            )}
        </div>
    );
}
