import React, { useState, useEffect } from "react";
import { LoketObatEntry, PrescriptionItem } from "../types";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Input } from "../../../ui/components/elements/Input";
import { Button } from "../../../ui/components/elements/Button";
import { Trash2, Plus, Search, User, ArrowLeft, Pill, Edit } from "lucide-react";
import { tokens } from "../../../ui/styles/tokens";
import { cn } from "../../../logic/utils/cn";
import { PopUpModal } from "../../../ui/components/common/PopUpModal";
import { ComboBox } from "../../../ui/components/elements/ComboBox";
import { DUMMY_STOK_BERJALAN } from "../../obat/data/dummy";

interface PrescriptionFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<LoketObatEntry>) => void;
  initialData?: LoketObatEntry | null;
}

export function PrescriptionForm({ onClose, onSubmit, initialData }: PrescriptionFormProps) {
  const [formData, setFormData] = useState<Partial<LoketObatEntry>>({
    noRm: "",
    namaPasien: "",
    jenisKelamin: "P",
    tanggalLahir: "",
    usia: "",
    sumber: "Beli Langsung",
    items: [],
  });

  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [editingMedicineIndex, setEditingMedicineIndex] = useState<number | null>(null);
  const [currentMedicine, setCurrentMedicine] = useState<PrescriptionItem>({
    sku: "",
    namaObat: "",
    dosis: "",
    aturanPakai: "",
    jumlah: 1,
  });

  const [obatList, setObatList] = useState<any[]>(DUMMY_STOK_BERJALAN);

  useEffect(() => {
    async function loadRealObat() {
      try {
        const { fetchObatStokBerjalanList } = await import("../../../logic/services/manajemenObatService.js");
        const res = await fetchObatStokBerjalanList({ strategy: "full" });
        if (res && res.items) {
          setObatList(res.items);
        }
      } catch (err) {
        console.error("Failed to fetch real obat list", err);
      }
    }
    loadRealObat();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return "";

    let ageYears = today.getFullYear() - birth.getFullYear();
    let ageMonths = today.getMonth() - birth.getMonth();

    if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birth.getDate())) {
      ageYears--;
      ageMonths += 12;
    }

    return `${ageYears} Thn ${ageMonths} Bln`;
  };

  const handleDateChange = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      tanggalLahir: date,
      usia: calculateAge(date),
    }));
  };

  const handleOpenMedicineModal = (index?: number) => {
    if (index !== undefined) {
      setEditingMedicineIndex(index);
      setCurrentMedicine(formData.items![index]);
    } else {
      setEditingMedicineIndex(null);
      setCurrentMedicine({
        sku: "",
        namaObat: "",
        dosis: "",
        aturanPakai: "",
        jumlah: 1,
      });
    }
    setIsMedicineModalOpen(true);
  };

  const handleSaveMedicine = () => {
    if (!currentMedicine.namaObat) return;

    setFormData((prev) => {
      const newItems = [...(prev.items || [])];
      if (editingMedicineIndex !== null) {
        newItems[editingMedicineIndex] = currentMedicine;
      } else {
        newItems.push(currentMedicine);
      }
      return { ...prev, items: newItems };
    });
    setIsMedicineModalOpen(false);
  };

  const handleRemoveMedicine = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="space-y-[1.5rem] animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center gap-[1rem] border-b pb-[1.5rem]">
        <Button variant="ghost" size="sm" onClick={onClose} className="h-[2.5rem] w-[2.5rem] p-0 rounded-full hover:bg-gray-100">
          <ArrowLeft className="h-[1.25rem] w-[1.25rem] text-gray-500" />
        </Button>
        <div>
          <h2 className={tokens.typography.h2}>
            {initialData ? "Edit Pesanan Obat" : "Input Pesanan Obat Baru"}
          </h2>
          <p className="text-sm text-gray-500 font-medium">Lengkapi data pasien dan daftar obat</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-[2rem]">
        {/* Patient Identity Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-purple-50/50 px-[1.5rem] py-[1rem] border-b border-purple-100 flex items-center gap-[0.75rem]">
            <User className="h-[1rem] w-[1rem] text-purple-600" />
            <h3 className="text-[0.75rem] font-black uppercase tracking-widest text-purple-900">Identitas Pasien</h3>
          </div>
          
          <div className="p-[1.5rem] grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
            <FormGroup id="noRm" label="No. Rekam Medis">
              <div className="relative">
                <Input
                  id="noRm"
                  placeholder="RM-XXXX"
                  value={formData.noRm}
                  onChange={(e) => setFormData({ ...formData, noRm: e.target.value })}
                />
                <button type="button" className="absolute right-[0.75rem] top-1/2 -translate-y-1/2 text-purple-600">
                  <Search className="h-[1rem] w-[1rem]" />
                </button>
              </div>
            </FormGroup>

            <FormGroup id="namaPasien" label="Nama Pasien" required>
              <Input
                id="namaPasien"
                placeholder="Nama Lengkap"
                value={formData.namaPasien}
                onChange={(e) => setFormData({ ...formData, namaPasien: e.target.value })}
                required
              />
            </FormGroup>

            <FormGroup id="jenisKelamin" label="Jenis Kelamin">
              <div className="flex items-center gap-[1rem] h-[2.75rem]">
                <div className="flex items-center bg-gray-100 rounded-lg p-[0.25rem] w-full max-w-[15rem]">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, jenisKelamin: "L" })}
                    className={cn(
                      "flex-1 py-[0.5rem] rounded-md text-[0.75rem] font-bold uppercase tracking-wider transition-all",
                      formData.jenisKelamin === "L" ? "bg-white text-purple-700 shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, jenisKelamin: "P" })}
                    className={cn(
                      "flex-1 py-[0.5rem] rounded-md text-[0.75rem] font-bold uppercase tracking-wider transition-all",
                      formData.jenisKelamin === "P" ? "bg-white text-purple-700 shadow-sm" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    Perempuan
                  </button>
                </div>
              </div>
            </FormGroup>

            <FormGroup id="usia" label="Usia / Tgl Lahir">
              <div className="flex gap-[1rem]">
                <div className="flex-1">
                  <Input
                    id="tglLahir"
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </div>
                <div className="w-[12rem]">
                  <Input
                    id="usia"
                    placeholder="Otomatis"
                    value={formData.usia}
                    readOnly
                    className="bg-gray-50 border-gray-100"
                  />
                </div>
              </div>
            </FormGroup>
          </div>
        </div>

        {/* Medication List Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-[1.5rem] py-[1.25rem] border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-[0.75rem]">
              <Pill className="h-[1.125rem] w-[1.125rem] text-purple-600" />
              <h3 className="text-[0.875rem] font-bold text-gray-900">Daftar Obat</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenMedicineModal()}
              className="gap-[0.5rem] border-purple-200 text-purple-700 font-bold uppercase tracking-wider text-[0.625rem] hover:bg-purple-50"
            >
              <Plus className="h-[0.875rem] w-[0.875rem]" />
              Tambah Obat
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-[0.625rem] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-[1.5rem] py-[1rem] text-left">Obat</th>
                  <th className="px-[1.5rem] py-[1rem] text-left">Dosis</th>
                  <th className="px-[1.5rem] py-[1rem] text-left">Aturan Pakai</th>
                  <th className="px-[1.5rem] py-[1rem] text-center w-[5rem]">Jumlah</th>
                  <th className="px-[1.5rem] py-[1rem] text-right w-[8rem]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {formData.items && formData.items.length > 0 ? (
                  formData.items.map((item, index) => (
                    <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-[1.5rem] py-[1rem]">
                        <span className="text-[0.875rem] font-bold text-gray-900">{item.namaObat}</span>
                      </td>
                      <td className="px-[1.5rem] py-[1rem]">
                        <span className="text-[0.75rem] font-medium text-gray-600">{item.dosis || "-"}</span>
                      </td>
                      <td className="px-[1.5rem] py-[1rem]">
                        <span className="text-[0.75rem] font-medium text-gray-600 italic">"{item.aturanPakai}"</span>
                      </td>
                      <td className="px-[1.5rem] py-[1rem] text-center">
                        <span className="text-[0.875rem] font-black text-purple-700">{item.jumlah}</span>
                      </td>
                      <td className="px-[1.5rem] py-[1rem] text-right">
                        <div className="flex items-center justify-end gap-[0.5rem]">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenMedicineModal(index)}
                            className="h-[2rem] w-[2rem] p-0 text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <Edit className="h-[0.875rem] w-[0.875rem]" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedicine(index)}
                            className="h-[2rem] w-[2rem] p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-[0.875rem] w-[0.875rem]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-[1.5rem] py-[3rem] text-center">
                      <div className="flex flex-col items-center gap-[0.5rem]">
                        <div className="h-[3rem] w-[3rem] rounded-full bg-gray-50 flex items-center justify-center">
                          <Pill className="h-[1.5rem] w-[1.5rem] text-gray-200" />
                        </div>
                        <p className="text-[0.75rem] font-medium text-gray-400">Belum ada obat yang ditambahkan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-[1rem] pt-[1rem] border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={onClose} className="px-[2rem] font-black uppercase tracking-widest text-[0.75rem]">
            Batal
          </Button>
          <Button type="submit" className="px-[3rem] h-[3rem] font-black uppercase tracking-widest text-[0.75rem] shadow-lg shadow-purple-200">
            {initialData ? "Simpan Perubahan" : "Simpan Pesanan"}
          </Button>
        </div>
      </form>

      {/* Medicine Modal */}
      <PopUpModal
        isOpen={isMedicineModalOpen}
        onClose={() => setIsMedicineModalOpen(false)}
        title={editingMedicineIndex !== null ? "Edit Obat" : "Tambah Obat"}
        maxWidth="max-w-lg"
      >
        <div className="space-y-[1.25rem]">
          <FormGroup id="modal-obat" label="Nama Obat" required>
            <ComboBox
              id="modal-obat"
              placeholder="Cari obat dari master..."
              options={obatList.map(o => o.namaObat)}
              value={currentMedicine.namaObat}
              onChange={(val) => {
                const selected = obatList.find(o => o.namaObat === val);
                if (selected) {
                  setCurrentMedicine({
                    ...currentMedicine,
                    namaObat: selected.namaObat,
                    sku: selected.sku,
                    dosis: selected.dosisSediaan
                  });
                } else {
                  setCurrentMedicine({ ...currentMedicine, namaObat: val });
                }
              }}
            />
          </FormGroup>
          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="modal-dosis" label="Dosis">
              <Input
                id="modal-dosis"
                placeholder="e.g. 500mg"
                value={currentMedicine.dosis}
                onChange={(e) => setCurrentMedicine({ ...currentMedicine, dosis: e.target.value })}
              />
            </FormGroup>
            <FormGroup id="modal-jumlah" label="Jumlah" required>
              <Input
                id="modal-jumlah"
                type="number"
                value={currentMedicine.jumlah}
                onChange={(e) => setCurrentMedicine({ ...currentMedicine, jumlah: parseInt(e.target.value) || 1 })}
              />
            </FormGroup>
          </div>
          <FormGroup id="modal-aturan" label="Aturan Pakai" required>
            <Input
              id="modal-aturan"
              placeholder="e.g. 3 x 1 Sesudah Makan"
              value={currentMedicine.aturanPakai}
              onChange={(e) => setCurrentMedicine({ ...currentMedicine, aturanPakai: e.target.value })}
            />
          </FormGroup>
          <div className="flex justify-end gap-[0.75rem] pt-[0.5rem]">
            <Button variant="ghost" onClick={() => setIsMedicineModalOpen(false)} className="text-[0.75rem] font-bold uppercase">
              Batal
            </Button>
            <Button onClick={handleSaveMedicine} className="px-[2rem] text-[0.75rem] font-bold uppercase">
              Simpan
            </Button>
          </div>
        </div>
      </PopUpModal>
    </div>
  );
}
