"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
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
    PROPOSAL_STATUS.SUBMITTED,
    PROPOSAL_STATUS.UNDER_REVIEW,
    PROPOSAL_STATUS.VOTING_PHASE,
    PROPOSAL_STATUS.BUDGETING,
    PROPOSAL_STATUS.COMPLETED,
  ];

  const KanbanBoard = ({
    data,
    columns,
  }: {
    data: TrackerItem[];
    columns: string[];
  }) => (
    <div className="flex overflow-x-auto pb-6 space-x-4 min-h-[500px]">
      {columns.map((statusKey) => {
        const itemsInColumn = data.filter(
          (item) => item.current_status === statusKey,
        );

        return (
          <div
            key={statusKey}
            className="w-80 flex-shrink-0 flex flex-col bg-muted/30 rounded-xl p-4"
          >
            {/* Header Kolom */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                {STATUS_LABELS[statusKey] || statusKey}
              </h3>
              <Badge variant="secondary">{itemsInColumn.length}</Badge>
            </div>

            {/* Daftar Kartu di Kolom Ini */}
            <div className="space-y-3 flex-grow">
              {itemsInColumn.map((item) => (
                <Card
                  key={item.item_id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base leading-tight">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex flex-col gap-2">
                    {item.location && (
                      <span className="text-xs font-medium text-primary">
                        📍 {item.location}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Ditambahkan:{" "}
                      {format(new Date(item.created_at), "d MMM yyyy", {
                        locale: id,
                      })}
                    </span>
                  </CardContent>
                </Card>
              ))}

              {itemsInColumn.length === 0 && (
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg h-24 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    Tidak ada item
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
    <Tabs defaultValue="legislation" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="legislation">
          Ruang Wacana Nasional (RUU)
        </TabsTrigger>
        <TabsTrigger value="proposal">Ruang Aspirasi Daerah</TabsTrigger>
      </TabsList>

      <TabsContent value="legislation" className="mt-0">
        <KanbanBoard data={legislationData} columns={legislationColumns} />
      </TabsContent>

      <TabsContent value="proposal" className="mt-0">
        <KanbanBoard data={proposalData} columns={proposalColumns} />
      </TabsContent>
    </Tabs>
  );
}
