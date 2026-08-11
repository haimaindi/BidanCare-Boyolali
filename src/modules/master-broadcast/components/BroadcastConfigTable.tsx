import { BroadcastConfig } from "../types";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { Input } from "../../../ui/components/elements/Input";
import { tokens } from "../../../ui/styles/tokens";
import { MessageSquare } from "lucide-react";
import { Button } from "../../../ui/components/elements/Button";

interface BroadcastConfigTableProps {
  data: BroadcastConfig[];
  onUpdate: (id: string, field: "followUpDays" | "reminderDays", value: number | null) => void;
  onEditTemplate: (id: string, type: "Follow Up" | "Reminder") => void;
}

export function BroadcastConfigTable({ data, onUpdate, onEditTemplate }: BroadcastConfigTableProps) {
  const columns: Column<BroadcastConfig>[] = [
    { 
      header: "Jenis Layanan Kunjungan", 
      accessor: "category",
      className: "font-bold text-gray-800"
    },
    {
      header: "Broadcast Follow Up (Hari Setelah)",
      accessor: (item) => (
        <div className="flex items-center gap-[0.75rem] justify-center">
          <Input
            id={`fu-${item.id}`}
            type="number"
            className="w-[4rem] text-center"
            value={item.followUpDays ?? ""}
            onChange={(e) => onUpdate(item.id, "followUpDays", e.target.value ? parseInt(e.target.value) : null)}
          />
          <span className="text-xs text-gray-500 italic">hari setelah kunjungan</span>
          <Button
            variant="outline"
            size="sm"
            className="p-[0.35rem] h-auto text-blue-600 border-blue-200 bg-blue-50/50"
            onClick={() => onEditTemplate(item.id, "Follow Up")}
            title="Edit Template Follow Up"
          >
            <MessageSquare className="h-[1rem] w-[1rem]" />
          </Button>
        </div>
      ),
    },
    {
      header: "Broadcast Reminder (Hari Sebelum)",
      accessor: (item) => (
        <div className="flex items-center gap-[0.75rem] justify-center">
          {item.reminderDays !== null ? (
            <>
              <Input
                id={`rem-${item.id}`}
                type="number"
                className="w-[4rem] text-center"
                value={item.reminderDays}
                onChange={(e) => onUpdate(item.id, "reminderDays", e.target.value ? parseInt(e.target.value) : null)}
              />
              <span className="text-xs text-gray-500 italic">hari sebelum tgl kembali</span>
              <Button
                variant="outline"
                size="sm"
                className="p-[0.35rem] h-auto text-amber-600 border-amber-200 bg-amber-50/50"
                onClick={() => onEditTemplate(item.id, "Reminder")}
                title="Edit Template Reminder"
              >
                <MessageSquare className="h-[1rem] w-[1rem]" />
              </Button>
            </>
          ) : (
            <span className="text-gray-400 italic text-sm">Tidak perlu</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-[1rem]">
      <div className="flex items-center justify-between">
        <h3 className={tokens.typography.h3}>Pengaturan Jarak Broadcast</h3>
      </div>
      <TableModule
        columns={columns}
        data={data}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
