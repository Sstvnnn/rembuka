"use client";

import Link from "next/link";
import ViewPdfButton from "@/components/view-pdf-button";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Edit3,
  FileText,
  Gavel,
  Loader2,
  PencilLine,
  Plus,
  Sparkles,
} from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchData = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/legal-analysis");
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal memuat daftar legal analysis.");
      }

      console.log("Fetched data:", json);
      setData(json.data || []);
    } catch (err) {
      console.error("Failed to fetch legal analysis:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat daftar legal analysis.",
      );
    } finally {
      setLoading(false);
    }
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

  const totalItems = data.length;
  const itemsWithPdf = data.filter((item) => item.documents?.file_path).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F5F2] px-4 py-32">
        <div className="mx-auto flex max-w-md items-center justify-center rounded-[2.5rem] border border-slate-200 bg-white p-12 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="size-5 animate-spin text-[#11538C]" />
            <span className="font-medium">Memuat legal analysis...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F5F2] px-4 pb-12 pt-8 sm:px-8 text-[#1A1F2B]">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <h1 className="mt-4 font-heading text-4xl font-black tracking-tight text-[#11538C]">
                Kelola Ringkasan Regulasi
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
                Periksa file regulasi, edit ringkasan final, dan buka PDF sumber
                langsung dari satu tampilan yang lebih terstruktur.
              </p>
            </div>

            <div className="flex flex-col gap-5 mx-10">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Total Item
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#1A1F2B]">
                    {totalItems}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    File Tersedia
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#1A1F2B]">
                    {itemsWithPdf}
                  </p>
                </div>
              </div>
              <Link
                href="/governance/legal/upload"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#11538C] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#11538C]/20 transition hover:bg-[#0c3e6b]"
              >
                <Plus className="size-4" />
                Upload Regulasi
              </Link>
            </div>
          </div>
        </section>
        {error && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Gavel className="size-8" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-800">
                Belum ada data legal analysis
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                Data akan tampil di sini setelah hasil analisis regulasi masuk
                ke sistem.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:bg-slate-50/50"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                          <Gavel className="size-3" />
                          Regulasi
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                          <ArrowRight className="size-3" />
                          {item.documents?.title || item.file_name}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-800">
                        {item.file_name}
                      </h3>

                      {editingId === item.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="min-h-44 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none transition focus:border-[#4FB3B3] focus:ring-4 focus:ring-[#4FB3B3]/10"
                            placeholder="Tulis ringkasan final baru..."
                          />

                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handleUpdate(item.id)}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#11538C] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0c3e6b]"
                            >
                              <CheckCircle2 className="size-4" />
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditValue("");
                              }}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="max-w-4xl whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                            {item.final_summary}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            <ViewPdfButton
                              filePath={item.documents?.file_path}
                            />

                            <Link
                              href={`/governance/legal/${item.id}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                              Atur Statement
                              <ArrowRight className="size-4" />
                            </Link>

                            <button
                              onClick={() => {
                                setEditingId(item.id);
                                setEditValue(item.final_summary);
                              }}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                              <Edit3 className="size-4" />
                              Ubah Ringkasan
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
