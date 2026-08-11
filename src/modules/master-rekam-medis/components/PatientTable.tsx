import { Patient } from "../types";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { Edit2, Trash2 } from "lucide-react";

interface PatientTableProps {
  patients: Patient[];
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

export function PatientTable({ patients, onView, onEdit, onDelete }: PatientTableProps) {
  const columns: Column<Patient>[] = [
    { header: "No. RM", accessor: "noRm" },
    { 
      header: "Nama Pasien", 
      accessor: (row) => `${row.panggilan || ""} ${row.nama}`.trim()
    },
    { header: "NIK", accessor: "nik" },
    {
      header: "JK",
      accessor: (row) => row.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
    },
    { header: "No Whatsapp", accessor: (row) => row.noWhatsapp || "-" },
    { header: "Provinsi", accessor: (row) => row.provinsi || "-" },
    { header: "Kabupaten/Kota", accessor: (row) => row.kabupaten || "-" },
    { header: "Kecamatan", accessor: (row) => row.kecamatan || "-" },
    { header: "Puskesmas", accessor: (row) => row.puskesmas || "-" },
    {
      header: "Aksi",
      accessor: (row) => (
        <div className="flex gap-[0.5rem] justify-center" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(row)}
            className="p-[0.25rem] text-amber-600 hover:bg-amber-50 rounded"
            title="Edit Data"
          >
            <Edit2 className="h-[1rem] w-[1rem]" />
          </button>
          <button
            onClick={() => onDelete(row.id)}
            className="p-[0.25rem] text-rose-600 hover:bg-rose-50 rounded"
            title="Hapus"
          >
            <Trash2 className="h-[1rem] w-[1rem]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <TableModule 
      columns={columns} 
      data={patients} 
      keyExtractor={(p) => p.id} 
      onRowClick={onView}
    />
  );
}
