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
  id: string;
  title: string;
  item_type: "LEGISLATION" | "PROPOSAL";
  status: string;
  created_at: string;
  location: string | null;
};

function KanbanBoard({
  data,
  columns,
}: {
  data: TrackerItem[];
  columns: string[];
}) {
  return (
    <div className="flex overflow-x-auto pb-8 pt-4 space-x-6 min-h-[600px] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-blue-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-50">
      {columns.map((statusKey) => {
        const itemsInColumn = data.filter((item) => item.status === statusKey);

        return (
          <div
            key={statusKey}
            className="w-80 flex-shrink-0 flex flex-col bg-slate-50/80 border border-blue-100/50 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-5 px-1 border-b border-blue-100 pb-3">
              <h3 className="font-bold text-sm text-slate-700">
                {STATUS_LABELS[statusKey] || statusKey}
              </h3>
              <Badge className="bg-blue-100 text-blue-700 border-none">
                {itemsInColumn.length}
              </Badge>
            </div>

            <div className="space-y-4 flex-grow">
              {itemsInColumn.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-sm font-bold">
                      {item.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-2">
                    <div className="flex items-center text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {item.location || "Tingkat Nasional"}
                    </div>
                    <div className="flex items-center text-[11px] text-slate-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(item.created_at), "d MMMM yyyy", {
                        locale: id,
                      })}
                    </div>
                  </CardContent>

                  <CardFooter className="p-5">
                    <Button asChild variant="outline" className="w-full">
                      <Link
                        href={
                          item.item_type === "PROPOSAL"
                            ? `/proposals/${item.id}`
                            : `/legal/${item.id}`
                        }
                      >
                        <Eye className="w-3.5 h-3.5 mr-2" /> Lihat Detail
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {itemsInColumn.length === 0 && (
                <div className="border-2 border-dashed rounded-xl h-28 flex items-center justify-center text-slate-400">
                  <FileText className="w-6 h-6 mr-2" />
                  Belum ada dokumen
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
    PROPOSAL_STATUS.PEMERIKSAAN_DATA,
    PROPOSAL_STATUS.PEMILIHAN_PRIORITAS,
    PROPOSAL_STATUS.ALOKASI_DANA,
    PROPOSAL_STATUS.SEDANG_DIBANGUN,
    PROPOSAL_STATUS.PROYEK_SELESAI,
  ];

  return (
    <div className="w-full mx-auto">
      <Tabs defaultValue="legislation">
        <TabsList>
          <TabsTrigger value="legislation">
            <Landmark className="w-4 h-4 mr-2" />
            RUU & Regulasi
          </TabsTrigger>
          <TabsTrigger value="proposal">
            <Construction className="w-4 h-4 mr-2" />
            Pembangunan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="legislation">
          <KanbanBoard data={legislationData} columns={legislationColumns} />
        </TabsContent>

        <TabsContent value="proposal">
          <KanbanBoard data={proposalData} columns={proposalColumns} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
