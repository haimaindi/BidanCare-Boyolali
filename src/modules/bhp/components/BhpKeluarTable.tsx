import React, { useState } from "react";
import { Card, CardContent } from "../../../ui/components/common/Card";
import { Badge } from "../../../ui/components/elements/Badge";
import { Button } from "../../../ui/components/elements/Button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { PopUpModal } from "../../../ui/components/common/PopUpModal";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Input } from "../../../ui/components/elements/Input";
import { DropdownInput } from "../../../ui/components/elements/DropdownInput";
import { BhpKeluar, StokBerjalanBhp } from "../data/dummy";

interface BhpKeluarTableProps {
  data: BhpKeluar[];
  setData: React.Dispatch<React.SetStateAction<BhpKeluar[]>>;
  stokBerjalan: StokBerjalanBhp[];
  setStokBerjalan: React.Dispatch<React.SetStateAction<StokBerjalanBhp[]>>;
  onAddEntry?: (entry: Omit<BhpKeluar, "id" | "tanggal">) => Promise<void> | void;
}

export function BhpKeluarTable({ data, setData, stokBerjalan, setStokBerjalan, onAddEntry }: BhpKeluarTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    sku: "",
    kategori: "",
    namaBhp: "",
    satuan: "",
    qtyKeluar: 0,
    keterangan: "",
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

  const handleSkuChange = (sku: string) => {
    const selected = stokBerjalan.find(s => s.sku === sku);
    if (selected) {
      setFormData({
        sku: selected.sku,
        kategori: selected.kategori,
        namaBhp: selected.namaBhp,
        satuan: selected.satuan,
        qtyKeluar: 0,
        keterangan: "",
      });
    }
  };

  const handleSave = async () => {
    if (onAddEntry) {
      await onAddEntry({
        sku: formData.sku,
        kategori: formData.kategori,
        namaBhp: formData.namaBhp,
        satuan: formData.satuan,
        qtyKeluar: formData.qtyKeluar,
        keterangan: formData.keterangan,
      });
      setIsModalOpen(false);
      return;
    }

    const timestamp = new Date().toISOString();
    const newEntry: BhpKeluar = {
      id: `BK-${Date.now()}`,
      ...formData,
      tanggal: timestamp,
    };

    setData(prev => [newEntry, ...prev]);

    setStokBerjalan(prev => {
      const existingIdx = prev.findIndex(s => s.sku === formData.sku);
      if (existingIdx > -1) {
        const updated = [...prev];
        const item = updated[existingIdx];
        const newSisa = item.sisaQty - formData.qtyKeluar;
        updated[existingIdx] = {
          ...item,
          sisaQty: newSisa,
          jurnal: [
            {
              id: `J-${Date.now()}`,
              tanggal: timestamp,
              jenis: "Keluar",
              perubahanQty: -formData.qtyKeluar,
              sisaQty: newSisa,
              keterangan: formData.keterangan || "BHP Keluar (Manual)"
            },
            ...item.jurnal
          ]
        };
        return updated;
      }
      return prev;
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-[1rem]">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)} className="gap-[0.5rem]">
          <Plus className="h-[1.25rem] w-[1.25rem]" />
          Tambah BHP Keluar
        </Button>
      </div>

      <Card className="h-full">
        <CardContent className="pt-[1.5rem]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500">Tanggal Keluar</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500">SKU</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500">Nama BHP</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-center">Satuan</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500 text-right">Qty Keluar</th>
                  <th className="pb-[0.75rem] px-[0.5rem] font-medium text-gray-500">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-[1rem] px-[0.5rem] text-gray-600">{formatDateTimeString(item.tanggal)}</td>
                    <td className="py-[1rem] px-[0.5rem] font-medium text-gray-900">{item.sku}</td>
                    <td className="py-[1rem] px-[0.5rem] text-gray-900">{item.namaBhp}</td>
                    <td className="py-[1rem] px-[0.5rem] text-center">
                      <Badge variant="default">{item.satuan}</Badge>
                    </td>
                    <td className="py-[1rem] px-[0.5rem] text-right font-medium text-rose-600">-{item.qtyKeluar}</td>
                    <td className="py-[1rem] px-[0.5rem] text-gray-600">{item.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination BHP Keluar Agnostik */}
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
        title="Tambah BHP Keluar"
        footer={
          <div className="flex justify-end gap-[0.75rem]">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={!formData.sku || formData.qtyKeluar <= 0}>
              Simpan BHP Keluar
            </Button>
          </div>
        }
      >
        <div className="space-y-[1.25rem]">
          <FormGroup id="skuSelect" label="Pilih SKU / BHP">
            <DropdownInput 
              options={stokBerjalan.map(s => ({ value: s.sku, label: `${s.sku} - ${s.namaBhp}` }))}
              value={formData.sku}
              onChange={(val) => handleSkuChange(val)}
              placeholder="Pilih BHP..."
              searchable
            />
          </FormGroup>

          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="kategori" label="Kategori">
              <Input id="kategori" value={formData.kategori} disabled placeholder="-" />
            </FormGroup>
            <FormGroup id="satuan" label="Satuan">
              <Input id="satuan" value={formData.satuan} disabled placeholder="-" />
            </FormGroup>
          </div>

          <FormGroup id="namaBhp" label="Nama BHP">
            <Input id="namaBhp" value={formData.namaBhp} disabled placeholder="-" />
          </FormGroup>

          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="qtyKeluar" label="Qty Keluar">
              <Input 
                id="qtyKeluar" 
                type="number" 
                value={formData.qtyKeluar}
                onChange={(e) => setFormData({ ...formData, qtyKeluar: parseInt(e.target.value) || 0 })}
                placeholder="0" 
              />
            </FormGroup>
            <FormGroup id="keterangan" label="Keterangan">
              <Input 
                id="keterangan" 
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Alasan pengeluaran..." 
              />
            </FormGroup>
          </div>
        </div>
      </PopUpModal>
    </div>
  );
}
