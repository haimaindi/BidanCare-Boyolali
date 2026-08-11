import { TableModule } from "../../../ui/components/common/TableModule";
import { Button } from "../../../ui/components/elements/Button";
import { Edit2, Trash2, Phone, MapPin } from "lucide-react";
import { PuskesmasData } from "../types";

interface PuskesmasTableProps {
  data: PuskesmasData[];
  onEdit: (item: PuskesmasData) => void;
  onDelete: (id: string) => void;
}

export function PuskesmasTable({ data, onEdit, onDelete }: PuskesmasTableProps) {
  const columns = [
    {
      header: "Nama Puskesmas",
      accessor: (item: PuskesmasData) => (
        <span className="font-semibold text-gray-900">{item.nama}</span>
      ),
    },
    {
      header: "Alamat",
      accessor: (item: PuskesmasData) => (
        <div className="flex items-start gap-[0.5rem] max-w-[300px]">
          <MapPin className="h-[1rem] w-[1rem] text-gray-400 mt-[0.2rem] shrink-0" />
          <span className="text-gray-500 text-sm line-clamp-2">{item.alamat}</span>
        </div>
      ),
    },
    {
      header: "No Telepon",
      accessor: (item: PuskesmasData) => (
        <div className="flex items-center gap-[0.5rem]">
          <Phone className="h-[1rem] w-[1rem] text-purple-400 shrink-0" />
          <span className="text-gray-600 font-mono text-sm">{item.noTelepon}</span>
        </div>
      ),
    },
    {
      header: "Aksi",
      className: "w-[100px] text-right",
      accessor: (item: PuskesmasData) => (
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
