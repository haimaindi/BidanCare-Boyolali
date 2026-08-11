import { useState } from "react";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { Input } from "../../../ui/components/elements/Input";
import { Button } from "../../../ui/components/elements/Button";
import { Card } from "../../../ui/components/common/Card";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { cn } from "../../../logic/utils/cn";
import { usePendaftaran } from "../../../logic/hooks/usePendaftaran";

export function MenungguCheckInTable() {
  const [search, setSearch] = useState("");
  const { items: checkInItems, changeStatus, loading } = usePendaftaran({
    statusFilter: 'Menunggu Check-In'
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

  const filtered = checkInItems.filter(p => 
    (p.nama?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (p.noRm || "").includes(search) ||
    (p.nik || "").includes(search)
  );

  const handleConfirmCheckIn = async (id: string) => {
    await changeStatus(id, 'Menunggu');
  };

  const handleCancelCheckIn = async (id: string) => {
    await changeStatus(id, 'Batal');
  };

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

  const columns: Column<typeof checkInItems[0]>[] = [
    {
      header: 'No Antrean',
      accessor: (item) => item.noAntrean || item.id,
      className: 'font-bold text-brand-600',
    },
    {
      header: 'No RM',
      accessor: 'noRm',
      className: 'text-neutral-600',
    },
    {
      header: 'Nama Pasien',
      accessor: (item) => `${item.panggilan || ''} ${item.nama}`,
      className: 'font-medium text-neutral-900',
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
        <div className="flex items-center gap-[0.5rem]">
          <Button 
            variant="outline" 
            className="h-[2rem] w-[2rem] p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200" 
            title="Konfirmasi Check-In"
            onClick={() => handleConfirmCheckIn(item.id)}
          >
            <CheckCircle className="h-[1.25rem] w-[1.25rem]" />
          </Button>
          <Button 
            variant="outline" 
            className="h-[2rem] w-[2rem] p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200" 
            title="Batalkan / Pasien Tidak Hadir"
            onClick={() => handleCancelCheckIn(item.id)}
          >
            <XCircle className="h-[1.25rem] w-[1.25rem]" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-[1rem] bg-white p-[1.5rem] sm:flex-row sm:items-center sm:justify-between rounded-xl border border-neutral-100 shadow-sm">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-[0.75rem] top-[50%] h-[1rem] w-[1rem] -translate-y-[50%] text-neutral-400" />
          <Input 
            placeholder="Cari No RM atau Nama Pasien..." 
            className="pl-[2.5rem]" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-neutral-100 shadow-sm">
        {loading && filtered.length === 0 ? (
          <div className="p-[2rem] text-center text-sm text-gray-500">Memuat data check-in...</div>
        ) : (
          <TableModule 
            columns={columns} 
            data={filtered} 
            keyExtractor={(item) => item.id}
            emptyMessage="Tidak ada pasien yang menunggu check-in."
          />
        )}
      </Card>
    </div>
  );
}
