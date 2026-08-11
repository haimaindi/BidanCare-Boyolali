import React from "react";
import { LoketObatEntry } from "../types";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { Badge } from "../../../ui/components/elements/Badge";
import { Button } from "../../../ui/components/elements/Button";
import { Eye, CheckCircle, PackageOpen, Plus, Edit } from "lucide-react";
import { tokens } from "../../../ui/styles/tokens";
import { formatDate } from "../../../logic/utils/dateFormatter";

interface PrescriptionTableProps {
  data: LoketObatEntry[];
  onDetail: (entry: LoketObatEntry) => void;
  onPrepare: (id: string) => void;
  onFinish: (id: string) => void;
  onAdd: () => void;
}

export function PrescriptionTable({ data, onDetail, onPrepare, onFinish, onAdd }: PrescriptionTableProps) {
  const columns: Column<LoketObatEntry>[] = [
    {
      header: "Waktu Pesan",
      accessor: (item: LoketObatEntry) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{formatDate(item.waktuPesan)}</span>
        </div>
      ),
    },
    {
      header: "Pasien",
      accessor: (item: LoketObatEntry) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 uppercase tracking-tight">{item.namaPasien}</span>
          <div className="flex items-center gap-[0.5rem] mt-[0.125rem]">
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-[0.375rem] py-[0.125rem] rounded">
              {item.noRm}
            </span>
            <span className="text-[0.625rem] font-bold text-gray-400 uppercase">
              {item.jenisKelamin} • {item.usia}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Sumber",
      accessor: (item: LoketObatEntry) => (
        <Badge 
          variant={item.sumber === "Pemeriksaan" ? "info" : "warning"}
          className="font-bold uppercase tracking-widest text-[0.625rem]"
        >
          {item.sumber}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: (item: LoketObatEntry) => {
        const variants: Record<string, "info" | "warning" | "success"> = {
          "Menunggu": "warning",
          "Disiapkan": "info",
          "Selesai": "success",
        };
        return (
          <Badge variant={variants[item.status]} className="font-bold uppercase tracking-widest text-[0.625rem]">
            {item.status}
          </Badge>
        );
      },
    },
    {
      header: "Aksi",
      className: "w-[15rem]",
      accessor: (item: LoketObatEntry) => (
        <div className="flex items-center gap-[0.5rem] justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDetail(item)}
            title="Lihat Detail & Edit"
            className="h-[2rem] w-[2rem] p-0"
          >
            <Edit className="h-[1rem] w-[1rem] text-gray-500" />
          </Button>
          
          {item.status === "Menunggu" && (
            <Button
              size="sm"
              onClick={() => onPrepare(item.id)}
              className="gap-[0.375rem] h-[2rem] px-[0.75rem] text-[0.625rem] font-bold uppercase tracking-wider"
            >
              <PackageOpen className="h-[0.875rem] w-[0.875rem]" />
              Siapkan
            </Button>
          )}
          
          {item.status === "Disiapkan" && (
            <Button
              size="sm"
              onClick={() => onFinish(item.id)}
              className="gap-[0.375rem] h-[2rem] px-[0.75rem] text-[0.625rem] font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="h-[0.875rem] w-[0.875rem]" />
              Selesai
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-[1rem]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={tokens.typography.h3}>Daftar Pesanan Obat</h3>
          <p className="text-xs text-gray-500 font-medium">Kelola persiapan dan penyerahan obat pasien</p>
        </div>
        <Button onClick={onAdd} className="gap-[0.5rem] font-bold uppercase tracking-wider text-[0.75rem]">
          <Plus className="h-[1rem] w-[1rem]" />
          Input Baru
        </Button>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <TableModule
          data={data}
          columns={columns as any}
          keyExtractor={(item) => item.id}
        />
      </div>
    </div>
  );
}
