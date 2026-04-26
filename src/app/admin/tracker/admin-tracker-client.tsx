"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateStatusAndLog } from "@/app/actions/tracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Landmark,
  Construction,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
} from "lucide-react";
import {
  LEGISLATION_STATUS,
  PROPOSAL_STATUS,
  STATUS_LABELS,
} from "@/lib/constants/tracker";

type TrackerItem = {
  item_id: string;
  title: string;
  item_type: "LEGISLATION" | "PROPOSAL";
  current_status: string;
  created_at: string;
  location: string | null;
};

export default function AdminTrackerClient({
  initialData,
}: {
  initialData: TrackerItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const legislationData = initialData.filter(
    (item) => item.item_type === "LEGISLATION",
  );
  const proposalData = initialData.filter(
    (item) => item.item_type === "PROPOSAL",
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filterAndPaginate = (data: TrackerItem[]) => {
    const filtered = data.filter((item) => {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q);
    });
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );
    return { paginated, totalPages, totalCount: filtered.length };
  };

  const legResult = filterAndPaginate(legislationData);
  const propResult = filterAndPaginate(proposalData);

  const handleStatusChange = (
    id: string,
    type: "LEGISLATION" | "PROPOSAL",
    oldStatus: string,
    newStatus: string,
  ) => {
    if (oldStatus === newStatus) return;

    setLoadingId(id);
    startTransition(async () => {
      const adminId = null; // Biarkan null jika auth belum terintegrasi ke governance
      const result = await updateStatusAndLog(
        id,
        type,
        newStatus,
        oldStatus,
        adminId,
        "Status diubah melalui Dasbor Admin",
      );

      if (result.error) {
        alert("Gagal merubah status: " + result.error);
      }
      setLoadingId(null);
    });
  };

  const TableHeader = () => (
    <thead className="bg-slate-50 border-b">
      <tr>
        <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500">
          Judul Item
        </th>
        <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500">
          Detail Info
        </th>
        <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500">
          Status Saat Ini
        </th>
        <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-500">
          Aksi Manajemen
        </th>
      </tr>
    </thead>
  );

  const TrackerTable = ({ data }: { data: TrackerItem[] }) => (
    <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
      <table className="w-full text-sm text-left border-collapse">
        <TableHeader />
        <tbody className="divide-y">
          {data.map((item) => (
            <tr
              key={item.item_id}
              className="hover:bg-slate-50/50 transition-colors"
            >
              <td className="p-4">
                <p className="font-bold text-slate-800 line-clamp-1">
                  {item.title}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  ID: {item.item_id}
                </p>
              </td>
              <td className="p-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <Calendar className="size-3.5 opacity-70" />
                    {new Date(item.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit border border-emerald-100">
                      <MapPin className="size-3 opacity-70" />
                      {item.location}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-4">
                <span className="font-semibold text-slate-600">
                  {STATUS_LABELS[item.current_status] || item.current_status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-25">
                  {/* SELECT STATUS */}
                  <select
                    className="text-xs p-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 font-medium"
                    disabled={isPending && loadingId === item.item_id}
                    value={item.current_status}
                    onChange={(e) =>
                      handleStatusChange(
                        item.item_id,
                        item.item_type,
                        item.current_status,
                        e.target.value,
                      )
                    }
                  >
                    {(item.item_type === "LEGISLATION"
                      ? Object.values(LEGISLATION_STATUS)
                      : Object.values(PROPOSAL_STATUS)
                    ).map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>

                  {/* TOMBOL LIHAT DETAIL */}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 gap-2 border-slate-200 hover:bg-slate-100"
                  >
                    <Link
                      href={
                        item.item_type === "PROPOSAL"
                          ? `/proposals/${item.item_id}`
                          : `/legislation/${item.item_id}`
                      }
                    >
                      <Eye className="size-4" />
                      <span className="hidden sm:inline">Detail</span>
                    </Link>
                  </Button>

                  {isPending && loadingId === item.item_id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="p-12 text-center text-slate-400 italic"
              >
                Belum ada data untuk kategori ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const PaginationControls = ({ totalPages }: { totalPages: number }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-4">
        <span className="text-sm text-slate-500 font-medium">
          Halaman {currentPage} dari {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 rounded-lg"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 rounded-lg"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Tabs
      defaultValue="legislation"
      onValueChange={() => {
        setSearchQuery("");
        setCurrentPage(1);
      }}
      className="w-full"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2 p-1 bg-slate-100 rounded-xl">
          <TabsTrigger
            value="legislation"
            className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Landmark className="size-4" /> Kebijakan
          </TabsTrigger>
          <TabsTrigger
            value="proposal"
            className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Construction className="size-4" /> Pembangunan
          </TabsTrigger>
        </TabsList>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <TabsContent value="legislation" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-700">
            Draf Kebijakan Nasional (RUU)
          </h2>
          <Badge>{legResult.totalCount} Item</Badge>
        </div>
        <TrackerTable data={legResult.paginated} />
        <PaginationControls totalPages={legResult.totalPages} />
      </TabsContent>

      <TabsContent value="proposal" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-700">
            Usulan Pembangunan Daerah
          </h2>
          <Badge>{propResult.totalCount} Item</Badge>
        </div>
        <TrackerTable data={propResult.paginated} />
        <PaginationControls totalPages={propResult.totalPages} />
      </TabsContent>
    </Tabs>
  );
}
