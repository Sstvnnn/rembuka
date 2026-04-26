"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateStatusAndLog } from "@/app/actions/tracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Settings2, Landmark, Construction } from "lucide-react";
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
                <div className="flex flex-col gap-1">
                  {item.location && (
                    <Badge
                      variant="outline"
                      className="w-fit text-[10px] border-emerald-200 text-emerald-700 bg-emerald-50"
                    >
                      📍 {item.location}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="w-fit text-[10px]">
                    {item.item_type}
                  </Badge>
                </div>
              </td>
              <td className="p-4">
                <span className="font-semibold text-slate-600">
                  {STATUS_LABELS[item.current_status] || item.current_status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
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

  return (
    <Tabs defaultValue="legislation" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 p-1 bg-slate-100 rounded-xl">
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

      <TabsContent value="legislation" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-700">
            Draf Kebijakan Nasional (RUU)
          </h2>
          <Badge>{legislationData.length} Item</Badge>
        </div>
        <TrackerTable data={legislationData} />
      </TabsContent>

      <TabsContent value="proposal" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-700">
            Usulan Pembangunan Daerah
          </h2>
          <Badge>{proposalData.length} Item</Badge>
        </div>
        <TrackerTable data={proposalData} />
      </TabsContent>
    </Tabs>
  );
}
