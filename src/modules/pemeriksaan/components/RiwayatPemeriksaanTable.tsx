import { useState, useMemo } from "react";
import { Eye, Calendar, Filter } from "lucide-react";
import { Badge } from "../../../ui/components/elements/Badge";
import { DUMMY_ANTREAN_PEMERIKSAAN } from "../data/dummy";
import { Button } from "../../../ui/components/elements/Button";
import { Input } from "../../../ui/components/elements/Input";
import { Select } from "../../../ui/components/elements/Select";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { cn } from "../../../logic/utils/cn";
import { AntreanPemeriksaan } from "../types";
import { usePendaftaran } from "../../../logic/hooks/usePendaftaran.js";

interface RiwayatPemeriksaanTableProps {
  onDetail: (patient: AntreanPemeriksaan) => void;
  searchQuery?: string;
}

export function RiwayatPemeriksaanTable({ onDetail, searchQuery = "" }: RiwayatPemeriksaanTableProps) {
  const { items, loading } = usePendaftaran({ search: searchQuery });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLayanan, setSelectedLayanan] = useState("Semua Layanan");

  const selesaiPatients = useMemo(() => {
    return items
      .filter(p => p.status === "Selesai")
      .map(p => ({
        ...p,
        status: p.status as "Menunggu" | "Diperiksa" | "Selesai"
      }));
  }, [items]);

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

  const layananOptions = useMemo(() => {
    const layanans = Array.from(new Set(selesaiPatients.map(item => item.jenisLayanan)));
    return ["Semua Layanan", ...layanans];
  }, [selesaiPatients]);

  const filteredData = useMemo(() => {
    return selesaiPatients.filter(item => {
      const itemDate = new Date(item.waktuRegistrasi);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && itemDate < start) return false;
      if (end) {
        const endDay = new Date(end);
        endDay.setHours(23, 59, 59, 999);
        if (itemDate > endDay) return false;
      }

      if (selectedLayanan !== "Semua Layanan" && item.jenisLayanan !== selectedLayanan) return false;

      return true;
    });
  }, [selesaiPatients, startDate, endDate, selectedLayanan]);

  const columns: Column<AntreanPemeriksaan>[] = [
    {
      header: 'No RM',
      accessor: 'noRm',
      headerClassName: 'text-center',
      className: 'text-center text-gray-600 font-medium',
    },
    {
      header: 'Pasien',
      accessor: (item) => <span className="font-semibold text-gray-900">{item.panggilan} {item.nama}</span>,
      headerClassName: 'text-center',
      className: 'text-center',
    },
    {
      header: 'Jenis Layanan',
      accessor: (item) => {
        return (
          <div className="flex flex-col items-center gap-[0.25rem]">
            <span className={cn(
              "inline-flex items-center justify-center rounded-full px-[0.625rem] py-[0.125rem] text-[0.75rem] font-bold uppercase tracking-tight w-fit mx-auto",
              getLayananBadgeClasses(item.jenisLayanan)
            )}>
              {getLayananText(item.jenisLayanan)}
            </span>
          </div>
        );
      },
      headerClassName: 'text-center',
      className: 'text-center',
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
      header: 'Waktu Periksa',
      accessor: (item) => (
        <div className="flex flex-col items-center">
          <div className="font-semibold text-gray-700 text-[0.875rem]">{formatDateTimeString(item.waktuRegistrasi)}</div>
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
            variant="success"
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
            variant="ghost" 
            size="sm" 
            className="gap-[0.5rem] text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            onClick={() => onDetail(item)}
          >
            <Eye className="h-[1rem] w-[1rem]" />
            Lihat Detail
          </Button>
        </div>
      ),
      headerClassName: 'text-center',
      className: 'text-center',
    },
  ];

  return (
    <div className="space-y-[1rem]">
      <div className="px-[1rem] py-[1rem] bg-gray-50/50 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-[1rem]">
          <div className="flex items-center gap-[0.75rem]">
            <div className="flex items-center gap-[0.5rem]">
              <Calendar className="h-[1rem] w-[1rem] text-gray-400" />
              <span className="text-[0.875rem] font-medium text-gray-600">Periode:</span>
            </div>
            <div className="flex items-center gap-[0.5rem]">
              <Input 
                type="date" 
                className="h-[2.25rem] w-[9.5rem] py-0 text-[0.875rem]" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-gray-400 font-medium">s/d</span>
              <Input 
                type="date" 
                className="h-[2.25rem] w-[9.5rem] py-0 text-[0.875rem]" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="h-[1.5rem] w-[1px] bg-gray-200 hidden md:block" />

          <div className="flex items-center gap-[0.75rem]">
            <div className="flex items-center gap-[0.5rem]">
              <Filter className="h-[1rem] w-[1rem] text-gray-400" />
              <span className="text-[0.875rem] font-medium text-gray-600">Layanan:</span>
            </div>
            <Select 
              className="h-[2.25rem] w-[12.5rem] py-0 text-[0.875rem]"
              value={selectedLayanan}
              onChange={(e) => setSelectedLayanan(e.target.value)}
            >
              {layananOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
          </div>

          {(startDate || endDate || selectedLayanan !== "Semua Layanan") && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-red-600 text-[0.75rem]"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSelectedLayanan("Semua Layanan");
              }}
            >
              Reset Filter
            </Button>
          )}
        </div>
      </div>
      
      <TableModule 
        columns={columns} 
        data={filteredData} 
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
