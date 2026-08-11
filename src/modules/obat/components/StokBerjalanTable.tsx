import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../ui/components/common/Card";
import { StokBerjalan } from "../data/dummy";
import { Badge } from "../../../ui/components/elements/Badge";
import { Input } from "../../../ui/components/elements/Input";
import { ArrowLeft, Check, X, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../ui/components/elements/Button";
import { PopUpModal } from "../../../ui/components/common/PopUpModal";
import { cn } from "../../../logic/utils/cn";
import { tokens } from "../../../ui/styles/tokens";
import { fetchObatJurnalBySku } from "../../../logic/services/manajemenObatService.js";

interface StokBerjalanTableProps {
  data: StokBerjalan[];
  setData: React.Dispatch<React.SetStateAction<StokBerjalan[]>>;
  onDelete?: (sku: string) => Promise<void> | void;
}

export function StokBerjalanTable({ data, setData, onDelete }: StokBerjalanTableProps) {
  const [activeSkuDetail, setActiveSkuDetail] = useState<string | null>(null);
  const [jurnalPage, setJurnalPage] = useState<number>(1);
  const [tablePage, setTablePage] = useState<number>(1);
  const [drafts, setDrafts] = useState<{ [sku: string]: { sisaQty?: number; hargaJual?: number } }>({});
  const [deleteTarget, setDeleteTarget] = useState<StokBerjalan | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [jurnalData, setJurnalData] = useState<{ items: any[]; totalCount: number }>({ items: [], totalCount: 0 });

  const JURNAL_PAGE_SIZE = 20;
  const TABLE_PAGE_SIZE = 50;

  useEffect(() => {
    if (!activeSkuDetail) return;
    let isMounted = true;
    fetchObatJurnalBySku(activeSkuDetail, jurnalPage, JURNAL_PAGE_SIZE).then((res) => {
      if (isMounted) {
        setJurnalData(res);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activeSkuDetail, jurnalPage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
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

  const handleDraftChange = (sku: string, field: 'sisaQty' | 'hargaJual', value: string) => {
    const rawValue = value.replace(/\./g, "").replace(/\D/g, "");
    const numValue = parseInt(rawValue) || 0;
    setDrafts(prev => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        [field]: numValue
      }
    }));
  };

  const handleCancelUpdate = (sku: string) => {
    setDrafts(prev => {
      const updated = { ...prev };
      delete updated[sku];
      return updated;
    });
  };

  const handleConfirmUpdate = (sku: string) => {
    const draft = drafts[sku];
    if (!draft) return;

    setData(prev => prev.map(item => {
      if (item.sku === sku) {
        let newItem = { ...item };

        if (draft.sisaQty !== undefined && draft.sisaQty !== item.sisaQty) {
          const perubahan = draft.sisaQty - item.sisaQty;
          newItem.sisaQty = draft.sisaQty;
          newItem.jurnal = [
            {
              id: `J-${Date.now()}`,
              tanggal: new Date().toISOString(),
              jenis: "Perbaikan Stok",
              perubahanQty: perubahan,
              sisaQty: draft.sisaQty,
              keterangan: "Perbaikan data stok (Manual)"
            },
            ...item.jurnal
          ];
        }

        if (draft.hargaJual !== undefined && draft.hargaJual !== item.hargaJual) {
          newItem.hargaJual = draft.hargaJual;
          if (newItem.hargaBeliTerakhir > 0) {
            newItem.margin = newItem.hargaJual - newItem.hargaBeliTerakhir;
          }
        }

        return newItem;
      }
      return item;
    }));

    setDrafts(prev => {
      const updated = { ...prev };
      delete updated[sku];
      return updated;
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(deleteTarget.sku);
      } else {
        setData(prev => prev.filter(i => i.sku !== deleteTarget.sku));
      }
    } catch {
      // Error handling
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (activeSkuDetail) {
    const detailItem = data.find(item => item.sku === activeSkuDetail);
    if (!detailItem) return null;

    const currentJurnal = jurnalData.items.length > 0 ? jurnalData.items : detailItem.jurnal.slice((jurnalPage - 1) * JURNAL_PAGE_SIZE, jurnalPage * JURNAL_PAGE_SIZE);
    const totalJurnalCount = jurnalData.totalCount || detailItem.jurnal.length;
    const totalJurnalPages = Math.ceil(totalJurnalCount / JURNAL_PAGE_SIZE) || 1;

    return (
      <div className="space-y-[1.5rem]">
        <div className="flex items-center gap-[1rem]">
          <Button variant="outline" size="sm" onClick={() => { setActiveSkuDetail(null); setJurnalPage(1); }} className="gap-[0.5rem] px-[0.75rem]">
            <ArrowLeft className="h-[1.25rem] w-[1.25rem]" />
            Kembali
          </Button>
          <div>
            <h3 className={cn(tokens.typography.h3, "text-gray-900")}>Jurnal Stok - {detailItem.namaObat}</h3>
            <p className="text-sm text-gray-500">SKU: {detailItem.sku} | Merk: {detailItem.namaMerk}</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-[1.5rem]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="py-[1rem] px-[1rem] font-medium text-gray-500">Tanggal</th>
                    <th className="py-[1rem] px-[1rem] font-medium text-gray-500">Jenis</th>
                    <th className="py-[1rem] px-[1rem] font-medium text-gray-500 text-right">Perubahan Qty</th>
                    <th className="py-[1rem] px-[1rem] font-medium text-gray-500 text-right">Sisa Qty</th>
                    <th className="py-[1rem] px-[1rem] font-medium text-gray-500">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentJurnal.map(jurnal => (
                    <tr key={jurnal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-[1rem] px-[1rem] text-gray-600">{formatDateTimeString(jurnal.tanggal)}</td>
                      <td className="py-[1rem] px-[1rem]">
                        <Badge variant={
                          jurnal.jenis === 'Masuk' ? 'success' : 
                          jurnal.jenis === 'Keluar' ? 'danger' : 
                          jurnal.jenis === 'Terjual' ? 'primary' : 'warning'
                        } className="px-[0.5rem] py-[0.125rem]">
                          {jurnal.jenis}
                        </Badge>
                      </td>
                      <td className={`py-[1rem] px-[1rem] text-right font-medium ${jurnal.perubahanQty > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {jurnal.perubahanQty > 0 ? '+' : ''}{jurnal.perubahanQty}
                      </td>
                      <td className="py-[1rem] px-[1rem] text-right font-semibold text-gray-900">{jurnal.sisaQty}</td>
                      <td className="py-[1rem] px-[1rem] text-gray-500">{jurnal.keterangan || '-'}</td>
                    </tr>
                  ))}
                  {totalJurnalCount === 0 && (
                    <tr>
                      <td colSpan={5} className="py-[2rem] text-center text-gray-500">Belum ada riwayat jurnal stok</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Jurnal Agnostik */}
            {totalJurnalCount > 0 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-[1rem] mt-[1rem] text-sm text-gray-600">
                <div>
                  Menampilkan {(jurnalPage - 1) * JURNAL_PAGE_SIZE + 1} - {Math.min(jurnalPage * JURNAL_PAGE_SIZE, totalJurnalCount)} dari {totalJurnalCount} jurnal
                </div>
                <div className="flex items-center gap-[0.5rem]">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={jurnalPage <= 1}
                    onClick={() => setJurnalPage(p => Math.max(1, p - 1))}
                    className="p-[0.375rem]"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="h-[1.25rem] w-[1.25rem]" />
                  </Button>
                  <span className="font-medium px-[0.5rem]">Halaman {jurnalPage} dari {totalJurnalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={jurnalPage >= totalJurnalPages}
                    onClick={() => setJurnalPage(p => Math.min(totalJurnalPages, p + 1))}
                    className="p-[0.375rem]"
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRight className="h-[1.25rem] w-[1.25rem]" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalTablePages = Math.ceil(data.length / TABLE_PAGE_SIZE) || 1;
  const paginatedTableData = data.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE);

  return (
    <>
      <Card className="h-full">
        <CardContent className="pt-[1.5rem]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500">SKU</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500">Nama Obat (Merk)</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-center">Bentuk</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-center">Dosis Sediaan</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-center w-[6rem]">Sisa Qty</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-right">Harga Beli Terakhir</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-right w-[10rem]">Harga Jual</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-right w-[8rem]">Margin</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-center w-[6rem]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedTableData.map((item) => {
                  const draft = drafts[item.sku];
                  const currentSisaQty = draft?.sisaQty !== undefined ? draft.sisaQty : item.sisaQty;
                  const currentHargaJual = draft?.hargaJual !== undefined ? draft.hargaJual : item.hargaJual;

                  const hasSisaQtyChanged = draft?.sisaQty !== undefined && draft.sisaQty !== item.sisaQty;
                  const hasHargaJualChanged = draft?.hargaJual !== undefined && draft.hargaJual !== item.hargaJual;
                  const isChanged = hasSisaQtyChanged || hasHargaJualChanged;

                  return (
                    <tr key={item.sku} className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setActiveSkuDetail(item.sku)}>
                      <td className="py-[1rem] px-[0.5rem] font-medium text-gray-900 group-hover:text-purple-700">{item.sku}</td>
                      <td className="py-[1rem] px-[0.5rem] text-gray-900">
                        {item.namaObat} <span className="text-gray-500">({item.namaMerk})</span>
                      </td>
                      <td className="py-[1rem] px-[0.5rem] text-center text-gray-600">
                        <Badge variant="default">{item.bentukSediaan}</Badge>
                      </td>
                      <td className="py-[1rem] px-[0.5rem] text-center text-gray-600">{item.dosisSediaan}</td>
                      <td className="py-[0.5rem] px-[0.5rem] text-center" onClick={e => e.stopPropagation()}>
                        <Input 
                          value={currentSisaQty} 
                          onChange={(e) => handleDraftChange(item.sku, 'sisaQty', e.target.value)}
                          className={cn(
                            "text-center font-bold h-[2rem]",
                            hasSisaQtyChanged ? "text-amber-600 border-amber-400 bg-amber-50/50" : "text-purple-700"
                          )}
                        />
                      </td>
                      <td className="py-[1rem] px-[0.5rem] text-right text-gray-600">{formatCurrency(item.hargaBeliTerakhir)}</td>
                      <td className="py-[0.5rem] px-[0.5rem] text-right" onClick={e => e.stopPropagation()}>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[0.5rem]">
                            <span className="text-gray-500 sm:text-sm">Rp</span>
                          </div>
                          <Input 
                            value={new Intl.NumberFormat("id-ID").format(currentHargaJual)} 
                            onChange={(e) => handleDraftChange(item.sku, 'hargaJual', e.target.value)}
                            className={cn(
                              "text-right h-[2rem] pl-[2rem]",
                              hasHargaJualChanged ? "text-amber-600 border-amber-400 bg-amber-50/50" : ""
                            )}
                          />
                        </div>
                      </td>
                      <td className="py-[1rem] px-[0.5rem] text-right text-gray-600">
                        <span className={item.margin > 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                          {formatCurrency(item.margin)}
                        </span>
                      </td>
                      <td className="py-[0.5rem] px-[0.5rem] text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-[0.375rem]">
                          {isChanged ? (
                            <>
                              <button
                                onClick={() => handleConfirmUpdate(item.sku)}
                                className="rounded-md bg-emerald-600 p-[0.375rem] text-white hover:bg-emerald-700 transition-colors shadow-sm"
                                title="Setujui Perubahan"
                              >
                                <Check className="h-[1rem] w-[1rem]" />
                              </button>
                              <button
                                onClick={() => handleCancelUpdate(item.sku)}
                                className="rounded-md bg-rose-600 p-[0.375rem] text-white hover:bg-rose-700 transition-colors shadow-sm"
                                title="Batalkan Perubahan"
                              >
                                <X className="h-[1rem] w-[1rem]" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="rounded-md p-[0.375rem] text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                              title="Hapus Data Stok"
                            >
                              <Trash2 className="h-[1rem] w-[1rem]" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Table Stok Berjalan Agnostik */}
          {data.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-[1rem] mt-[1rem] text-sm text-gray-600">
              <div>
                Menampilkan {(tablePage - 1) * TABLE_PAGE_SIZE + 1} - {Math.min(tablePage * TABLE_PAGE_SIZE, data.length)} dari {data.length} data
              </div>
              <div className="flex items-center gap-[0.5rem]">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={tablePage <= 1}
                  onClick={() => setTablePage(p => Math.max(1, p - 1))}
                  className="p-[0.375rem]"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="h-[1.25rem] w-[1.25rem]" />
                </Button>
                <span className="font-medium px-[0.5rem]">Halaman {tablePage} dari {totalTablePages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={tablePage >= totalTablePages}
                  onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))}
                  className="p-[0.375rem]"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="h-[1.25rem] w-[1.25rem]" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SWAL Warning Modal Konfirmasi Hapus */}
      <PopUpModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Konfirmasi Hapus Data"
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-[0.75rem]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus Data"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center p-[0.5rem]">
          <div className="mb-[1rem] rounded-full bg-amber-100 p-[0.75rem] text-amber-600">
            <AlertTriangle className="h-[2rem] w-[2rem]" />
          </div>
          <h4 className="text-base font-semibold text-gray-900 mb-[0.5rem]">
            Apakah Anda yakin ingin menghapus data stok ini?
          </h4>
          <p className="text-sm text-gray-500">
            Obat <span className="font-semibold text-gray-800">{deleteTarget?.namaObat}</span> (SKU: {deleteTarget?.sku}) akan dihapus. Seluruh data terkait pada tabel <span className="font-medium text-rose-600">obat masuk, obat keluar, dan jurnal stok</span> juga akan terhapus secara permanen.
          </p>
        </div>
      </PopUpModal>
    </>
  );
}

