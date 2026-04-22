interface SummarizedPasal {
    title: string;
    summary: string;
    key_points: string[];
}

interface FinalSummary {
    final_summary: string;
    key_points: string[];
}

interface AnalysisResponse {
    success: boolean;
    metadata: {
        total_chunks_detected: number;
        chunks_processed: number;
        is_truncated: boolean;
    };
    data: {
        chunks: SummarizedPasal[];
        final: FinalSummary;
    };
}

export default function Result({ data }: { data: AnalysisResponse }) {
    if (!data || !data.success) return null;

    const { metadata, data: content } = data;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white rounded-xl shadow-sm border border-slate-200">
            {/* Header & Stats */}
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Hasil Analisis Hukum
                    </h2>
                    <p className="text-sm text-slate-500">
                        Terdeteksi {metadata.total_chunks_detected} pasal.
                        Menampilkan {metadata.chunks_processed} pasal pertama.
                    </p>
                </div>
                {metadata.is_truncated && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Dibatasi (Truncated)
                    </span>
                )}
            </div>

            {/* Kesimpulan Utama (Final Summary) */}
            <section className="bg-slate-50 p-6 rounded-lg border-l-4 border-blue-600">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Ringkasan Eksekutif
                </h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                    {content.final?.final_summary}
                </p>
                {content.final?.key_points?.length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Poin Utama:
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {content.final.key_points.map((kp, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-slate-600"
                                >
                                    <span className="text-blue-500 mt-1">
                                        •
                                    </span>
                                    {kp}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            {/* Breakdown Per Pasal */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800">
                    Detail Per Pasal
                </h3>
                <div className="grid gap-4">
                    {content.chunks.map((item, i) => (
                        <div
                            key={i}
                            className="p-4 border rounded-lg hover:border-blue-200 transition-colors"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded">
                                    {item.title}
                                </span>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed mb-3">
                                {item.summary}
                            </p>

                            {/* Key Points per Pasal (Opsional) */}
                            {item.key_points?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {item.key_points.map((kp, idx) => (
                                        <span
                                            key={idx}
                                            className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100"
                                        >
                                            {kp}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
