"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FileText, ShieldCheck, MapPin, Eye, Search } from "lucide-react";
import { STATUS_LABELS } from "@/lib/constants/tracker";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TransparencyArchiveClient({
  initialData,
}: {
  initialData: any[];
}) {
  const [search, setSearch] = useState("");

  const filteredData = initialData.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-md">
        <Search className="w-5 h-5 text-slate-400 ml-3" />
        <Input
          type="text"
          placeholder="Cari arsip regulasi atau usulan..."
          className="border-none shadow-none focus-visible:ring-0 text-slate-700 font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List Arsip */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-slate-100">
          {filteredData.map((item) => (
            <div
              key={item.item_id}
              className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="hidden md:flex mt-1 w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center text-blue-600 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider"
                    >
                      {item.item_type === "LEGISLATION"
                        ? "Regulasi"
                        : "Proposal Daerah"}
                    </Badge>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 uppercase">
                      {STATUS_LABELS[item.current_status] ||
                        item.current_status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />{" "}
                      {item.location || "Nasional"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />{" "}
                      Diselesaikan:{" "}
                      {format(new Date(item.created_at), "d MMM yyyy", {
                        locale: id,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end">
                <Button
                  asChild
                  className="rounded-full bg-slate-900 text-white hover:bg-blue-600 shadow-md transition-all px-6"
                >
                  <Link
                    href={
                      item.item_type === "PROPOSAL"
                        ? `/proposals/${item.item_id}`
                        : `/legislation/${item.item_id}`
                    }
                  >
                    Lihat Rekam Jejak{" "}
                    <Eye className="w-4 h-4 ml-2 opacity-80" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}

          {filteredData.length === 0 && (
            <div className="p-16 text-center text-slate-400 font-medium">
              Tidak ada arsip yang ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
