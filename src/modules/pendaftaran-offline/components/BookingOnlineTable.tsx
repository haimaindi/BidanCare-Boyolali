import { useState } from "react";
import { Search, CheckCircle } from "lucide-react";
import { Input } from "../../../ui/components/elements/Input";
import { Button } from "../../../ui/components/elements/Button";
import { Card } from "../../../ui/components/common/Card";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { cn } from "../../../logic/utils/cn";
import { usePendaftaran } from "../../../logic/hooks/usePendaftaran";

interface BookingOnlineTableProps {
  onProcess: (item?: any) => void;
}

export function BookingOnlineTable({ onProcess }: BookingOnlineTableProps) {
  const [search, setSearch] = useState("");
  const { items: onlineItems, loading } = usePendaftaran({
    sumberFilter: 'Online',
    statusFilter: 'All'
  });

  const formatDateTimeString = (dateStr?: string) => {
    if (!dateStr) return '-';
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

  const filtered = onlineItems.filter(p => 
    (p.nama?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (p.nik || "").includes(search) ||
    (p.noAntrean?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const getLayananBadgeClasses = (layanan: string) => {
    const l = (layanan || '').toLowerCase();
    if (l.includes("antenatal")) return "bg-pink-100 text-pink-700";
    if (l.includes("post natal") || l.includes("postnatal")) return "bg-purple-100 text-purple-700";
    if (l.includes("umum")) return "bg-blue-100 text-blue-700";
    if (l.includes("kb")) return "bg-emerald-100 text-emerald-700";
    if (l.includes("imunisasi")) return "bg-amber-100 text-amber-700";
    if (l.includes("persalinan")) return "bg-rose-100 text-rose-700";
    return "bg-gray-100 text-gray-700";
  };

  const getLayananText = (layanan: string) => {
    const l = (layanan || '').toLowerCase();
    if (l.includes("antenatal")) return "AnteNatal";
    if (l.includes("post natal") || l.includes("postnatal")) return "Post Natal";
    return layanan;
  };

  const getLayananSubText = (layanan: string) => {
    if (layanan && layanan.includes("-")) {
      return layanan.split("-")[1].trim();
    }
    return null;
  };

  const columns: Column<typeof onlineItems[0]>[] = [
    {
      header: 'ID Booking',
      accessor: (item) => item.noAntrean || item.id,
      className: 'font-medium text-neutral-900',
    },
    {
      header: 'NIK',
      accessor: 'nik',
      className: 'text-neutral-600 font-medium',
    },
    {
      header: 'Nama / Panggilan',
      accessor: (item) => `${item.panggilan || ''} ${item.nama}`,
      className: 'font-semibold text-neutral-900',
    },
    {
      header: 'Jenis Layanan',
      accessor: (item) => {
        const subText = getLayananSubText(item.jenisLayanan);
        return (
          <div className="flex flex-col gap-[0.25rem] items-center">
            <span className={cn(
              "inline-flex items-center justify-center rounded-full px-[0.625rem] py-[0.125rem] text-[0.75rem] font-bold uppercase tracking-tight w-fit",
              getLayananBadgeClasses(item.jenisLayanan)
            )}>
              {getLayananText(item.jenisLayanan)}
            </span>
            {subText && (
              <span className="text-[0.625rem] font-bold text-neutral-500 bg-neutral-50 px-[0.375rem] py-[0.0625rem] border border-neutral-100 rounded uppercase w-fit">
                {subText}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Estimasi Waktu',
      accessor: (item) => (
        <span className="font-semibold text-neutral-700">
          {formatDateTimeString(item.waktuRegistrasi || item.createdAt)}
        </span>
      ),
    },
    {
      header: 'Aksi',
      accessor: (item) => (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-[2.25rem] w-[2.25rem] p-0" 
          title="Verifikasi & Proses"
          onClick={() => onProcess(item)}
        >
          <CheckCircle className="h-[1.25rem] w-[1.25rem]" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-[1rem] bg-white p-[1.5rem] sm:flex-row sm:items-center sm:justify-between rounded-xl border border-neutral-100 shadow-sm">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-[0.75rem] top-[50%] h-[1rem] w-[1rem] -translate-y-[50%] text-neutral-400" />
          <Input 
            placeholder="Cari NIK atau Nama Pasien..." 
            className="pl-[2.5rem]" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-neutral-100 shadow-sm">
        {loading && filtered.length === 0 ? (
          <div className="p-[2rem] text-center text-sm text-gray-500">Memuat data booking online...</div>
        ) : (
          <TableModule 
            columns={columns} 
            data={filtered} 
            keyExtractor={(item) => item.id}
            emptyMessage="Tidak ada data booking online."
          />
        )}
      </Card>
    </div>
  );
}
