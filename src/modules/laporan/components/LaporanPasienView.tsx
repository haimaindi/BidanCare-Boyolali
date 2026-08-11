import React, { useState, useMemo, useEffect } from "react";
import { DateRangeFilter } from "../types";
import { DateRangePicker } from "./DateRangePicker";
import { Card, CardHeader, CardTitle, CardContent } from "../../../ui/components/common/Card";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { Badge } from "../../../ui/components/elements/Badge";
import { useNavigation } from "../../../logic/context/NavigationContext";
import { fetchLaporanPasien } from "../../../logic/services/laporanService";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { Users, UserPlus, Calendar, MapPin, Search, ArrowRight } from "lucide-react";
import { cn } from "../../../logic/utils/cn";
import { tokens } from "../../../ui/styles/tokens";

type RegionLevel = "puskesmas" | "provinsi" | "kabupaten" | "kecamatan" | "kelurahan";

export function LaporanPasienView() {

  const { jumpToPemeriksaan } = useNavigation();

  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({
    startDate: "2026-08-01",
    endDate: "2026-08-10",
  });

  const [dbData, setDbData] = useState<{trend:any[], demografi:any[], poli:any[], records:any[]}>({trend:[], demografi:[], poli:[], records:[]});
  useEffect(() => {
    fetchLaporanPasien(dateFilter.startDate, dateFilter.endDate).then(setDbData);
  }, [dateFilter]);


  const [selectedRegionLevel, setSelectedRegionLevel] = useState<RegionLevel>("puskesmas");
  const [layananFilter, setLayananFilter] = useState<string>("SEMUA");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Filter visit trends by date range
  const filteredVisitTrend = useMemo(() => {
    return (dbData.trend.length ? dbData.trend.map(t => ({ tanggal: t.date, totalPasien: t.umum + t.bpjs, pasienUmum: t.umum, pasienBpjs: t.bpjs })) : []).filter((item) => {
      return item.tanggal >= dateFilter.startDate && item.tanggal <= dateFilter.endDate;
    });
  }, [dateFilter]);

  // Aggregate KPI summary
  const summaryKpi = useMemo(() => {
    const totalKunjungan = filteredVisitTrend.reduce((acc, curr) => acc + curr.totalKunjungan, 0);
    const totalLayananUmum = filteredVisitTrend.reduce((acc, curr) => acc + curr.poliUmum, 0);
    const totalMomCare = filteredVisitTrend.reduce((acc, curr) => acc + Math.round(curr.kia * 0.4), 0);
    const totalKehamilanPersalinan = filteredVisitTrend.reduce((acc, curr) => acc + Math.round(curr.kia * 0.6), 0);
    const totalLayananKb = filteredVisitTrend.reduce((acc, curr) => acc + curr.kb, 0);
    const totalLayananImunisasi = filteredVisitTrend.reduce((acc, curr) => acc + curr.imunisasi, 0);
    return {
      totalKunjungan,
      totalLayananUmum,
      totalMomCare,
      totalKehamilanPersalinan,
      totalLayananKb,
      totalLayananImunisasi,
    };
  }, [filteredVisitTrend]);

  // Filter visits list
  const filteredVisits = useMemo(() => {
    return (dbData.records.length ? dbData.records.map(r => ({ id: r.id, visitDate: new Date(r.created_at).toISOString().split('T')[0], patientName: r.nama, noRm: r.no_rm, gender: r.jenis_kelamin, age: r.usia, address: r.alamat, paymentType: r.penjamin, diagnosis: "Umum", status: r.status })) : []).filter((item) => {
      const dateOnly = (item.waktuKunjungan || "").split(" ")[0];
      const dateMatch = dateOnly >= dateFilter.startDate && dateOnly <= dateFilter.endDate;
      const q = (searchQuery || "").toLowerCase();
      const searchMatch =
        (item.namaPasien || "").toLowerCase().includes(q) ||
        (item.noRm || "").toLowerCase().includes(q) ||
        (item.diagnosa || "").toLowerCase().includes(q);
      const layananMatch =
        layananFilter === "SEMUA" || (item.layanan || "").toLowerCase().includes((layananFilter || "").toLowerCase());
      return dateMatch && searchMatch && layananMatch;
    });
  }, [dateFilter, searchQuery, layananFilter]);

  const handleRowClick = (record: any) => {
    // Scroll to top of window so page starts at the top
    window.scrollTo({ top: 0, behavior: "instant" });

    // Jump to examination / pemeriksaan page
    jumpToPemeriksaan(
      {
        id: record.id,
        noRm: record.noRm,
        panggilan: record.panggilan,
        nama: record.namaPasien,
        nik: record.nik,
        jenisKelamin: record.jenisKelamin,
        tanggalLahir: record.tanggalLahir,
        waktuKunjungan: record.waktuKunjungan,
        waktuRegistrasi: record.waktuKunjungan,
        layanan: record.layanan,
        jenisLayanan: record.layanan,
        keluhan: record.keluhan,
        diagnosa: record.diagnosa,
        petugas: record.petugas,
        status: record.status || "Selesai",
      },
      true, // Read-only mode for history review
      "laporan-pasien"
    );
  };

  const getLayananBadgeClasses = (layanan?: string) => {
    const l = (layanan || "").toLowerCase();
    if (l.includes("kia") || l.includes("antenatal")) return "bg-pink-100 text-pink-700";
    if (l.includes("umum")) return "bg-blue-100 text-blue-700";
    if (l.includes("kb")) return "bg-emerald-100 text-emerald-700";
    if (l.includes("imunisasi")) return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-700";
  };

  const columns: Column<any>[] = [
    {
      header: "NO RM",
      accessor: (row) => <span className="font-semibold text-purple-700">{row.noRm}</span>,
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      header: "NAMA PASIEN",
      accessor: (row) => (
        <span className="font-medium text-gray-900">
          {row.panggilan} {row.namaPasien}
        </span>
      ),
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      header: "WAKTU KUNJUNGAN",
      accessor: (row) => <span className="text-gray-600">{row.waktuKunjungan}</span>,
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      header: "JENIS LAYANAN",
      accessor: (row) => (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full px-[0.75rem] py-[0.125rem] text-xs font-bold uppercase",
            getLayananBadgeClasses(row.layanan)
          )}
        >
          {row.layanan}
        </span>
      ),
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      header: "DIAGNOSA / KET",
      accessor: (row) => <span className="text-gray-700">{row.diagnosa}</span>,
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      header: "PETUGAS",
      accessor: (row) => <span className="text-gray-600">{row.petugas}</span>,
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      header: "AKSI",
      accessor: () => (
        <span className="inline-flex items-center gap-[0.25rem] text-xs font-semibold text-purple-700 hover:underline">
          Buka Pemeriksaan <ArrowRight className="h-[0.875rem] w-[0.875rem]" />
        </span>
      ),
      headerClassName: "text-center",
      className: "text-center",
    },
  ];

  return (
    <div className="space-y-[1.5rem]">
      {/* Date Range Picker Filter */}
      <DateRangePicker filter={dateFilter} onChange={setDateFilter} />

      {/* KPI Cards Grid - 2 Rows (3 columns) with left border accent and no icons */}
      <div className="grid grid-cols-1 gap-[1rem] sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-purple-600 border-purple-100 bg-purple-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Total Kunjungan</p>
            <p className="mt-[0.5rem] text-2xl font-bold text-gray-900">{summaryKpi.totalKunjungan}</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">Pasien berkunjung</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 border-blue-100 bg-blue-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Layanan Umum</p>
            <p className="mt-[0.5rem] text-xl font-bold text-gray-900">{summaryKpi.totalLayananUmum}</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">Kunjungan umum</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 border-rose-100 bg-rose-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Layanan Mom & Care</p>
            <p className="mt-[0.5rem] text-xl font-bold text-gray-900">{summaryKpi.totalMomCare}</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">Ibu & bayi baru lahir</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500 border-pink-100 bg-pink-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold text-pink-700 uppercase tracking-wider">Layanan Kehamilan & Persalinan</p>
            <p className="mt-[0.5rem] text-xl font-bold text-gray-900">{summaryKpi.totalKehamilanPersalinan}</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">ANC, PNC & persalinan</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 border-emerald-100 bg-emerald-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Layanan KB</p>
            <p className="mt-[0.5rem] text-xl font-bold text-gray-900">{summaryKpi.totalLayananKb}</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">Keluarga berencana</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 border-amber-100 bg-amber-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Layanan Imunisasi</p>
            <p className="mt-[0.5rem] text-xl font-bold text-gray-900">{summaryKpi.totalLayananImunisasi}</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">Kunjungan imunisasi</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart 1: Multiple Line Chart - Naik Turun Total Kunjungan & Per Layanan */}
      <Card>
        <CardHeader className="p-[1.5rem] pb-0">
          <CardTitle>Fluktuasi Kunjungan Pasien (Total & Per Layanan)</CardTitle>
          <p className="text-xs text-gray-500">
            Trend gabungan total kunjungan harian dan rincian kunjungan per jenis layanan.
          </p>
        </CardHeader>
        <CardContent className="p-[1.5rem] pt-[1rem]">
          <div className="h-[22rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredVisitTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="tanggal" tickFormatter={formatDate} tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip 
                  labelFormatter={(label) => `Tanggal: ${formatDate(String(label))}`}
                />
                <Legend wrapperStyle={{ paddingTop: "1rem", fontSize: "12px" }} />
                <Line type="monotone" dataKey="totalKunjungan" name="Total Kunjungan" stroke="#7e22ce" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="poliUmum" name="Poli Umum" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="kia" name="Poli KIA" stroke="#ec4899" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="kb" name="Pelayanan KB" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="imunisasi" name="Imunisasi" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Fluktuasi Pasien Baru Mingguan */}
      <Card>
        <CardHeader className="p-[1.5rem] pb-0">
          <CardTitle>Fluktuasi Pasien Baru & Pasien Lama Mingguan</CardTitle>
          <p className="text-xs text-gray-500">Perkembangan registrasi pasien baru dibanding kunjungan pasien lama per minggu.</p>
        </CardHeader>
        <CardContent className="p-[1.5rem] pt-[1rem]">
          <div className="h-[18rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(dbData.trend.length ? dbData.trend.map(t => ({ tanggal: t.date, pasienBaru: t.baru, pasienLama: (t.umum + t.bpjs) - t.baru })) : [])} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="minggu" tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: "1rem", fontSize: "12px" }} />
                <Bar dataKey="pasienBaru" name="Pasien Baru" fill="#7e22ce" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pasienLama" name="Pasien Lama" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 3: Bar Chart Rekam Medis Berdasarkan Level Wilayah / Demografi */}
      <Card>
        <CardHeader className="p-[1.5rem] pb-0">
          <div className="flex flex-col gap-[0.75rem] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Distribusi Pasien Berdasarkan Wilayah</CardTitle>
              <p className="text-xs text-gray-500">Jumlah rekam medis pasien terdaftar berdasarkan tingkat wilayah administrasi.</p>
            </div>

            {/* Level Selector Buttons */}
            <div className="flex flex-wrap items-center gap-[0.25rem] rounded-md bg-gray-100 p-[0.25rem]">
              {[
                { id: "puskesmas", label: "Puskesmas" },
                { id: "provinsi", label: "Provinsi" },
                { id: "kabupaten", label: "Kab/Kota" },
                { id: "kecamatan", label: "Kecamatan" },
                { id: "kelurahan", label: "Kelurahan" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSelectedRegionLevel(lvl.id as RegionLevel)}
                  className={cn(
                    "rounded-md px-[0.625rem] py-[0.25rem] text-xs font-medium transition-all",
                    selectedRegionLevel === lvl.id
                      ? "bg-purple-700 text-white shadow-xs"
                      : "text-gray-700 hover:bg-white"
                  )}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-[1.5rem] pt-[1rem]">
          <div className="h-[20rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={(dbData.poli)} 
                layout="vertical"
                margin={{ top: 10, right: 30, left: 60, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "#374151" }} width={120} />
                <Tooltip />
                <Bar dataKey="jumlahPasien" name="Jumlah Pasien" fill="#7e22ce" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section 4: Donut Gender & Bar Jenis Panggilan */}
      <div className="grid grid-cols-1 gap-[1.5rem] lg:grid-cols-2">
        {/* Donut Chart: Jenis Kelamin */}
        <Card>
          <CardHeader className="p-[1.5rem] pb-0">
            <CardTitle>Distribusi Pasien Berdasarkan Jenis Kelamin</CardTitle>
            <p className="text-xs text-gray-500">Proporsi pasien Perempuan (P) dan Laki-laki (L).</p>
          </CardHeader>
          <CardContent className="p-[1.5rem] pt-[1rem] flex flex-col items-center">
            <div className="h-[18rem] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dbData.demografi}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {dbData.demografi.map((entry, index) => (
                      <Cell key={`gender-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart: Jenis Panggilan */}
        <Card>
          <CardHeader className="p-[1.5rem] pb-0">
            <CardTitle>Distribusi Pasien Berdasarkan Jenis Panggilan</CardTitle>
            <p className="text-xs text-gray-500">Rincian sapaan pasien (Ny., Tn., An., Sdr., Ny. Hamil).</p>
          </CardHeader>
          <CardContent className="p-[1.5rem] pt-[1rem]">
            <div className="h-[18rem] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{name:"Ny.", value:100}]} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="panggilan" tick={{ fontSize: 12, fill: "#374151" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip />
                  <Bar dataKey="jumlah" name="Jumlah Pasien" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section: Data Kunjungan Total (Clickable row to open Examination) */}
      <Card>
        <CardHeader className="p-[1.5rem] pb-[1rem]">
          <div className="flex flex-col gap-[1rem] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Data Kunjungan Total Pasien</CardTitle>
              <p className="text-xs text-gray-500">
                Daftar seluruh riwayat kunjungan. Klik pada baris untuk membuka halaman pemeriksaan.
              </p>
            </div>

            {/* Table Filters */}
            <div className="flex flex-wrap items-center gap-[0.75rem]">
              <div className="relative flex items-center">
                <Search className="absolute left-[0.75rem] h-[1rem] w-[1rem] text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari no RM / pasien..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-[2.25rem] rounded-md border border-gray-300 bg-white pl-[2.25rem] pr-[0.75rem] text-xs font-medium text-gray-900 focus:border-purple-700 focus:outline-hidden"
                />
              </div>

              <select
                value={layananFilter}
                onChange={(e) => setLayananFilter(e.target.value)}
                className="h-[2.25rem] rounded-md border border-gray-300 bg-white px-[0.75rem] text-xs font-medium text-gray-900 focus:border-purple-700 focus:outline-hidden"
              >
                <option value="SEMUA">Semua Layanan</option>
                <option value="Poli Umum">Poli Umum</option>
                <option value="KIA">KIA</option>
                <option value="KB">Pelayanan KB</option>
                <option value="Imunisasi">Imunisasi</option>
                <option value="Layanan Lain">Layanan Lain</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-[1.5rem] pt-0">
          <TableModule
            data={filteredVisits}
            columns={columns}
            keyExtractor={(item) => item.id}
            onRowClick={handleRowClick}
            emptyMessage="Tidak ada data kunjungan pasien pada periode ini"
          />
        </CardContent>
      </Card>
    </div>
  );
}
