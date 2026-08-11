import { useState } from "react";
import { tokens } from "../../ui/styles/tokens";
import { Button } from "../../ui/components/elements/Button";
import { PopUpModal } from "../../ui/components/common/PopUpModal";
import { Plus } from "lucide-react";
import { KbTable } from "./components/KbTable";
import { KbForm } from "./components/KbForm";
import { KbMasterData } from "./types";
import { cn } from "../../logic/utils/cn";
import Swal from "sweetalert2";
import { useMasterKb } from "../../logic/hooks/useMasterKb.js";

export function MasterKbModule() {
  const { data, addItem, updateItem, deleteItem } = useMasterKb({ strategy: 'full' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KbMasterData | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: KbMasterData) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data master KB ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8b5cf6", // purple-600
      cancelButtonColor: "#f43f5e", // rose-500
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteItem(id);
        Swal.fire({
          title: "Terhapus!",
          text: "Data master KB telah berhasil dihapus.",
          icon: "success",
          confirmButtonColor: "#8b5cf6",
        });
      }
    });
  };

  const handleSubmit = (formData: Omit<KbMasterData, "id">) => {
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
          <h1 className={tokens.typography.h1}>Master Data KB</h1>
          <p className={cn(tokens.colors.text.muted, "text-sm mt-[0.25rem]")}>
            Kelola data jenis KB dan durasi kunjungan ulang antar tier.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-[1.25rem] w-[1.25rem] mr-[0.5rem]" />
          Tambah Master KB
        </Button>
      </div>

      <KbTable 
        data={data} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <PopUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Master KB" : "Tambah Master KB Baru"}
        footer={
          <div className="flex justify-end gap-[1rem]">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="kb-master-form">
              {editingItem ? "Simpan Perubahan" : "Simpan Master KB"}
            </Button>
          </div>
        }
      >
        <KbForm 
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </PopUpModal>
    </div>
  );
}
