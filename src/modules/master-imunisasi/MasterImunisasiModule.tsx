import { useState } from "react";
import { tokens } from "../../ui/styles/tokens";
import { Button } from "../../ui/components/elements/Button";
import { PopUpModal } from "../../ui/components/common/PopUpModal";
import { Plus, Database } from "lucide-react";
import { ImunisasiTable } from "./components/ImunisasiTable";
import { ImunisasiForm } from "./components/ImunisasiForm";
import { ImunisasiData } from "./types";
import { cn } from "../../logic/utils/cn";
import Swal from "sweetalert2";
import { useMasterImunisasi } from "../../logic/hooks/useMasterImunisasi.js";

export function MasterImunisasiModule() {
  const { data, addItem, updateItem, deleteItem } = useMasterImunisasi({ strategy: 'full' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ImunisasiData | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: ImunisasiData) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data master imunisasi ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8b5cf6",
      cancelButtonColor: "#f43f5e",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteItem(id);
        Swal.fire({
          title: "Terhapus!",
          text: "Data master imunisasi telah berhasil dihapus.",
          icon: "success",
          confirmButtonColor: "#8b5cf6",
        });
      }
    });
  };

  const handleSubmit = (formData: Omit<ImunisasiData, "id">) => {
    if (editingItem) {
      updateItem(editingItem.id, formData);
    } else {
      addItem(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-[1.5rem]">
      <div className="flex flex-col gap-[0.5rem] md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-[0.5rem]">
            <Database className="h-[1.5rem] w-[1.5rem] text-purple-600" />
            <h1 className={tokens.typography.h1}>Master Imunisasi</h1>
          </div>
          <p className={cn(tokens.colors.text.muted, "text-sm mt-[0.25rem]")}>
            Kelola daftar jenis imunisasi yang tersedia untuk layanan KIA.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-[1.25rem] w-[1.25rem] mr-[0.5rem]" />
          Tambah Master Imunisasi
        </Button>
      </div>

      <div className={cn(tokens.colors.surface.base, tokens.colors.border.base, "border rounded-xl overflow-hidden")}>
        <ImunisasiTable 
          data={data} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>

      <PopUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Master Imunisasi" : "Tambah Master Imunisasi Baru"}
        footer={
          <div className="flex justify-end gap-[1rem]">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="imunisasi-master-form">
              {editingItem ? "Simpan Perubahan" : "Simpan Master Imunisasi"}
            </Button>
          </div>
        }
      >
        <ImunisasiForm 
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </PopUpModal>
    </div>
  );
}
