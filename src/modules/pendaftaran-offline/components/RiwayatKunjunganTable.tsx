import { useState, useEffect } from "react";
import { Search, Eye, Download, Calendar } from "lucide-react";
import { Input } from "../../../ui/components/elements/Input";
import { Card } from "../../../ui/components/common/Card";
import { cn } from "../../../logic/utils/cn";
import { Button } from "../../../ui/components/elements/Button";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { usePendaftaran } from "../../../logic/hooks/usePendaftaran";

export function RiwayatKunjunganTable() {
  const [search, setSearch] = useState("");
  const [quick, setQuick] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { items: allItems, loading } = usePendaftaran({ statusFilter: 'All' });

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

  useEffect(() => {
    if (!quick) return;

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const toDateString = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    let start = new Date(now);
    let end = new Date(now);

    if (quick === "today") {
      // already today
    } else if (quick === "yesterday") {
      start.setDate(start.getDate() - 1);
      end = new Date(start);
    } else if (quick === "7days") {
      start.setDate(start.getDate() - 7);
    } else if (quick === "30days") {
      start.setDate(start.getDate() - 30);
    }

    setStartDate(toDateString(start));
    setEndDate(toDateString(end));
  }, [quick]);

  const historyData = allItems;

  const filtered = historyData.filter(p => {
    const matchSearch = (p.nama?.toLowerCase() || "").includes(search.toLowerCase()) || (p.noRm?.toLowerCase() || "").includes(search.toLowerCase());
    
    let matchDate = true;
    if (startDate && endDate) {
      const pDate = new Date(p.waktuRegistrasi || p.createdAt || '');
      const sDate = new Date(startDate);
      sDate.setHours(0, 0, 0, 0);
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      
      if (!isNaN(pDate.getTime())) {
        matchDate = pDate >= sDate && pDate <= eDate;
      }
    }
    
    return matchSearch && matchDate;
  });

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

  const columns: Column<typeof historyData[0]>[] = [
    {
      header: 'Waktu Check In',
      accessor: (item) => (
        <div className="flex flex-col gap-[0.125rem] items-center">
          <div className="flex items-center gap-[0.375rem] font-semibold text-neutral-900 text-[0.875rem]">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>{formatDateTimeString(item.waktuRegistrasi || item.createdAt)}</span>
          </div>
          <span className="text-[0.75rem] text-neutral-500 font-medium">
            {item.noAntrean || item.id}
          </span>
        </div>
      ),
      className: 'py-4',
    },
    {
      header: 'No RM',
      accessor: 'noRm',
      className: 'text-neutral-600 font-medium',
    },
    {
      header: 'Nama Pasien',
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
      header: 'Aksi',
      accessor: () => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} className="text-neutral-400 hover:text-brand-600" />
          <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />} className="text-neutral-400 hover:text-brand-600" />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-[1rem] bg-white p-[1.5rem] rounded-xl border border-neutral-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-[1rem]">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-[0.75rem] top-[50%] h-[1rem] w-[1rem] -translate-y-[50%] text-neutral-400" />
            <Input 
              id="search-patient"
              placeholder="Cari No RM atau Nama Pasien..." 
              className="pl-[2.5rem]" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-[0.75rem]">
            <div className="flex items-center rounded-lg border border-neutral-100 bg-neutral-50/50 p-[0.25rem]">
              <button 
                className={cn(
                  "px-[0.75rem] py-[0.25rem] text-[0.8125rem] font-medium rounded-md transition-all whitespace-nowrap",
                  quick === 'today' ? 'bg-white text-brand-600 shadow-sm border border-neutral-100' : 'text-neutral-500 hover:text-neutral-900'
                )}
                onClick={() => setQuick('today')}
              >
                Hari ini
              </button>
              <button 
                className={cn(
                  "px-[0.75rem] py-[0.25rem] text-[0.8125rem] font-medium rounded-md transition-all whitespace-nowrap",
                  quick === 'yesterday' ? 'bg-white text-brand-600 shadow-sm border border-neutral-100' : 'text-neutral-500 hover:text-neutral-900'
                )}
                onClick={() => setQuick('yesterday')}
              >
                Kemarin
              </button>
              <button 
                className={cn(
                  "px-[0.75rem] py-[0.25rem] text-[0.8125rem] font-medium rounded-md transition-all whitespace-nowrap",
                  quick === '7days' ? 'bg-white text-brand-600 shadow-sm border border-neutral-100' : 'text-neutral-500 hover:text-neutral-900'
                )}
                onClick={() => setQuick('7days')}
              >
                7 Hari
              </button>
              <button 
                className={cn(
                  "px-[0.75rem] py-[0.25rem] text-[0.8125rem] font-medium rounded-md transition-all whitespace-nowrap",
                  quick === '30days' ? 'bg-white text-brand-600 shadow-sm border border-neutral-100' : 'text-neutral-500 hover:text-neutral-900'
                )}
                onClick={() => setQuick('30days')}
              >
                1 Bulan
              </button>
            </div>
            <div className="flex items-center gap-[0.5rem]">
              <Input id="start-date" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setQuick(''); }} className="w-auto text-[0.8125rem]" />
              <span className="text-neutral-400 text-xs font-medium uppercase">s/d</span>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setQuick(''); }} className="w-auto text-[0.8125rem]" />
            </div>
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-neutral-100 shadow-sm">
        {loading && filtered.length === 0 ? (
          <div className="p-[2rem] text-center text-sm text-gray-500">Memuat riwayat kunjungan...</div>
        ) : (
          <TableModule 
            columns={columns} 
            data={filtered} 
            keyExtractor={(item) => item.id}
            emptyMessage="Tidak ada riwayat kunjungan pada rentang tanggal ini."
          />
        )}
      </Card>
    </div>
  );
}
