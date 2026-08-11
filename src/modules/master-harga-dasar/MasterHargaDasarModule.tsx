import { useState } from "react";
import { HargaDasar } from "./types";
import { HargaDasarTable } from "./components/HargaDasarTable";
import { HargaDasarForm } from "./components/HargaDasarForm";
import { PopUpModal } from "../../ui/components/common/PopUpModal";
import { Search } from "lucide-react";
import { Input } from "../../ui/components/elements/Input";
import { useMasterHargaDasar } from "../../logic/hooks/useMasterHargaDasar.js";

export default function MasterHargaDasarModule() {
  const { data, search, setSearch, updateItem } = useMasterHargaDasar({ strategy: 'full' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HargaDasar | null>(null);

  const handleEdit = (item: HargaDasar) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = (formData: Partial<HargaDasar>) => {
    if (editingItem) {
      updateItem(editingItem.id, formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-[1.5rem] animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[1rem]">
        <div>
          <h1 className="text-[1.5rem] font-bold text-gray-900">Master Harga Dasar</h1>
          <p className="text-[0.875rem] text-gray-500">Kelola harga dasar untuk setiap jenis layanan pemeriksaan.</p>
        </div>
      </div>

      <div className="bg-white p-[1.25rem] rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-[1rem] max-w-md mb-[1.5rem]">
          <div className="relative flex-1">
            <Search className="absolute left-[0.75rem] top-1/2 -translate-y-1/2 h-[1rem] w-[1rem] text-gray-400" />
            <Input 
              placeholder="Cari layanan..." 
              className="pl-[2.25rem]" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 overflow-hidden">
          <HargaDasarTable 
            data={data} 
            onEdit={handleEdit} 
          />
        </div>
      </div>

      <PopUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Harga Dasar"
        maxWidth="max-w-md"
      >
        <HargaDasarForm 
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </PopUpModal>
    </div>
  );
}
