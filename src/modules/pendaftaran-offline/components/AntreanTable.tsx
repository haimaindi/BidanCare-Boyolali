import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "../../../ui/components/elements/Badge";
import Swal from "sweetalert2";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { cn } from "../../../logic/utils/cn";
import { usePendaftaran } from "../../../logic/hooks/usePendaftaran";

interface AntreanTableProps {
  onEdit?: (item: any) => void;
}

export function AntreanTable({ onEdit }: AntreanTableProps) {
  const { items: antreanList, changeStatus, loading } = usePendaftaran({ statusFilter: 'All' });
  let activeQueue = 1;

  const handleDelete = (id: string, nama: string) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Data antrean pasien ${nama} akan dibatalkan/dihapus secara permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48", // rose-600
      cancelButtonColor: "#6b7280", // gray-500
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        await changeStatus(id, 'Batal');
        Swal.fire({
          title: "Terhapus!",
          text: "Data antrean telah berhasil dibatalkan.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

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

  const activeAntrean = antreanList.filter(item => item.status !== 'Batal' && item.status !== 'Selesai');

  const columns: Column<typeof activeAntrean[0]>[] = [
    {
      header: 'No Antrian',
      accessor: (item, index) => {
        const currentQueueNumber = index !== undefined ? index + 1 : "-";
        return (
          <div className="flex flex-col items-center">
            <div className="text-base font-bold text-brand-600">{currentQueueNumber}</div>
            <div className="text-[0.65rem] text-neutral-400 font-medium">{item.noAntrean}</div>
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
              <span className="text-[0.625rem] font-bold text-neutral-500 bg-neutral-50 px-[0.375rem] py-[0.0625rem] border border-neutral-100 rounded uppercase w-fit mx-auto">
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
      accessor: (item) => <span className="font-semibold text-neutral-900">{item.panggilan} {item.nama}</span>,
      headerClassName: 'text-center',
      className: 'text-center',
    },
    {
      header: 'No RM',
      accessor: 'noRm',
      headerClassName: 'text-center',
      className: 'text-center text-neutral-600 font-medium',
    },
    {
      header: 'Jenis Kelamin',
      accessor: (item) => item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
      headerClassName: 'text-center',
      className: 'text-center text-neutral-600 font-medium',
    },
    {
      header: 'Tgl Lahir / Usia',
      accessor: (item) => (
        <div className="flex flex-col items-center">
          <div className="font-medium text-neutral-700">{formatDateString(item.tanggalLahir)}</div>
          <div className="text-[0.65rem] text-neutral-400 font-medium">{item.usia}</div>
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    },
    {
      header: 'Waktu Check In',
      accessor: (item) => (
        <div className="flex flex-col items-center">
          <div className="font-semibold text-neutral-700 text-[0.875rem]">{formatDateTimeString(item.waktuRegistrasi)}</div>
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
        <div className="flex items-center justify-center gap-[0.75rem]">
          <button 
            className="text-neutral-400 hover:text-brand-600 transition-all hover:scale-110" 
            title="Edit"
            onClick={() => onEdit?.(item)}
          >
            <Pencil className="h-[1.125rem] w-[1.125rem]" />
          </button>
          <button 
            className="text-neutral-400 hover:text-rose-600 transition-all hover:scale-110" 
            title="Hapus"
            onClick={() => handleDelete(item.id, item.nama)}
          >
            <Trash2 className="h-[1.125rem] w-[1.125rem]" />
          </button>
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    },
  ];

  if (loading && activeAntrean.length === 0) {
    return <div className="p-[2rem] text-center text-sm text-gray-500">Memuat data antrean...</div>;
  }

  return (
    <TableModule 
      columns={columns} 
      data={activeAntrean} 
      keyExtractor={(item) => item.id}
      emptyMessage="Belum ada data antrean pasien."
    />
  );
}
