import { useState, useEffect } from "react";
import { Patient, VisitLog } from "../types";
import { Button } from "../../../ui/components/elements/Button";
import { ArrowLeft, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { Card } from "../../../ui/components/common/Card";
import { Badge } from "../../../ui/components/elements/Badge";
import { cn } from "../../../logic/utils/cn";

interface PatientVisitLogsViewProps {
  patient: Patient;
  logs: VisitLog[];
  onBack: () => void;
  onViewLog?: (log: VisitLog) => void;
}

export function PatientVisitLogsView({ patient, logs, onBack, onViewLog }: PatientVisitLogsViewProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    setCurrentPage(1);
  }, [logs.length]);

  const totalPages = Math.ceil(logs.length / PAGE_SIZE) || 1;
  const paginatedLogs = logs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "-";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    if (age <= 0) {
      const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
      return `${months} bln`;
    }
    
    return `${age} th`;
  };

  const formatTanggal = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatDateTimeOnly = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
    } catch {
      return dateStr;
    }
  };

  const getLayananBadgeClasses = (layanan: string) => {
    const l = layanan.toLowerCase();
    if (l.includes("antenatal")) return "bg-pink-100 text-pink-700";
    if (l.includes("post natal") || l.includes("postnatal")) return "bg-purple-100 text-purple-700";
    if (l.includes("umum")) return "bg-blue-100 text-blue-700";
    if (l.includes("kb")) return "bg-emerald-100 text-emerald-700";
    if (l.includes("imunisasi")) return "bg-amber-100 text-amber-700";
    if (l.includes("persalinan")) return "bg-rose-100 text-rose-700";
    return "bg-gray-100 text-gray-700";
  };

  const columns: Column<VisitLog>[] = [
    { 
      header: "JENIS LAYANAN", 
      accessor: (row) => (
        <div className="flex flex-col items-center gap-[0.25rem]">
          <span className={cn(
            "inline-flex items-center justify-center rounded-full px-[0.8rem] py-[0.15rem] text-[0.75rem] font-bold uppercase tracking-tight",
            getLayananBadgeClasses(row.layanan)
          )}>
            {row.layanan}
          </span>
          {row.layanan.toLowerCase().includes("antenatal") && (
            <span className="text-[0.6rem] font-bold text-neutral-400 bg-neutral-50 px-1.5 border rounded">USG 2D</span>
          )}
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    },
    { 
      header: "PASIEN", 
      accessor: () => (
        <div className="text-center font-semibold text-neutral-800">
          {patient.panggilan} {patient.nama}
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    },
    { 
      header: "NO RM", 
      accessor: () => (
        <div className="text-center font-medium text-neutral-600">
          {patient.noRm}
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    },
    { 
      header: "JENIS KELAMIN", 
      accessor: () => (
        <div className="text-center text-neutral-700">
          {patient.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    },
    { 
      header: "TGL LAHIR / USIA", 
      accessor: () => (
        <div className="flex flex-col items-center">
          <div className="font-semibold text-neutral-700">{formatTanggal(patient.tanggalLahir)}</div>
          <div className="text-[0.7rem] text-neutral-400 font-medium">{calculateAge(patient.tanggalLahir)}</div>
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    },
    { 
      header: "WAKTU KUNJUNGAN", 
      accessor: (row) => (
        <div className="flex flex-col items-center">
          <div className="font-semibold text-neutral-700">{formatDateTimeOnly(row.tanggalKunjungan)}</div>
          <div className="mt-1">
            <span className="text-[0.65rem] font-bold uppercase px-2 py-0.5 bg-neutral-50 text-neutral-500 border border-neutral-100 rounded">OFFLINE</span>
          </div>
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    },
    { 
      header: "STATUS", 
      accessor: () => (
        <div className="flex justify-center">
          <Badge className="font-bold uppercase text-[0.65rem] px-3" variant="success">
            SELESAI
          </Badge>
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    }
  ];

  return (
    <div className="space-y-[1.5rem] animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-[1rem]">
        <Button variant="ghost" onClick={onBack} className="p-2 h-auto">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Riwayat Kunjungan Rekam Medis</h1>
          <p className="text-sm text-gray-500">Pasien: <span className="font-semibold text-purple-700">{patient.panggilan} {patient.nama}</span> ({patient.noRm})</p>
        </div>
      </div>

      <Card className="border-none shadow-none overflow-hidden space-y-[1rem]">
        {logs.length > 0 ? (
          <>
            <TableModule 
              data={paginatedLogs}
              columns={columns}
              keyExtractor={(l) => l.id}
              onRowClick={onViewLog}
            />
            <div className="flex items-center justify-between border-t border-gray-100 pt-[1rem] text-sm text-gray-600 px-[1rem]">
              <div>
                Menampilkan {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, logs.length)} dari {logs.length} data
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-[5rem] text-gray-400">
            <FileText className="h-[4rem] w-[4rem] mb-[1rem] opacity-20" />
            <p className="text-lg">Belum ada riwayat kunjungan medis untuk pasien ini.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
