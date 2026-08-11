import { TableModule } from "../../../ui/components/common/TableModule";
import { Button } from "../../../ui/components/elements/Button";
import { Edit2, Trash2 } from "lucide-react";
import { ImunisasiData } from "../types";
import { tokens } from "../../../ui/styles/tokens";

interface ImunisasiTableProps {
  data: ImunisasiData[];
  onEdit: (item: ImunisasiData) => void;
  onDelete: (id: string) => void;
}

export function ImunisasiTable({ data, onEdit, onDelete }: ImunisasiTableProps) {
  const columns = [
    {
      header: "Nama Imunisasi",
      accessor: (item: ImunisasiData) => (
        <span className="font-medium text-gray-900">{item.nama}</span>
      ),
    },
    {
      header: "Keterangan",
      accessor: (item: ImunisasiData) => (
        <span className="text-gray-500">{item.keterangan || "-"}</span>
      ),
    },
    {
      header: "Aksi",
      className: "w-[100px] text-right",
      accessor: (item: ImunisasiData) => (
        <div className="flex justify-end gap-[0.5rem]">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(item)}
            title="Edit"
          >
            <Edit2 className="h-[1rem] w-[1rem]" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(item.id)}
            title="Hapus"
          >
            <Trash2 className="h-[1rem] w-[1rem]" />
          </Button>
        </div>
      ),
    },
  ];

  return <TableModule data={data} columns={columns} keyExtractor={(item) => item.id} />;
}
