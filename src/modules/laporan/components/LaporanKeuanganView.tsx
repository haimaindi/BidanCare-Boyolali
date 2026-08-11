import React, { useState, useMemo, useEffect } from "react";
import { DateRangeFilter } from "../types";
import { DateRangePicker } from "./DateRangePicker";
import { Card, CardHeader, CardTitle, CardContent } from "../../../ui/components/common/Card";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { Badge } from "../../../ui/components/elements/Badge";
import { Input } from "../../../ui/components/elements/Input";
import { Select } from "../../../ui/components/elements/Select";
import { fetchLaporanKeuangan } from "../../../logic/services/laporanService";
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
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Search, Filter } from "lucide-react";
import { cn } from "../../../logic/utils/cn";
import { tokens } from "../../../ui/styles/tokens";

export function LaporanKeuanganView() {

  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({
    startDate: "2026-08-01",
    endDate: "2026-08-10",
  });

  const [dbData, setDbData] = useState<{trend:any[], piutang:any[], paymentTypes:any[], paymentStatus:any[], records:any[]}>({trend:[], piutang:[], paymentTypes:[], paymentStatus:[], records:[]});
  useEffect(() => {
    fetchLaporanKeuangan(dateFilter.startDate, dateFilter.endDate).then(setDbData);
  }, [dateFilter]);


  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("SEMUA");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  // Filter financial trends based on date range
  const filteredFinancialTrend = useMemo(() => {
    return (dbData.trend.length ? dbData.trend.map(t => ({ tanggal: t.date, totalPendapatan: t.pendapatan, pendapatanLayanan: t.pendapatan * 0.4, pendapatanObat: t.pendapatan * 0.4, pendapatanBhp: t.pendapatan * 0.1, pendapatanLayananLain: t.pendapatan * 0.1 })) : []).filter((item) => {
      return item.tanggal >= dateFilter.startDate && item.tanggal <= dateFilter.endDate;
    });
  }, [dateFilter]);

  // Filter piutang trends
  const filteredPiutangTrend = useMemo(() => {
    return (dbData.piutang.length ? dbData.piutang.map(t => ({ tanggal: t.date, totalPiutang: t.piutangBaru, pelunasanPiutang: 0, piutangBaru: t.piutangBaru })) : []).filter((item) => {
      return item.tanggal >= dateFilter.startDate && item.tanggal <= dateFilter.endDate;
    });
  }, [dateFilter]);

  // Total summary calculations
  const totalFinancials = useMemo(() => {
    const totalPendapatan = filteredFinancialTrend.reduce((acc, curr) => acc + curr.totalPendapatan, 0);
    const pendapatanLayanan = filteredFinancialTrend.reduce((acc, curr) => acc + curr.pendapatanLayanan, 0);
    const pendapatanObat = filteredFinancialTrend.reduce((acc, curr) => acc + curr.pendapatanObat, 0);
    const pendapatanBhp = filteredFinancialTrend.reduce((acc, curr) => acc + curr.pendapatanBhp, 0);
    const pendapatanLayananLain = filteredFinancialTrend.reduce((acc, curr) => acc + curr.pendapatanLayananLain, 0);
    const totalPiutang = filteredPiutangTrend.reduce((acc, curr) => acc + curr.totalPiutang, 0);
    return {
      totalPendapatan,
      pendapatanLayanan,
      pendapatanObat,
      pendapatanBhp,
      pendapatanLayananLain,
      totalPiutang,
    };
  }, [filteredFinancialTrend, filteredPiutangTrend]);

  // Filter billings table
  const filteredBillings = useMemo(() => {
    return (dbData.records.length ? dbData.records.map(r => ({ id: r.id, patientName: r.patient_name || '', paymentDate: new Date(r.created_at).toISOString().split('T')[0], totalAmount: r.total_tagihan, paymentMethod: r.metode_pembayaran || 'Cash', status: r.status, serviceType: r.jenis_layanan || 'Umum', examinationId: r.pemeriksaan_id })) : []).filter((item) => {
      const dateMatch = item.paymentDate >= dateFilter.startDate && item.paymentDate <= dateFilter.endDate;
      const q = (searchQuery || "").toLowerCase();
      const searchMatch =
        (item.patientName || "").toLowerCase().includes(q) ||
        (item.id || "").toLowerCase().includes(q) ||
        (item.serviceType || "").toLowerCase().includes(q);
      const statusMatch = statusFilter === "SEMUA" || item.status === statusFilter;
      return dateMatch && searchMatch && statusMatch;
    });
  }, [dateFilter, searchQuery, statusFilter]);

  // Table columns definition
  const columns: Column<any>[] = [
    {
      header: "NO TAGIHAN",
      accessor: (row) => <span className="font-semibold text-purple-700">{row.id}</span>,
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      header: "TANGGAL",
      accessor: (row) => <span className="text-gray-600">{formatDate(row.paymentDate)}</span>,
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      header: "PASIEN",
      accessor: (row) => <span className="font-medium text-gray-900">{row.patientName}</span>,
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      header: "LAYANAN",
      accessor: (row) => (
        <Badge variant="info" className="text-xs">
          {row.serviceType}
        </Badge>
      ),
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      header: "TOTAL TAGIHAN",
      accessor: (row) => <span className="font-semibold text-gray-900">{formatCurrency(row.totalBill)}</span>,
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      header: "DIBAYAR",
      accessor: (row) => <span className="font-semibold text-emerald-600">{formatCurrency(row.paidAmount)}</span>,
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      header: "METODE PEMBAYARAN",
      accessor: (row) => (
        <span className="rounded-full bg-gray-100 px-[0.625rem] py-[0.125rem] text-xs font-semibold text-gray-700">
          {row.paymentType}
        </span>
      ),
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      header: "STATUS",
      accessor: (row) => (
        <Badge variant={row.status === "Lunas" ? "success" : "danger"} className="text-xs uppercase">
          {row.status}
        </Badge>
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
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Total Pendapatan</p>
            <p className="mt-[0.5rem] text-xl font-bold text-gray-900">{formatCurrency(totalFinancials.totalPendapatan)}</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">Periode terpilih</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 border-blue-100 bg-blue-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Pendapatan Layanan Dasar</p>
            <p className="mt-[0.5rem] text-lg font-bold text-gray-900">{formatCurrency(totalFinancials.pendapatanLayanan)}</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">Jasa medis & konsultasi</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-600 border-indigo-100 bg-indigo-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Pendapatan Layanan Lain</p>
            <p className="mt-[0.5rem] text-lg font-bold text-gray-900">{formatCurrency(totalFinancials.pendapatanLayananLain)}</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">Layanan non-medis & pendukung</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600 border-emerald-100 bg-emerald-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Pendapatan Obat</p>
            <p className="mt-[0.5rem] text-lg font-bold text-gray-900">{formatCurrency(totalFinancials.pendapatanObat)}</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">Penjualan resep obat</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600 border-amber-100 bg-amber-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pendapatan BHP</p>
            <p className="mt-[0.5rem] text-lg font-bold text-gray-900">{formatCurrency(totalFinancials.pendapatanBhp)}</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">Bahan habis pakai</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-600 border-rose-100 bg-rose-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Total Piutang</p>
            <p className="mt-[0.5rem] text-lg font-bold text-rose-700">{formatCurrency(totalFinancials.totalPiutang)}</p>
            <p className="mt-[0.25rem] text-xs text-rose-500">Tagihan belum lunas</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section 1: Multiple Line Chart (Pendapatan Tren) */}
      <Card>
        <CardHeader className="p-[1.5rem] pb-0">
          <CardTitle>Trend Pendapatan Harian & Kategori</CardTitle>
          <p className="text-xs text-gray-500">
            Perbandingan total pendapatan harian, pendapatan layanan, obat, BHP, dan layanan lainnya.
          </p>
        </CardHeader>
        <CardContent className="p-[1.5rem] pt-[1rem]">
          <div className="h-[22rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredFinancialTrend} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="tanggal" tickFormatter={formatDate} tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#6b7280" }} 
                  tickFormatter={(val) => `Rp ${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), ""]}
                  labelFormatter={(label) => `Tanggal: ${formatDate(String(label))}`}
                />
                <Legend wrapperStyle={{ paddingTop: "1rem", fontSize: "12px" }} />
                <Line type="monotone" dataKey="totalPendapatan" name="Total Pendapatan" stroke="#7e22ce" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="pendapatanLayanan" name="Pendapatan Layanan" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pendapatanObat" name="Pendapatan Obat" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pendapatanBhp" name="Pendapatan BHP" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pendapatanLayananLain" name="Layanan Lain" stroke="#ec4899" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section 2: Piutang & Cicilan Chart */}
      <Card>
        <CardHeader className="p-[1.5rem] pb-0">
          <CardTitle>Chart Piutang & Cicilan Pembayaran</CardTitle>
          <p className="text-xs text-gray-500">
            Perbandingan saldo piutang berjalan dan realisasi cicilan pembayaran pasien.
          </p>
        </CardHeader>
        <CardContent className="p-[1.5rem] pt-[1rem]">
          <div className="h-[18rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredPiutangTrend} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="tanggal" tickFormatter={formatDate} tick={{ fontSize: 12, fill: "#6b7280" }} />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#6b7280" }} 
                  tickFormatter={(val) => `Rp ${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), ""]}
                  labelFormatter={(label) => `Tanggal: ${formatDate(String(label))}`}
                />
                <Legend wrapperStyle={{ paddingTop: "1rem", fontSize: "12px" }} />
                <Bar dataKey="totalPiutang" name="Saldo Piutang" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cicilanDibayar" name="Cicilan Dibayar" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section 3: Donut Charts (Jenis Pembayaran & Status Tagihan) */}
      <div className="grid grid-cols-1 gap-[1.5rem] lg:grid-cols-2">
        {/* Donut Chart 1: Jenis Pembayaran */}
        <Card>
          <CardHeader className="p-[1.5rem] pb-0">
            <CardTitle>Pembayaran Berdasarkan Jenis Pembayaran</CardTitle>
            <p className="text-xs text-gray-500">Persentase metode pembayaran yang digunakan pasien.</p>
          </CardHeader>
          <CardContent className="p-[1.5rem] pt-[1rem] flex flex-col items-center">
            <div className="h-[18rem] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dbData.paymentTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {dbData.paymentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatCurrency(Number(value) || 0), "Total"]} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart 2: Status Pelunasan Tagihan */}
        <Card>
          <CardHeader className="p-[1.5rem] pb-0">
            <CardTitle>Status Tagihan & Pembayaran</CardTitle>
            <p className="text-xs text-gray-500">Perbandingan transaksi yang Langsung Lunas vs Tidak Lunas (Piutang).</p>
          </CardHeader>
          <CardContent className="p-[1.5rem] pt-[1rem] flex flex-col items-center">
            <div className="h-[18rem] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dbData.paymentStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {dbData.paymentStatus.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value}%`, "Proporsi"]} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section: Daftar Data Tagihan & Pembayaran */}
      <Card>
        <CardHeader className="p-[1.5rem] pb-[1rem]">
          <div className="flex flex-col gap-[1rem] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Daftar Data Tagihan & Pembayaran</CardTitle>
              <p className="text-xs text-gray-500">
                Rincian transaksi tagihan pembayaran pasien pada periode terpilih.
              </p>
            </div>

            {/* Table Filters */}
            <div className="flex flex-wrap items-center gap-[0.75rem]">
              <div className="relative flex items-center">
                <Search className="absolute left-[0.75rem] h-[1rem] w-[1rem] text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pasien / no tagihan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-[2.25rem] rounded-md border border-gray-300 bg-white pl-[2.25rem] pr-[0.75rem] text-xs font-medium text-gray-900 focus:border-purple-700 focus:outline-hidden"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-[2.25rem] rounded-md border border-gray-300 bg-white px-[0.75rem] text-xs font-medium text-gray-900 focus:border-purple-700 focus:outline-hidden"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="Lunas">Lunas</option>
                <option value="Belum Lunas">Belum Lunas</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-[1.5rem] pt-0">
          <TableModule
            data={filteredBillings}
            columns={columns}
            keyExtractor={(item) => item.id}
            emptyMessage="Tidak ada data tagihan pada periode ini"
          />
        </CardContent>
      </Card>
    </div>
  );
}
