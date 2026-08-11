import { useState, useEffect } from "react";
import { Patient } from "../types";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../ui/components/elements/Button";

interface PatientTableProps {
  patients: Patient[];
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

export function PatientTable({ patients, onView, onEdit, onDelete }: PatientTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    setCurrentPage(1);
  }, [patients.length]);

  const totalPages = Math.ceil(patients.length / PAGE_SIZE) || 1;
  const paginatedPatients = patients.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
    <div className="space-y-[1rem]">
      <TableModule 
        columns={columns} 
        data={paginatedPatients} 
        keyExtractor={(p) => p.id} 
        onRowClick={onView}
      />

      {patients.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-[1rem] text-sm text-gray-600">
          <div>
            Menampilkan {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, patients.length)} dari {patients.length} data
          </div>
          <div className="flex items-center gap-[0.5rem]">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-[0.375rem]"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="h-[1.25rem] w-[1.25rem]" />
            </Button>
            <span className="font-medium px-[0.5rem]">Halaman {currentPage} dari {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-[0.375rem]"
              title="Halaman Selanjutnya"
            >
              <ChevronRight className="h-[1.25rem] w-[1.25rem]" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
