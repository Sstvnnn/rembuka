"use client";

import { useState, useTransition } from "react";
import { updateStatusAndLog } from "@/app/actions/tracker";
import { Button } from "@/components/ui/button";
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
};

export default function AdminTrackerClient({
  initialData,
}: {
  initialData: TrackerItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = (
    id: string,
    type: "LEGISLATION" | "PROPOSAL",
    oldStatus: string,
    newStatus: string,
  ) => {
    if (oldStatus === newStatus) return;

    setLoadingId(id);
    startTransition(async () => {
      const dummyAdminId = "00000000-0000-0000-0000-000000000000";

      const result = await updateStatusAndLog(
        id,
        type,
        newStatus,
        oldStatus,
        dummyAdminId,
        "Status diubah oleh Admin",
      );

      if (result.error) {
        alert("Gagal merubah status: " + result.error);
      }
      setLoadingId(null);
    });
  };

  const getStatusOptions = (type: "LEGISLATION" | "PROPOSAL") => {
    if (type === "LEGISLATION") return Object.values(LEGISLATION_STATUS);
    return Object.values(PROPOSAL_STATUS);
  };

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted">
          <tr>
            <th className="p-4 font-medium">Judul Proyek / Kebijakan</th>
            <th className="p-4 font-medium">Tipe</th>
            <th className="p-4 font-medium">Status Saat Ini</th>
            <th className="p-4 font-medium">Ubah Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {initialData.map((item) => (
            <tr key={item.item_id} className="hover:bg-muted/50">
              <td className="p-4 font-medium">{item.title}</td>
              <td className="p-4">
                <span className="bg-secondary px-2 py-1 rounded text-xs">
                  {item.item_type}
                </span>
              </td>
              <td className="p-4">
                {STATUS_LABELS[item.current_status] || item.current_status}
              </td>
              <td className="p-4">
                <select
                  className="p-2 border rounded-md bg-background disabled:opacity-50"
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
                  {getStatusOptions(item.item_type).map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                {isPending && loadingId === item.item_id && (
                  <span className="ml-2 text-xs text-muted-foreground animate-pulse">
                    Menyimpan...
                  </span>
                )}
              </td>
            </tr>
          ))}
          {initialData.length === 0 && (
            <tr>
              <td colSpan={4} className="p-8 text-center text-muted-foreground">
                Belum ada data wacana atau usulan di database.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
