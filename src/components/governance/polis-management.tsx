"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  FileText,
  Gavel,
  Loader2,
  PencilLine,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type DocumentRef = {
  file_path: string;
  title: string;
};

type AnalysisItem = {
  id: string;
  file_name: string;
  final_summary: string;
  document_id: string;
  documents?: DocumentRef;
};

export function PolisManagement() {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftSummary, setDraftSummary] = useState("");

  useEffect(() => {
    void fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    try {
      const res = await fetch("/api/legal-analysis");
      const json = await res.json();
      setItems(json.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    setSavingId(id);

    try {
      await fetch("/api/legal-analysis", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          final_summary: draftSummary,
        }),
      });

      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, final_summary: draftSummary } : item,
        ),
      );
      setEditingId(null);
      setDraftSummary("");
    } finally {
      setSavingId(null);
    }
  }

  async function handleViewFile(filePath: string) {
    const res = await fetch("/api/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_path: filePath }),
    });

    const data = await res.json();

    if (data.url) {
      window.open(data.url, "_blank");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white">
        <Loader2 className="size-8 animate-spin text-[#11538C]" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {items.map((item) => {
        const isEditing = editingId === item.id;
        const isSaving = savingId === item.id;

        return (
          <article
            key={item.id}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                    POL.IS Rule Set
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    {item.documents?.title || "Dokumen Regulasi"}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-[#1A1F2B]">
                    {item.file_name}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-slate-500">
                    Kelola ringkasan regulasi yang akan dibaca warga sebelum
                    memberi opini dan suara pada POL.IS.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl border-slate-200 px-5 font-bold text-slate-700"
                onClick={() => handleViewFile(item.documents?.file_path || "")}
              >
                Lihat Dokumen
                <ArrowUpRight className="ml-2 size-4" />
              </Button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-[1.5rem] border border-slate-200 bg-[#F6F5F2] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <PencilLine className="size-4 text-[#11538C]" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Summary for Citizens
                  </p>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={draftSummary}
                      onChange={(event) => setDraftSummary(event.target.value)}
                      className="min-h-[180px] w-full rounded-[1.25rem] border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none ring-0 focus:border-[#11538C]"
                    />
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        className="h-11 rounded-2xl bg-[#11538C] px-5 font-bold text-white hover:bg-[#0c3e6b]"
                        disabled={isSaving}
                        onClick={() => handleUpdate(item.id)}
                      >
                        {isSaving ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 size-4" />
                        )}
                        Simpan Ringkasan
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-2xl border-slate-200 px-5 font-bold text-slate-700"
                        onClick={() => setEditingId(null)}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                      {item.final_summary || "Belum ada ringkasan yang disusun."}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-2xl border-slate-200 px-5 font-bold text-slate-700"
                      onClick={() => {
                        setEditingId(item.id);
                        setDraftSummary(item.final_summary || "");
                      }}
                    >
                      <PencilLine className="mr-2 size-4" />
                      Edit Ringkasan
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.5rem] border border-slate-200 bg-[#0F3E68] p-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                      <Gavel className="size-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">
                        Governance Task
                      </p>
                      <h3 className="text-lg font-black">Validasi Narasi</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-blue-100">
                    Pastikan ringkasan tetap netral, mudah dipahami, dan cukup
                    kontekstual sebelum warga memberi respons.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-[#11538C]">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Governance Flow
                      </p>
                      <h3 className="text-lg font-black text-[#1A1F2B]">
                        Rule Publishing
                      </h3>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-3 text-sm text-slate-500">
                    <li>Unggah atau buka dokumen regulasi sumber.</li>
                    <li>Rapikan ringkasan final untuk warga.</li>
                    <li>Gunakan detail dokumen untuk menyiapkan pernyataan POL.IS.</li>
                  </ul>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
