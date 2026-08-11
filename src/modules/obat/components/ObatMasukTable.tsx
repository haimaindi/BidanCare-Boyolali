import React, { useState } from "react";
import { Card, CardContent } from "../../../ui/components/common/Card";
import { Badge } from "../../../ui/components/elements/Badge";
import { Button } from "../../../ui/components/elements/Button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { PopUpModal } from "../../../ui/components/common/PopUpModal";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Input } from "../../../ui/components/elements/Input";
import { DropdownInput } from "../../../ui/components/elements/DropdownInput";
import { PriceInput } from "../../../ui/components/elements/PriceInput";
import { ObatMasuk, StokBerjalan } from "../data/dummy";

interface ObatMasukTableProps {
  data: ObatMasuk[];
  setData: React.Dispatch<React.SetStateAction<ObatMasuk[]>>;
  stokBerjalan: StokBerjalan[];
  setStokBerjalan: React.Dispatch<React.SetStateAction<StokBerjalan[]>>;
  onAddEntry?: (entry: Omit<ObatMasuk, "id" | "tanggal">) => Promise<void> | void;
}

export function ObatMasukTable({ data, setData, stokBerjalan, setStokBerjalan, onAddEntry }: ObatMasukTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<"existing" | "new">("existing");
  const [formData, setFormData] = useState({
    sku: "",
    namaObat: "",
    namaMerk: "",
    bentukSediaan: "",
    dosisSediaan: "",
    qtyMasuk: 0,
    hargaBeli: 0,
  });

  const PAGE_SIZE = 50;
  const totalPages = Math.ceil(data.length / PAGE_SIZE) || 1;
  const paginatedData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSkuChange = (sku: string) => {
    if (sku === "NEW") {
      setFormType("new");
      setFormData({
        sku: "",
        namaObat: "",
        namaMerk: "",
        bentukSediaan: "",
        dosisSediaan: "",
        qtyMasuk: 0,
        hargaBeli: 0,
      });
    } else {
      setFormType("existing");
      const selected = stokBerjalan.find(s => s.sku === sku);
      if (selected) {
        setFormData({
          sku: selected.sku,
          namaObat: selected.namaObat,
          namaMerk: selected.namaMerk,
          bentukSediaan: selected.bentukSediaan,
          dosisSediaan: selected.dosisSediaan,
          qtyMasuk: 0,
          hargaBeli: selected.hargaBeliTerakhir,
        });
      }
    }
  };

  const handleSave = async () => {
    if (onAddEntry) {
      await onAddEntry({
        sku: formData.sku,
        namaObat: formData.namaObat,
        namaMerk: formData.namaMerk,
        bentukSediaan: formData.bentukSediaan,
        dosisSediaan: formData.dosisSediaan,
        qtyMasuk: formData.qtyMasuk,
        hargaBeli: formData.hargaBeli,
      });
      setIsModalOpen(false);
      return;
    }

    const newId = `OM-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newEntry: ObatMasuk = {
      id: newId,
      sku: formData.sku,
      namaObat: formData.namaObat,
      namaMerk: formData.namaMerk,
      bentukSediaan: formData.bentukSediaan,
      dosisSediaan: formData.dosisSediaan,
      qtyMasuk: formData.qtyMasuk,
      hargaBeli: formData.hargaBeli,
      tanggal: timestamp,
    };

    setData(prev => [newEntry, ...prev]);

    setStokBerjalan(prev => {
      const existingIdx = prev.findIndex(s => s.sku === formData.sku);
      if (existingIdx > -1) {
        const updated = [...prev];
        const item = updated[existingIdx];
        const newSisa = item.sisaQty + formData.qtyMasuk;
        updated[existingIdx] = {
          ...item,
          sisaQty: newSisa,
          hargaBeliTerakhir: formData.hargaBeli,
          margin: item.hargaJual - formData.hargaBeli,
          jurnal: [
            {
              id: `J-${Date.now()}`,
              tanggal: timestamp,
              jenis: "Masuk",
              perubahanQty: formData.qtyMasuk,
              sisaQty: newSisa,
              keterangan: "Obat Masuk (Manual)"
            },
            ...item.jurnal
          ]
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            sku: formData.sku,
            namaObat: formData.namaObat,
            namaMerk: formData.namaMerk,
            bentukSediaan: formData.bentukSediaan,
            dosisSediaan: formData.dosisSediaan,
            sisaQty: formData.qtyMasuk,
            hargaBeliTerakhir: formData.hargaBeli,
            hargaJual: formData.hargaBeli * 1.3, // Default 30% margin
            margin: (formData.hargaBeli * 1.3) - formData.hargaBeli,
            jurnal: [{
              id: `J-${Date.now()}`,
              tanggal: timestamp,
              jenis: "Masuk",
              perubahanQty: formData.qtyMasuk,
              sisaQty: formData.qtyMasuk,
              keterangan: "Stok Awal (Obat Masuk Baru)"
            }]
          }
        ];
      }
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-[1rem]">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)} className="gap-[0.5rem]">
          <Plus className="h-[1.25rem] w-[1.25rem]" />
          Tambah Obat Masuk
        </Button>
      </div>

      <Card className="h-full">
        <CardContent className="pt-[1.5rem]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500">Tanggal Masuk</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500">SKU</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500">Nama Obat (Merk)</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-center">Bentuk</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-center">Dosis Sediaan</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-right">Qty Masuk</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-right">Harga Beli</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-[1rem] px-[0.5rem] text-gray-600">{formatDateTimeString(item.tanggal)}</td>
                    <td className="py-[1rem] px-[0.5rem] font-medium text-gray-900">{item.sku}</td>
                    <td className="py-[1rem] px-[0.5rem] text-gray-900">
                      {item.namaObat} <span className="text-gray-500">({item.namaMerk})</span>
                    </td>
                    <td className="py-[1rem] px-[0.5rem] text-center text-gray-600">
                      <Badge variant="default">{item.bentukSediaan}</Badge>
                    </td>
                    <td className="py-[1rem] px-[0.5rem] text-center text-gray-600">{item.dosisSediaan}</td>
                    <td className="py-[1rem] px-[0.5rem] text-right font-medium text-purple-700">+{item.qtyMasuk}</td>
                    <td className="py-[1rem] px-[0.5rem] text-right text-gray-900">{formatCurrency(item.hargaBeli)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Obat Masuk Agnostik */}
          {data.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-[1rem] mt-[1rem] text-sm text-gray-600">
              <div>
                Menampilkan {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, data.length)} dari {data.length} data
              </div>
              <div className="flex items-center gap-[0.5rem]">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-[0.375rem]"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="h-[1.25rem] w-[1.25rem]" />
                </Button>
                <span className="font-medium px-[0.5rem]">Halaman {currentPage} dari {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

      <PopUpModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Tambah Obat Masuk"
        footer={
          <div className="flex justify-end gap-[0.75rem]">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.sku || !formData.namaObat || formData.qtyMasuk <= 0}
            >
              Simpan Obat Masuk
            </Button>
          </div>
        }
      >
        <div className="space-y-[1.25rem]">
          <FormGroup id="skuSelect" label="Pilih SKU / Obat">
            <DropdownInput 
              options={[
                ...stokBerjalan.map(s => ({ value: s.sku, label: `${s.sku} - ${s.namaObat} (${s.namaMerk})` })),
                { value: "NEW", label: "+ Input SKU Baru" }
              ]}
              value={formData.sku && stokBerjalan.find(s => s.sku === formData.sku) ? formData.sku : (formData.sku === "NEW" ? "NEW" : "")}
              onChange={(val) => handleSkuChange(val)}
              placeholder="Pilih Obat..."
              searchable
            />
          </FormGroup>

          {formType === "new" && (
            <FormGroup id="skuInput" label="SKU Baru">
              <Input 
                id="skuInput" 
                value={formData.sku} 
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
                placeholder="Contoh: OBT-003" 
              />
            </FormGroup>
          )}

          <FormGroup id="namaObat" label="Nama Obat">
            <Input 
              id="namaObat" 
              value={formData.namaObat} 
              onChange={(e) => setFormData({ ...formData, namaObat: e.target.value })} 
              disabled={formType === "existing"}
              placeholder="Contoh: Paracetamol"
            />
          </FormGroup>

          <FormGroup id="namaMerk" label="Nama Merk">
            <Input 
              id="namaMerk" 
              value={formData.namaMerk} 
              onChange={(e) => setFormData({ ...formData, namaMerk: e.target.value })} 
              disabled={formType === "existing"}
              placeholder="Contoh: Panadol"
            />
          </FormGroup>

          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="bentukSediaan" label="Bentuk Sediaan">
              <DropdownInput 
                options={[
                  ...Array.from(new Set([...stokBerjalan.map(s => s.bentukSediaan), "Tablet", "Kapsul", "Sirup", "Salep", "Injeksi"])).filter(Boolean).map(b => ({ value: b, label: b }))
                ]}
                value={formData.bentukSediaan}
                onChange={(val) => setFormData({ ...formData, bentukSediaan: val })}
                disabled={formType === "existing"}
                placeholder="Pilih Bentuk..."
              />
            </FormGroup>
            <FormGroup id="dosisSediaan" label="Dosis Sediaan">
              <Input 
                id="dosisSediaan" 
                value={formData.dosisSediaan} 
                onChange={(e) => setFormData({ ...formData, dosisSediaan: e.target.value })} 
                disabled={formType === "existing"}
                placeholder="Contoh: 500mg"
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="qtyMasuk" label="Qty Masuk">
              <Input 
                id="qtyMasuk" 
                type="number" 
                value={formData.qtyMasuk}
                onChange={(e) => setFormData({ ...formData, qtyMasuk: parseInt(e.target.value) || 0 })}
                placeholder="0" 
              />
            </FormGroup>
            <FormGroup id="hargaBeli" label="Harga Beli">
              <PriceInput 
                id="hargaBeli" 
                value={formData.hargaBeli}
                onChange={(e) => setFormData({ ...formData, hargaBeli: parseInt(e.target.value) || 0 })}
                placeholder="0" 
              />
            </FormGroup>
          </div>
        </div>
      </PopUpModal>
    </div>
  );
}
