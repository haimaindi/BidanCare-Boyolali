import React, { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../ui/components/common/Card";
import { Badge } from "../../../ui/components/elements/Badge";
import { Button } from "../../../ui/components/elements/Button";
import { Modal } from "../../../ui/components/common/Modal";
import { fetchLaporanObatBhp } from "../../../logic/services/laporanService";
import { StokBerjalan, JurnalStok } from "../../obat/data/dummy";
import { StokBerjalanBhp, JurnalBhp } from "../../bhp/data/dummy";
import { Pill, Package, Search, Eye } from "lucide-react";
import { cn } from "../../../logic/utils/cn";
import { tokens } from "../../../ui/styles/tokens";

type ActiveTab = "obat" | "bhp";

export function LaporanObatBhpView() {
  const [dateFilter] = useState({
    startDate: "2026-08-01",
    endDate: "2026-08-31",
  });
  const [dbData, setDbData] = useState<{trend:any[], margin:any[], records:any[]}>({trend:[], margin:[], records:[]});
  useEffect(() => {
    fetchLaporanObatBhp(dateFilter.startDate, dateFilter.endDate).then(setDbData);
  }, [dateFilter]);

  const [activeTab, setActiveTab] = useState<ActiveTab>("obat");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedObatDetail, setSelectedObatDetail] = useState<StokBerjalan | null>(null);
  const [selectedBhpDetail, setSelectedBhpDetail] = useState<StokBerjalanBhp | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTimeString = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
    } catch {
      return dateStr;
    }
  };

  // Filter Obat list
  const filteredObatList = useMemo(() => {
    return (dbData.records.length ? dbData.records.map((r, i) => ({ id: r.id || String(i), sku: r.sku || "SKU", itemName: r.master_obat?.nama || "Obat", category: "Obat", unit: "Pcs", stokAwal: 0, trxMasuk: r.tipe === "Masuk" ? r.jumlah : 0, trxKeluar: r.tipe === "Keluar" ? r.jumlah : 0, sisaQty: r.tipe === "Masuk" ? r.jumlah : -r.jumlah, nilaiAset: 0 })) : []).filter((item) => {
      const query = (searchQuery || "").toLowerCase();
      return (
        (item.sku || "").toLowerCase().includes(query) ||
        (item.namaObat || "").toLowerCase().includes(query) ||
        (item.namaMerk || "").toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Filter BHP list
  const filteredBhpList = useMemo(() => {
    return [].filter((item) => {
      const query = (searchQuery || "").toLowerCase();
      return (
        (item.sku || "").toLowerCase().includes(query) ||
        (item.namaBhp || "").toLowerCase().includes(query) ||
        (item.kategori || "").toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Summary Metrics
  const obatSummary = useMemo(() => {
    const totalJenis = (dbData.records.length ? dbData.records.map((r, i) => ({ id: r.id || String(i), sku: r.sku || "SKU", itemName: r.master_obat?.nama || "Obat", category: "Obat", unit: "Pcs", stokAwal: 0, trxMasuk: r.tipe === "Masuk" ? r.jumlah : 0, trxKeluar: r.tipe === "Keluar" ? r.jumlah : 0, sisaQty: r.tipe === "Masuk" ? r.jumlah : -r.jumlah, nilaiAset: 0 })) : []).length;
    const totalSisaQty = (dbData.records.length ? dbData.records.map((r, i) => ({ id: r.id || String(i), sku: r.sku || "SKU", itemName: r.master_obat?.nama || "Obat", category: "Obat", unit: "Pcs", stokAwal: 0, trxMasuk: r.tipe === "Masuk" ? r.jumlah : 0, trxKeluar: r.tipe === "Keluar" ? r.jumlah : 0, sisaQty: r.tipe === "Masuk" ? r.jumlah : -r.jumlah, nilaiAset: 0 })) : []).reduce((acc, curr) => acc + curr.sisaQty, 0);
    const totalNilaiAset = (dbData.records.length ? dbData.records.map((r, i) => ({ id: r.id || String(i), sku: r.sku || "SKU", itemName: r.master_obat?.nama || "Obat", category: "Obat", unit: "Pcs", stokAwal: 0, trxMasuk: r.tipe === "Masuk" ? r.jumlah : 0, trxKeluar: r.tipe === "Keluar" ? r.jumlah : 0, sisaQty: r.tipe === "Masuk" ? r.jumlah : -r.jumlah, nilaiAset: 0 })) : []).reduce(
      (acc, curr) => acc + curr.sisaQty * curr.hargaBeliTerakhir,
      0
    );
    return { totalJenis, totalSisaQty, totalNilaiAset };
  }, []);

  const bhpSummary = useMemo(() => {
    const totalJenis = [].length;
    const totalSisaQty = [].reduce((acc, curr) => acc + curr.sisaQty, 0);
    const totalNilaiAset = [].reduce(
      (acc, curr) => acc + curr.sisaQty * curr.hargaBeliTerakhir,
      0
    );
    return { totalJenis, totalSisaQty, totalNilaiAset };
  }, []);

  return (
    <div className="space-y-[1.5rem]">
      {/* KPI Cards Grid - 3 Seamless Cards without Icons */}
      <div className="grid grid-cols-1 gap-[1rem] sm:grid-cols-3">
        <Card className="border border-purple-100 bg-purple-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-700">Aset Stok Obat</p>
            <p className="mt-[0.5rem] text-xl font-bold text-gray-900">{formatCurrency(obatSummary.totalNilaiAset)}</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">{obatSummary.totalJenis} Jenis | {obatSummary.totalSisaQty} Qty Sisa</p>
          </CardContent>
        </Card>

        <Card className="border border-blue-100 bg-blue-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Aset Stok BHP</p>
            <p className="mt-[0.5rem] text-xl font-bold text-gray-900">{formatCurrency(bhpSummary.totalNilaiAset)}</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">{bhpSummary.totalJenis} Jenis | {bhpSummary.totalSisaQty} Qty Sisa</p>
          </CardContent>
        </Card>

        <Card className="border border-emerald-100 bg-emerald-50/30">
          <CardContent className="p-[1.25rem]">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Total Jenis Item</p>
            <p className="mt-[0.5rem] text-xl font-bold text-gray-900">{obatSummary.totalJenis + bhpSummary.totalJenis} Item</p>
            <p className="mt-[0.25rem] text-xs text-gray-500">Obat & BHP terdaftar</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Container Card with Sub-Tabs */}
      <Card>
        <CardHeader className="p-[1.5rem] pb-[1rem]">
          <div className="flex flex-col gap-[1rem] sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-[1rem]">
            <div>
              <CardTitle>Mirroring Stok Obat Berjalan & Stok BHP Berjalan</CardTitle>
              <p className="text-xs text-gray-500">
                Laporan inventaris stok berjalan (read-only) untuk pengawasan stok dan margin harga.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center gap-[0.5rem]">
              <div className="relative flex items-center">
                <Search className="absolute left-[0.75rem] h-[1rem] w-[1rem] text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari SKU / nama item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-[2.25rem] rounded-md border border-gray-300 bg-white pl-[2.25rem] pr-[0.75rem] text-xs font-medium text-gray-900 focus:border-purple-700 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-[0.25rem] rounded-md bg-gray-100 p-[0.25rem]">
                <button
                  type="button"
                  onClick={() => setActiveTab("obat")}
                  className={cn(
                    "flex items-center gap-[0.375rem] rounded-md px-[0.75rem] py-[0.375rem] text-xs font-semibold transition-all",
                    activeTab === "obat"
                      ? "bg-purple-700 text-white shadow-xs"
                      : "text-gray-600 hover:bg-white"
                  )}
                >
                  <Pill className="h-[0.875rem] w-[0.875rem]" />
                  Stok Obat
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("bhp")}
                  className={cn(
                    "flex items-center gap-[0.375rem] rounded-md px-[0.75rem] py-[0.375rem] text-xs font-semibold transition-all",
                    activeTab === "bhp"
                      ? "bg-purple-700 text-white shadow-xs"
                      : "text-gray-600 hover:bg-white"
                  )}
                >
                  <Package className="h-[0.875rem] w-[0.875rem]" />
                  Stok BHP
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-[1.5rem] pt-0">
          {activeTab === "obat" ? (
            /* Read-Only Table: Stok Obat Berjalan */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase">SKU</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase">Nama Obat (Merk)</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase text-center">Bentuk Sediaan</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase text-center">Dosis</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase text-center">Sisa Qty</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase text-right">Harga Beli Terakhir</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase text-right">Harga Jual</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase text-right">Margin</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase text-center">Jurnal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredObatList.map((item) => (
                    <tr key={item.sku} className="hover:bg-gray-50 transition-colors">
                      <td className="py-[0.875rem] px-[0.75rem] font-bold text-purple-700">{item.sku}</td>
                      <td className="py-[0.875rem] px-[0.75rem] font-medium text-gray-900">
                        {item.namaObat} <span className="text-gray-500">({item.namaMerk})</span>
                      </td>
                      <td className="py-[0.875rem] px-[0.75rem] text-center">
                        <Badge variant="default" className="text-xs">{item.bentukSediaan}</Badge>
                      </td>
                      <td className="py-[0.875rem] px-[0.75rem] text-center text-gray-600">{item.dosisSediaan}</td>
                      <td className="py-[0.875rem] px-[0.75rem] text-center font-bold text-gray-900">
                        <span className="inline-block rounded-md bg-purple-50 px-[0.625rem] py-[0.125rem] text-purple-700">
                          {item.sisaQty}
                        </span>
                      </td>
                      <td className="py-[0.875rem] px-[0.75rem] text-right text-gray-600">{formatCurrency(item.hargaBeliTerakhir)}</td>
                      <td className="py-[0.875rem] px-[0.75rem] text-right font-semibold text-gray-900">{formatCurrency(item.hargaJual)}</td>
                      <td className="py-[0.875rem] px-[0.75rem] text-right">
                        <span className={item.margin > 0 ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>
                          {formatCurrency(item.margin)}
                        </span>
                      </td>
                      <td className="py-[0.875rem] px-[0.75rem] text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedObatDetail(item)}
                          className="h-[1.75rem] px-[0.5rem] text-xs text-purple-700 gap-[0.25rem]"
                        >
                          <Eye className="h-[0.75rem] w-[0.75rem]" /> Jurnal
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredObatList.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-[2rem] text-center text-gray-400">
                        Tidak ada data stok obat ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Read-Only Table: Stok BHP Berjalan */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase">SKU</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase">Kategori</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase">Nama BHP</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase text-center">Satuan</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase text-center">Sisa Qty</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase text-right">Harga Beli Terakhir</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase text-right">Harga Jual</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase text-right">Margin</th>
                    <th className="py-[0.875rem] px-[0.75rem] font-semibold text-gray-500 uppercase text-center">Jurnal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBhpList.map((item) => (
                    <tr key={item.sku} className="hover:bg-gray-50 transition-colors">
                      <td className="py-[0.875rem] px-[0.75rem] font-bold text-blue-700">{item.sku}</td>
                      <td className="py-[0.875rem] px-[0.75rem]">
                        <Badge variant="info" className="text-xs">{item.kategori}</Badge>
                      </td>
                      <td className="py-[0.875rem] px-[0.75rem] font-medium text-gray-900">{item.namaBhp}</td>
                      <td className="py-[0.875rem] px-[0.75rem] text-center text-gray-600">{item.satuan}</td>
                      <td className="py-[0.875rem] px-[0.75rem] text-center font-bold text-gray-900">
                        <span className="inline-block rounded-md bg-blue-50 px-[0.625rem] py-[0.125rem] text-blue-700">
                          {item.sisaQty}
                        </span>
                      </td>
                      <td className="py-[0.875rem] px-[0.75rem] text-right text-gray-600">{formatCurrency(item.hargaBeliTerakhir)}</td>
                      <td className="py-[0.875rem] px-[0.75rem] text-right font-semibold text-gray-900">{formatCurrency(item.hargaJual)}</td>
                      <td className="py-[0.875rem] px-[0.75rem] text-right">
                        <span className={item.margin > 0 ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>
                          {formatCurrency(item.margin)}
                        </span>
                      </td>
                      <td className="py-[0.875rem] px-[0.75rem] text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBhpDetail(item)}
                          className="h-[1.75rem] px-[0.5rem] text-xs text-blue-700 gap-[0.25rem]"
                        >
                          <Eye className="h-[0.75rem] w-[0.75rem]" /> Jurnal
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredBhpList.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-[2rem] text-center text-gray-400">
                        Tidak ada data stok BHP ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Jurnal Stok Obat Read-Only */}
      <Modal
        isOpen={!!selectedObatDetail}
        onClose={() => setSelectedObatDetail(null)}
        title={`Riwayat Jurnal Stok Obat: ${selectedObatDetail?.namaObat || ""}`}
        className="max-w-2xl"
      >
        <div className="space-y-[1rem]">
          <p className="text-xs text-gray-500">
            SKU: <span className="font-semibold text-gray-900">{selectedObatDetail?.sku}</span> | Merk:{" "}
            <span className="font-semibold text-gray-900">{selectedObatDetail?.namaMerk}</span>
          </p>

          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-[0.625rem] px-[0.75rem] font-semibold text-gray-600">Tanggal</th>
                  <th className="py-[0.625rem] px-[0.75rem] font-semibold text-gray-600">Jenis</th>
                  <th className="py-[0.625rem] px-[0.75rem] font-semibold text-gray-600 text-right">Perubahan Qty</th>
                  <th className="py-[0.625rem] px-[0.75rem] font-semibold text-gray-600 text-right">Sisa Qty</th>
                  <th className="py-[0.625rem] px-[0.75rem] font-semibold text-gray-600">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedObatDetail?.jurnal.map((j) => (
                  <tr key={j.id} className="hover:bg-gray-50">
                    <td className="py-[0.625rem] px-[0.75rem] text-gray-700">{formatDateTimeString(j.tanggal)}</td>
                    <td className="py-[0.625rem] px-[0.75rem]">
                      <Badge
                        variant={
                          j.jenis === "Masuk"
                            ? "success"
                            : j.jenis === "Keluar"
                            ? "danger"
                            : j.jenis === "Terjual"
                            ? "primary"
                            : "warning"
                        }
                        className="text-xs"
                      >
                        {j.jenis}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        "py-[0.625rem] px-[0.75rem] text-right font-bold",
                        j.perubahanQty > 0 ? "text-emerald-600" : "text-rose-600"
                      )}
                    >
                      {j.perubahanQty > 0 ? `+${j.perubahanQty}` : j.perubahanQty}
                    </td>
                    <td className="py-[0.625rem] px-[0.75rem] text-right font-bold text-gray-900">{j.sisaQty}</td>
                    <td className="py-[0.625rem] px-[0.75rem] text-gray-500">{j.keterangan || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-[0.5rem]">
            <Button variant="outline" size="sm" onClick={() => setSelectedObatDetail(null)}>
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Jurnal Stok BHP Read-Only */}
      <Modal
        isOpen={!!selectedBhpDetail}
        onClose={() => setSelectedBhpDetail(null)}
        title={`Riwayat Jurnal Stok BHP: ${selectedBhpDetail?.namaBhp || ""}`}
        className="max-w-2xl"
      >
        <div className="space-y-[1rem]">
          <p className="text-xs text-gray-500">
            SKU: <span className="font-semibold text-gray-900">{selectedBhpDetail?.sku}</span> | Kategori:{" "}
            <span className="font-semibold text-gray-900">{selectedBhpDetail?.kategori}</span>
          </p>

          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-[0.625rem] px-[0.75rem] font-semibold text-gray-600">Tanggal</th>
                  <th className="py-[0.625rem] px-[0.75rem] font-semibold text-gray-600">Jenis</th>
                  <th className="py-[0.625rem] px-[0.75rem] font-semibold text-gray-600 text-right">Perubahan Qty</th>
                  <th className="py-[0.625rem] px-[0.75rem] font-semibold text-gray-600 text-right">Sisa Qty</th>
                  <th className="py-[0.625rem] px-[0.75rem] font-semibold text-gray-600">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedBhpDetail?.jurnal.map((j) => (
                  <tr key={j.id} className="hover:bg-gray-50">
                    <td className="py-[0.625rem] px-[0.75rem] text-gray-700">{formatDateTimeString(j.tanggal)}</td>
                    <td className="py-[0.625rem] px-[0.75rem]">
                      <Badge
                        variant={
                          j.jenis === "Masuk"
                            ? "success"
                            : j.jenis === "Keluar"
                            ? "danger"
                            : j.jenis === "Terjual"
                            ? "primary"
                            : "warning"
                        }
                        className="text-xs"
                      >
                        {j.jenis}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        "py-[0.625rem] px-[0.75rem] text-right font-bold",
                        j.perubahanQty > 0 ? "text-emerald-600" : "text-rose-600"
                      )}
                    >
                      {j.perubahanQty > 0 ? `+${j.perubahanQty}` : j.perubahanQty}
                    </td>
                    <td className="py-[0.625rem] px-[0.75rem] text-right font-bold text-gray-900">{j.sisaQty}</td>
                    <td className="py-[0.625rem] px-[0.75rem] text-gray-500">{j.keterangan || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-[0.5rem]">
            <Button variant="outline" size="sm" onClick={() => setSelectedBhpDetail(null)}>
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
