import { KbMasterData } from "../types";
import { Button } from "../../../ui/components/elements/Button";
import { Pencil, Trash2 } from "lucide-react";
import { TableModule, Column } from "../../../ui/components/common/TableModule";

interface KbTableProps {
  data: KbMasterData[];
  onEdit: (item: KbMasterData) => void;
  onDelete: (id: string) => void;
}

export function KbTable({ data, onEdit, onDelete }: KbTableProps) {
  const columns: Column<KbMasterData>[] = [
    {
      header: 'Nama / Jenis KB',
      accessor: 'name',
      className: 'font-medium text-neutral-900',
    },
    {
      header: 'Tier Kunjungan Ulang',
      accessor: (item) => item.tiers.map((t) => `${t.tier} (${t.durationDays} hari)`).join(", "),
      headerClassName: 'text-center',
      className: 'text-center text-neutral-600',
    },
    {
      header: 'Aksi',
      accessor: (item) => (
        <div className="flex justify-end gap-[0.75rem]">
          <button 
            className="text-neutral-400 hover:text-brand-600 transition-colors" 
            onClick={() => onEdit(item)}
            title="Edit"
          >
            <Pencil className="h-[1.125rem] w-[1.125rem]" />
          </button>
          <button 
            className="text-neutral-400 hover:text-rose-600 transition-colors" 
            onClick={() => onDelete(item.id)}
            title="Hapus"
          >
            <Trash2 className="h-[1.125rem] w-[1.125rem]" />
          </button>
        </div>
      ),
      headerClassName: 'text-right',
      className: 'text-right',
    },
  ];

  return (
    <TableModule
      columns={columns}
      data={data}
      keyExtractor={(item) => item.id}
      emptyMessage="Belum ada data KB."
    />
  );
}
