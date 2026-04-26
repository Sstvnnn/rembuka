"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Eye,
  MapPin,
  Calendar,
  FileText,
  Landmark,
  Construction,
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

export default function TrackerBoard({
  initialData,
}: {
  initialData: TrackerItem[];
}) {
  const legislationData = initialData.filter(
    (item) => item.item_type === "LEGISLATION",
  );
  const proposalData = initialData.filter(
    (item) => item.item_type === "PROPOSAL",
  );

  const legislationColumns = [
    LEGISLATION_STATUS.DRAFT_UPLOADED,
    LEGISLATION_STATUS.PUBLIC_OPINION,
    LEGISLATION_STATUS.VERIFICATION,
    LEGISLATION_STATUS.REVISED,
  ];

  const proposalColumns = [
    PROPOSAL_STATUS.PENDING,
    PROPOSAL_STATUS.APPROVED,
    PROPOSAL_STATUS.REJECTED,
  ];

  const KanbanBoard = ({
    data,
    columns,
  }: {
    data: TrackerItem[];
    columns: string[];
  }) => (
    // Styling custom scrollbar agar lebih menyatu dengan tema biru
    <div className="flex overflow-x-auto pb-8 pt-4 space-x-6 min-h-[600px] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-blue-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-50">
      {columns.map((statusKey) => {
        const itemsInColumn = data.filter(
          (item) => item.current_status === statusKey,
        );

        return (
          <div
            key={statusKey}
            className="w-80 flex-shrink-0 flex flex-col bg-slate-50/80 border border-blue-100/50 rounded-2xl p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
          >
            {/* Header Kolom */}
            <div className="flex items-center justify-between mb-5 px-1 border-b border-blue-100 pb-3">
              <h3 className="font-bold text-sm text-slate-700 tracking-wide">
                {STATUS_LABELS[statusKey] || statusKey}
              </h3>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none shadow-none font-bold px-2.5">
                {itemsInColumn.length}
              </Badge>
            </div>

            {/* Daftar Kartu */}
            <div className="space-y-4 flex-grow">
              {itemsInColumn.map((item) => (
                <Card
                  key={item.item_id}
                  className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                >
                  <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-sm font-bold text-slate-800 group-hover:text-blue-700 leading-snug line-clamp-2 transition-colors">
                      {item.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-2.5">
                    <div className="flex items-center text-[11px] font-medium text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded-md">
                      <MapPin className="w-3 h-3 mr-1.5 text-blue-500" />
                      {item.location || "Tingkat Nasional"}
                    </div>
                    <div className="flex items-center text-[11px] font-medium text-slate-500">
                      <Calendar className="w-3 h-3 mr-1.5 text-blue-500" />
                      {format(new Date(item.created_at), "d MMMM yyyy", {
                        locale: id,
                      })}
                    </div>
                  </CardContent>

                  <CardFooter className="p-5">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full h-9 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all"
                    >
                      <Link
                        href={
                          item.item_type === "PROPOSAL"
                            ? `/proposals/${item.item_id}`
                            : `/legislation/${item.item_id}`
                        }
                      >
                        <Eye className="w-3.5 h-3.5 mr-2" /> Lihat Detail
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {/* State Kosong */}
              {itemsInColumn.length === 0 && (
                <div className="border-2 border-dashed border-blue-100/70 bg-white/50 rounded-xl h-28 flex flex-col items-center justify-center text-center px-4">
                  <FileText className="w-6 h-6 text-blue-200 mb-2" />
                  <span className="text-[11px] font-medium text-slate-400">
                    Belum ada dokumen
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full max-w-9xl mx-auto">
      <Tabs defaultValue="legislation" className="w-full">
        {/* Desain Tab Pill / Switcher yang Elegan */}
        <div className="flex justify-center mb-10">
          <TabsList className="bg-slate-50 border border-slate-200 p-1.5 rounded-2xl shadow-sm h-auto">
            <TabsTrigger
              value="legislation"
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md transition-all"
            >
              <Landmark className="w-4 h-4 mr-2 opacity-70" />
              RUU & Regulasi
            </TabsTrigger>
            <TabsTrigger
              value="proposal"
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md transition-all"
            >
              <Construction className="w-4 h-4 mr-2 opacity-70" />
              Pembangunan Daerah
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="legislation"
          className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="mb-4 px-2">
            <h2 className="text-lg font-bold text-slate-800">
              Tracker RUU & Regulasi
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pantau perjalanan draf undang-undang dari tahap pengusulan hingga
              pengesahan.
            </p>
          </div>
          <KanbanBoard data={legislationData} columns={legislationColumns} />
        </TabsContent>

        <TabsContent
          value="proposal"
          className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="mb-4 px-2">
            <h2 className="text-lg font-bold text-slate-800">
              Tracker Usulan Daerah
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Lacak progres aspirasi pembangunan di wilayah Anda secara
              transparan.
            </p>
          </div>
          <KanbanBoard data={proposalData} columns={proposalColumns} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
