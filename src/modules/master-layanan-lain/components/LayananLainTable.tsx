import { TableModule } from "../../../ui/components/common/TableModule";
import { Button } from "../../../ui/components/elements/Button";
import { Edit2, Trash2 } from "lucide-react";
import { LayananLainData } from "../types";

interface LayananLainTableProps {
  data: LayananLainData[];
  onEdit: (item: LayananLainData) => void;
  onDelete: (id: string) => void;
}

export function LayananLainTable({ data, onEdit, onDelete }: LayananLainTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      header: "Nama Layanan",
      accessor: (item: LayananLainData) => (
        <span className="font-medium text-gray-900">{item.nama}</span>
      ),
    },
    {
      header: "Keterangan",
      accessor: (item: LayananLainData) => (
        <span className="text-gray-500 text-sm">{item.keterangan}</span>
      ),
    },
    {
      header: "Harga Layanan",
      accessor: (item: LayananLainData) => (
        <span className="font-semibold text-purple-700">{formatCurrency(item.harga)}</span>
      ),
    },
    {
      header: "Aksi",
      className: "w-[100px] text-right",
      accessor: (item: LayananLainData) => (
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
