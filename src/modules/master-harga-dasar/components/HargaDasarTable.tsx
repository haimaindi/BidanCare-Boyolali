import React from "react";
import { HargaDasar } from "../types";
import { TableModule } from "../../../ui/components/common/TableModule";
import { Button } from "../../../ui/components/elements/Button";
import { Edit2 } from "lucide-react";

interface HargaDasarTableProps {
  data: HargaDasar[];
  onEdit: (item: HargaDasar) => void;
}

export function HargaDasarTable({ data, onEdit }: HargaDasarTableProps) {
  const columns = [
    { header: "ID", accessor: "id" as keyof HargaDasar },
    { header: "Nama Layanan", accessor: "namaLayanan" as keyof HargaDasar },
    { 
      header: "Harga Dasar", 
      accessor: "hargaDasar" as keyof HargaDasar,
      render: (item: HargaDasar) => (
        <span className="font-bold text-gray-900">
          Rp {item.hargaDasar.toLocaleString("id-ID")}
        </span>
      )
    },
    { header: "Update Terakhir", accessor: "lastUpdated" as keyof HargaDasar },
    {
      header: "Aksi",
      accessor: "id" as keyof HargaDasar,
      render: (item: HargaDasar) => (
        <div className="flex items-center gap-[0.5rem]">
          <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <Edit2 className="h-[1rem] w-[1rem]" />
          </Button>
        </div>
      )
    }
  ];

  return <TableModule data={data} columns={columns} keyExtractor={(item) => item.id} />;
}
