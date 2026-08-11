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
import { BhpMasuk, StokBerjalanBhp } from "../data/dummy";

interface BhpMasukTableProps {
  data: BhpMasuk[];
  setData: React.Dispatch<React.SetStateAction<BhpMasuk[]>>;
  stokBerjalan: StokBerjalanBhp[];
  setStokBerjalan: React.Dispatch<React.SetStateAction<StokBerjalanBhp[]>>;
  onAddEntry?: (entry: Omit<BhpMasuk, "id" | "tanggal">) => Promise<void> | void;
}

export function BhpMasukTable({ data, setData, stokBerjalan, setStokBerjalan, onAddEntry }: BhpMasukTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<"existing" | "new">("existing");
  const [formData, setFormData] = useState({
    sku: "",
    kategori: "",
    namaBhp: "",
    satuan: "",
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
        kategori: "",
        namaBhp: "",
        satuan: "",
        qtyMasuk: 0,
        hargaBeli: 0,
      });
    } else {
      setFormType("existing");
      const selected = stokBerjalan.find(s => s.sku === sku);
      if (selected) {
        setFormData({
          sku: selected.sku,
          kategori: selected.kategori,
          namaBhp: selected.namaBhp,
          satuan: selected.satuan,
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
        kategori: formData.kategori,
        namaBhp: formData.namaBhp,
        satuan: formData.satuan,
        qtyMasuk: formData.qtyMasuk,
        hargaBeli: formData.hargaBeli,
      });
      setIsModalOpen(false);
      return;
    }

    const timestamp = new Date().toISOString();
    const newEntry: BhpMasuk = {
      id: `BM-${Date.now()}`,
      ...formData,
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
              keterangan: "BHP Masuk (Manual)"
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
            kategori: formData.kategori,
            namaBhp: formData.namaBhp,
            satuan: formData.satuan,
            sisaQty: formData.qtyMasuk,
            hargaBeliTerakhir: formData.hargaBeli,
            hargaJual: formData.hargaBeli * 1.3,
            margin: (formData.hargaBeli * 1.3) - formData.hargaBeli,
            jurnal: [{
              id: `J-${Date.now()}`,
              tanggal: timestamp,
              jenis: "Masuk",
              perubahanQty: formData.qtyMasuk,
              sisaQty: formData.qtyMasuk,
              keterangan: "Stok Awal (BHP Baru)"
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
          Tambah BHP Masuk
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
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500">Kategori</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500">Nama BHP</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-center">Satuan</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-right">Qty Masuk</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-right">Harga Beli</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-[1rem] px-[0.5rem] text-gray-600">{formatDateTimeString(item.tanggal)}</td>
                    <td className="py-[1rem] px-[0.5rem] font-medium text-gray-900">{item.sku}</td>
                    <td className="py-[1rem] px-[0.5rem] text-gray-600">{item.kategori}</td>
                    <td className="py-[1rem] px-[0.5rem] text-gray-900">{item.namaBhp}</td>
                    <td className="py-[1rem] px-[0.5rem] text-center">
                      <Badge variant="default">{item.satuan}</Badge>
                    </td>
                    <td className="py-[1rem] px-[0.5rem] text-right font-medium text-purple-700">+{item.qtyMasuk}</td>
                    <td className="py-[1rem] px-[0.5rem] text-right text-gray-900">{formatCurrency(item.hargaBeli)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination BHP Masuk Agnostik */}
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
        title="Tambah BHP Masuk"
        footer={
          <div className="flex justify-end gap-[0.75rem]">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={!formData.sku || !formData.namaBhp || formData.qtyMasuk <= 0}>
              Simpan BHP Masuk
            </Button>
          </div>
        }
      >
        <div className="space-y-[1.25rem]">
          <FormGroup id="skuSelect" label="Pilih SKU / BHP">
            <DropdownInput 
              options={[
                ...stokBerjalan.map(s => ({ value: s.sku, label: `${s.sku} - ${s.namaBhp}` })),
                { value: "NEW", label: "+ Input SKU Baru" }
              ]}
              value={formData.sku && stokBerjalan.find(s => s.sku === formData.sku) ? formData.sku : (formData.sku === "NEW" ? "NEW" : "")}
              onChange={(val) => handleSkuChange(val)}
              placeholder="Pilih BHP..."
              searchable
            />
          </FormGroup>

          {formType === "new" && (
            <FormGroup id="skuInput" label="SKU Baru">
              <Input id="skuInput" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="BHP-XXX" />
            </FormGroup>
          )}

          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="kategori" label="Kategori">
              <DropdownInput 
                options={[
                  { value: "Alat Medis", label: "Alat Medis" },
                  { value: "Laboratorium", label: "Laboratorium" },
                  { value: "ATK", label: "ATK" },
                  { value: "Lainnya", label: "Lainnya" }
                ]}
                value={formData.kategori}
                onChange={(val) => setFormData({ ...formData, kategori: val })}
                disabled={formType === "existing"}
                placeholder="Pilih Kategori..."
              />
            </FormGroup>
            <FormGroup id="satuan" label="Satuan">
              <DropdownInput 
                options={[
                  { value: "Pcs", label: "Pcs" },
                  { value: "Box", label: "Box" },
                  { value: "Roll", label: "Roll" },
                  { value: "Botol", label: "Botol" }
                ]}
                value={formData.satuan}
                onChange={(val) => setFormData({ ...formData, satuan: val })}
                disabled={formType === "existing"}
                placeholder="Pilih Satuan..."
              />
            </FormGroup>
          </div>

          <FormGroup id="namaBhp" label="Nama BHP">
            <Input id="namaBhp" value={formData.namaBhp} onChange={(e) => setFormData({ ...formData, namaBhp: e.target.value })} disabled={formType === "existing"} placeholder="Nama barang..." />
          </FormGroup>

          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="qtyMasuk" label="Qty Masuk">
              <Input id="qtyMasuk" type="number" value={formData.qtyMasuk} onChange={(e) => setFormData({ ...formData, qtyMasuk: parseInt(e.target.value) || 0 })} placeholder="0" />
            </FormGroup>
            <FormGroup id="hargaBeli" label="Harga Beli">
              <PriceInput id="hargaBeli" value={formData.hargaBeli} onChange={(e) => setFormData({ ...formData, hargaBeli: parseInt(e.target.value) || 0 })} placeholder="0" />
            </FormGroup>
          </div>
        </div>
      </PopUpModal>
    </div>
  );
}
