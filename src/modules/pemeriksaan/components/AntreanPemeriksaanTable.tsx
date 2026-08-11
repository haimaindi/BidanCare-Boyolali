import { Pencil, Trash2, ClipboardCheck } from "lucide-react";
import { Badge } from "../../../ui/components/elements/Badge";
import { DUMMY_ANTREAN_PEMERIKSAAN } from "../data/dummy";
import { Button } from "../../../ui/components/elements/Button";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { cn } from "../../../logic/utils/cn";
import { AntreanPemeriksaan } from "../types";
import { usePendaftaran } from "../../../logic/hooks/usePendaftaran.js";
import Swal from "sweetalert2";

interface AntreanPemeriksaanTableProps {
  onPanggil: (patient: AntreanPemeriksaan) => void;
  searchQuery?: string;
}

export function AntreanPemeriksaanTable({ onPanggil, searchQuery = "" }: AntreanPemeriksaanTableProps) {
  const { items, loading, removeRegistration } = usePendaftaran({ search: searchQuery });
  let activeQueue = 1;

  const activePatients = items
    .filter(p => p.status === "Menunggu" || p.status === "Diperiksa")
    .map(p => ({
      ...p,
      status: p.status as "Menunggu" | "Diperiksa" | "Selesai"
    }));

  const formatDateString = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } catch {
      return dateStr;
    }
  };

  const formatDateTimeString = (dateStr: string) => {
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

  const getLayananText = (layanan: string) => {
    const l = layanan.toLowerCase();
    if (l.includes("antenatal")) return "AnteNatal";
    if (l.includes("post natal") || l.includes("postnatal")) return "Post Natal";
    return layanan;
  };

  const getLayananSubText = (layanan: string) => {
    if (layanan.includes("-")) {
      return layanan.split("-")[1].trim();
    }
    return null;
  };

  const columns: Column<AntreanPemeriksaan>[] = [
    {
      header: 'No Antrian',
      accessor: (item) => {
        const currentQueueNumber = item.status !== "Selesai" ? activeQueue++ : "-";
        return (
          <div className="flex flex-col items-center">
            <div className="text-[1rem] font-bold text-purple-700">{currentQueueNumber}</div>
            <div className="text-[0.75rem] text-gray-500">{item.noAntrean}</div>
          </div>
        );
      },
      headerClassName: 'text-center',
      className: 'text-center',
    },
    {
      header: 'Jenis Layanan',
      accessor: (item) => {
        const subText = getLayananSubText(item.jenisLayanan);
        return (
          <div className="flex flex-col items-center gap-[0.25rem]">
            <span className={cn(
              "inline-flex items-center justify-center rounded-full px-[0.625rem] py-[0.125rem] text-[0.75rem] font-bold uppercase tracking-tight w-fit mx-auto",
              getLayananBadgeClasses(item.jenisLayanan)
            )}>
              {getLayananText(item.jenisLayanan)}
            </span>
            {subText && (
              <span className="text-[0.625rem] font-bold text-gray-500 bg-gray-50 px-[0.375rem] py-[0.0625rem] border border-gray-100 rounded uppercase w-fit mx-auto">
                {subText}
              </span>
            )}
          </div>
        );
      },
      headerClassName: 'text-center',
      className: 'text-center',
    },
    {
      header: 'Pasien',
      accessor: (item) => <span className="font-semibold text-gray-900">{item.panggilan} {item.nama}</span>,
      headerClassName: 'text-center',
      className: 'text-center',
    },
    {
      header: 'No RM',
      accessor: 'noRm',
      headerClassName: 'text-center',
      className: 'text-center text-gray-600 font-medium',
    },
    {
      header: 'Jenis Kelamin',
      accessor: (item) => item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
      headerClassName: 'text-center',
      className: 'text-center text-gray-600 font-medium',
    },
    {
      header: 'Tgl Lahir / Usia',
      accessor: (item) => (
        <div className="flex flex-col items-center">
          <div className="font-medium text-gray-700">{formatDateString(item.tanggalLahir)}</div>
          <div className="text-[0.65rem] text-gray-400 font-medium">{item.usia}</div>
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    },
    {
      header: 'Waktu Check In',
      accessor: (item) => (
        <div className="flex flex-col items-center">
          <div className="font-semibold text-gray-700 text-[0.875rem]">{formatDateTimeString(item.waktuRegistrasi)}</div>
          <div className="mt-[0.25rem]">
            <Badge variant={item.sumberPendaftaran === "Online" ? "success" : "default"} className="text-[0.65rem] px-[0.375rem] py-[0.125rem] font-bold uppercase">
              {item.sumberPendaftaran}
            </Badge>
          </div>
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    },
    {
      header: 'Status',
      accessor: (item) => (
        <div className="flex justify-center">
          <Badge
            className="font-bold uppercase text-[0.65rem]"
            variant={
              item.status === "Diperiksa"
                ? "warning"
                : item.status === "Selesai"
                ? "success"
                : "default"
            }
          >
            {item.status}
          </Badge>
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    },
    {
      header: 'Aksi',
      accessor: (item) => (
        <div className="flex items-center justify-center gap-[0.5rem]">
          <Button 
            variant="primary" 
            size="sm" 
            className="gap-[0.5rem]"
            onClick={() => onPanggil(item)}
          >
            <ClipboardCheck className="h-[1rem] w-[1rem]" />
            Periksa
          </Button>
          <button className="text-gray-400 hover:text-purple-600 transition-colors" title="Edit">
            <Pencil className="h-[1.125rem] w-[1.125rem]" />
          </button>
          <button 
            className="text-gray-400 hover:text-rose-600 transition-colors" 
            title="Hapus"
            onClick={() => {
              Swal.fire({
                title: "Hapus Kunjungan?",
                text: "Data kunjungan dan seluruh data pemeriksaan yang berkaitan dengan ID kunjungan ini akan dihapus permanen!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Ya, Hapus",
                cancelButtonText: "Batal",
                confirmButtonColor: "#ef4444"
              }).then(async (result) => {
                if (result.isConfirmed) {
                  try {
                    await removeRegistration(item.id);
                    Swal.fire("Berhasil!", "Kunjungan dan data pemeriksaan berhasil dihapus.", "success");
                  } catch (err: any) {
                    Swal.fire("Error", err.message || "Gagal menghapus kunjungan", "error");
                  }
                }
              });
            }}
          >
            <Trash2 className="h-[1.125rem] w-[1.125rem]" />
          </button>
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    },
  ];

  return (
    <TableModule 
      columns={columns} 
      data={activePatients} 
      keyExtractor={(item) => item.id}
    />
  );
}
