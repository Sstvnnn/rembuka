"use client";

import { INDONESIA_LOCATIONS } from "@/lib/constants/locations";
import {
    AlertTriangle,
    ArrowRight,
    Calendar,
    FileUp,
    Loader2,
    MapPinned,
    Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Upload({
    onResult,
    lockedLocation,
}: {
    onResult: (data: any) => void;
    lockedLocation?: string | null;
}) {
    const [file, setFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [province, setProvince] = useState("");
    const [city, setCity] = useState(lockedLocation ?? "");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (lockedLocation) {
            setCity(lockedLocation);
        }
    }, [lockedLocation]);

    if (!mounted) return null;

    const handleSubmit = async () => {
        if (!file) return setError("File PDF wajib dipilih");
        const finalCity = lockedLocation ?? city;

        if (!title || (!lockedLocation && (!province || !city)) || !finalCity) {
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
            formData.append("province", lockedLocation ? "" : province);
            formData.append("city", finalCity);

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
        <div className="mx-auto max-w-4xl space-y-6 rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-xl sm:p-8">
            <div
                className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-xl sm:p-8"
                style={{
                    backgroundImage:
                        "linear-gradient(135deg, #0a3d6b 0%, #11538C 55%, #0a2540 100%)",
                }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.24),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.18),transparent_30%)]" />
                <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="max-w-2xl space-y-3">
                        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100 backdrop-blur-sm">
                            <Sparkles className="size-3" />
                            Upload Analyzer
                        </span>
                        <h2 className="text-2xl font-black leading-tight sm:text-3xl">
                            Unggah dokumen regulasi untuk dianalisis
                        </h2>
                        <p className="max-w-xl text-sm leading-relaxed text-blue-100/90">
                            Lengkapi judul, lokasi, lalu unggah PDF agar sistem
                            bisa mengekstrak teks dan menyiapkan hasil analisis.
                        </p>
                    </div>
                    <div className="hidden rounded-2xl border border-white/10 bg-white/10 p-4 text-blue-100 backdrop-blur-sm sm:block">
                        <FileUp className="size-8" />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        Judul Peraturan
                    </span>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Judul peraturan"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#4FB3B3] focus:bg-white focus:ring-4 focus:ring-[#4FB3B3]/10"
                        disabled={loading}
                    />
                </label>

                {lockedLocation ? (
                    <label className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                            Kota / Kabupaten
                        </span>
                        <div className="flex min-h-13 items-center rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                            {lockedLocation}
                        </div>
                    </label>
                ) : (
                    <>
                        <label className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                Provinsi
                            </span>
                            <select
                                value={province}
                                onChange={(e) => {
                                    setProvince(e.target.value);
                                    setCity("");
                                }}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#4FB3B3] focus:bg-white focus:ring-4 focus:ring-[#4FB3B3]/10"
                                disabled={loading}
                            >
                                <option value="">Pilih Provinsi</option>
                                {Object.keys(INDONESIA_LOCATIONS).map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-2">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                Kota / Kabupaten
                            </span>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#4FB3B3] focus:bg-white focus:ring-4 focus:ring-[#4FB3B3]/10 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                        </label>
                    </>
                )}

                <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        File PDF
                    </span>
                    <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/70 p-4 transition hover:border-[#4FB3B3]/40 hover:bg-white">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-slate-700">
                                    Pilih dokumen PDF
                                </p>
                                <p className="text-xs text-slate-500">
                                    Format yang didukung: PDF. File akan
                                    diproses setelah Anda menekan submit.
                                </p>
                            </div>
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#4FB3B3]/30 hover:text-[#3F5C73]">
                                <Calendar className="size-4" />
                                <span>Pilih File</span>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) setFile(f);
                                    }}
                                    disabled={loading}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {file && (
                            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                <MapPinned className="size-4" />
                                File dipilih: {file.name}
                            </div>
                        )}
                    </div>
                </label>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-slate-500">
                    Pastikan judul dan lokasi sudah sesuai sebelum memproses.
                </p>

                <button
                    onClick={handleSubmit}
                    disabled={!file || loading}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3F5C73] px-6 py-3 text-sm font-bold text-white shadow-xl shadow-[#3F5C73]/20 transition hover:bg-[#314b60] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        <>
                            Unggah dan Analisis Dokumen
                            <ArrowRight className="size-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
