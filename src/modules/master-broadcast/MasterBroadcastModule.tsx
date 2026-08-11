import { useState } from "react";
import { Card } from "../../ui/components/common/Card";
import { PopUpModal } from "../../ui/components/common/PopUpModal";
import { BroadcastConfigTable } from "./components/BroadcastConfigTable";
import { TemplateForm } from "./components/TemplateForm";
import { tokens } from "../../ui/styles/tokens";
import { useMasterBroadcast } from "../../logic/hooks/useMasterBroadcast.js";

export function MasterBroadcastModule() {
  const { data: configs, updateItem } = useMasterBroadcast({ strategy: 'full' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<{ id: string; type: "Follow Up" | "Reminder" } | null>(null);

  const handleUpdateConfig = (id: string, field: "followUpDays" | "reminderDays", value: number | null) => {
    updateItem(id, { [field]: value });
  };

  const handleEditTemplate = (id: string, type: "Follow Up" | "Reminder") => {
    setEditingContext({ id, type });
    setIsModalOpen(true);
  };

  const handleSaveTemplate = (content: string) => {
    if (editingContext) {
      const field = editingContext.type === "Follow Up" ? "followUpTemplate" : "reminderTemplate";
      updateItem(editingContext.id, { [field]: content });
    }
    setIsModalOpen(false);
    setEditingContext(null);
  };

  const currentConfig = configs.find(c => c.id === editingContext?.id);
  const initialContent = editingContext?.type === "Follow Up" ? currentConfig?.followUpTemplate : currentConfig?.reminderTemplate;

  return (
    <div className="space-y-[1.5rem]">
      <div className="flex flex-col gap-[0.5rem]">
        <h2 className={tokens.typography.h2}>Master Broadcast</h2>
        <p className={tokens.colors.text.muted}>Atur jadwal dan template pesan follow-up & reminder pasien berdasarkan jenis layanan.</p>
      </div>

      <Card className="p-[1.5rem]">
        <BroadcastConfigTable 
          data={configs} 
          onUpdate={handleUpdateConfig} 
          onEditTemplate={handleEditTemplate}
        />
      </Card>

      <PopUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Template Pesan"
        maxWidth="max-w-2xl"
      >
        {editingContext && (
          <TemplateForm 
            title={`${editingContext.type} - ${currentConfig?.category}`}
            initialContent={initialContent}
            onSave={handleSaveTemplate}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
      </PopUpModal>
    </div>
  );
}
