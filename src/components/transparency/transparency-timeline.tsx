"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  FileSignature,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Download,
} from "lucide-react";
import { STATUS_LABELS } from "@/lib/constants/tracker";
import { Button } from "@/components/ui/button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TransparencyTimeline({
  logs,
  documentTitle,
}: {
  logs: any[];
  documentTitle: string;
}) {
  const getIconForStatus = (status: string) => {
    if (status.includes("REJECTED"))
      return <AlertCircle className="w-5 h-5 text-rose-500" />;
    if (status.includes("APPROVED") || status.includes("VERIFICATION"))
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (status.includes("OPINION") || status.includes("VOTING"))
      return <FileSignature className="w-5 h-5 text-blue-500" />;
    return <Clock className="w-5 h-5 text-slate-400" />;
  };

  const handleDownloadPDF = () => {
    // TODO: Kita akan mengimplementasikan fungsi cetak PDF di langkah selanjutnya
    alert("Fitur cetak PDF laporan audit sedang disiapkan!");
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 max-w-3xl mx-auto">
      {/* Header Buku Besar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Log Audit Publik
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Riwayat Transparansi
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md line-clamp-1">
            {documentTitle}
          </p>
        </div>
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-bold shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" /> Unduh Laporan (PDF)
        </Button>
      </div>

      {/* Garis Waktu (Timeline) */}
      <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-200 before:via-slate-200 before:to-transparent">
        {logs.length === 0 && (
          <p className="text-sm text-slate-400 italic">
            Belum ada riwayat aktivitas untuk dokumen ini.
          </p>
        )}

        {logs.map((log, index) => (
          <div
            key={log.id}
            className="relative flex items-start justify-between gap-6 group"
          >
            {/* Ikon Lingkaran */}
            <div className="absolute left-[-1.95rem] md:left-auto md:-ml-[1.35rem] flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-50 shadow-sm z-10 group-hover:scale-110 transition-transform">
              {getIconForStatus(log.new_status)}
            </div>

            {/* Konten Log */}
            <div className="flex-1 bg-slate-50/50 rounded-2xl p-5 border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-colors ml-4 md:ml-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="font-bold text-slate-800 text-sm">
                  Status: {STATUS_LABELS[log.new_status] || log.new_status}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm w-fit">
                  {format(new Date(log.created_at), "d MMM yyyy • HH:mm", {
                    locale: id,
                  })}
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {log.change_notes || "Pembaruan status sistem."}
              </p>

              {/* Info Eksekutor (Admin) */}
              <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  {log.governance ? log.governance.full_name.charAt(0) : "S"}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">
                    Aktor
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {log.governance
                      ? `${log.governance.full_name} (${log.governance.role})`
                      : "Sistem Otomatis"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
