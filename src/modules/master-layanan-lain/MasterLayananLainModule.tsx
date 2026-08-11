import { useState } from "react";
import { tokens } from "../../ui/styles/tokens";
import { Button } from "../../ui/components/elements/Button";
import { PopUpModal } from "../../ui/components/common/PopUpModal";
import { Plus, Briefcase } from "lucide-react";
import { LayananLainTable } from "./components/LayananLainTable";
import { LayananLainForm } from "./components/LayananLainForm";
import { LayananLainData } from "./types";
import { cn } from "../../logic/utils/cn";
import Swal from "sweetalert2";
import { useMasterLayananLain } from "../../logic/hooks/useMasterLayananLain.js";

export function MasterLayananLainModule() {
  const { data, addItem, updateItem, deleteItem } = useMasterLayananLain({ strategy: 'full' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LayananLainData | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: LayananLainData) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data master layanan ini akan dihapus permanen!",
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
          text: "Data master layanan telah berhasil dihapus.",
          icon: "success",
          confirmButtonColor: "#8b5cf6",
        });
      }
    });
  };

  const handleSubmit = (formData: Omit<LayananLainData, "id">) => {
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
            <Briefcase className="h-[1.5rem] w-[1.5rem] text-purple-600" />
            <h1 className={tokens.typography.h1}>Master Layanan Lain</h1>
          </div>
          <p className={cn(tokens.colors.text.muted, "text-sm mt-[0.25rem]")}>
            Kelola daftar layanan tindakan medis dan layanan tambahan lainnya.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-[1.25rem] w-[1.25rem] mr-[0.5rem]" />
          Tambah Master Layanan
        </Button>
      </div>

      <div className={cn(tokens.colors.surface.base, tokens.colors.border.base, "border rounded-xl overflow-hidden")}>
        <LayananLainTable 
          data={data} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>

      <PopUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Master Layanan" : "Tambah Master Layanan Baru"}
        footer={
          <div className="flex justify-end gap-[1rem]">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="layanan-lain-master-form">
              {editingItem ? "Simpan Perubahan" : "Simpan Master Layanan"}
            </Button>
          </div>
        }
      >
        <LayananLainForm 
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </PopUpModal>
    </div>
  );
}
