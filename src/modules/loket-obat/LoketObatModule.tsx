import React, { useState } from "react";
import { PrescriptionTable } from "./components/PrescriptionTable";
import { PrescriptionForm } from "./components/PrescriptionForm";
import { LoketObatEntry } from "./types";
import { useLoketObat } from "../../logic/hooks/useLoketObat.js";

export default function LoketObatModule() {
  const [view, setView] = useState<"table" | "form">("table");
  const [editingEntry, setEditingEntry] = useState<LoketObatEntry | null>(null);

  const { data, loading, save, updateStatus } = useLoketObat();

  const handleDetail = (entry: LoketObatEntry) => {
    setEditingEntry(entry);
    setView("form");
  };

  const handlePrepare = async (id: string) => {
    try {
      await updateStatus(id, "Disiapkan");
    } catch (err) {
      console.error("Gagal menyiapkan obat:", err);
    }
  };

  const handleFinish = async (id: string) => {
    try {
      await updateStatus(id, "Selesai");
    } catch (err) {
      console.error("Gagal menyelesaikan pesanan obat:", err);
    }
  };

  const handleAdd = () => {
    setEditingEntry(null);
    setView("form");
  };

  const handleBack = () => {
    setView("table");
    setEditingEntry(null);
  };

  const handleSubmitForm = async (formData: Partial<LoketObatEntry>) => {
    try {
      if (editingEntry) {
        await save({ ...formData, id: editingEntry.id });
      } else {
        const newId = `LO-${Date.now()}`;
        await save({
          ...formData,
          id: newId,
          waktuPesan: new Date().toISOString(),
          status: "Menunggu",
        });
      }
      setView("table");
      setEditingEntry(null);
    } catch (err) {
      console.error("Gagal menyimpan pesanan obat:", err);
    }
  };

  return (
    <div className="p-[1.5rem] animate-in fade-in duration-300">
      {loading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-[2rem] w-[2rem] border-b-2 border-purple-700 text-purple-700"></div>
        </div>
      )}
      {view === "table" ? (
        <PrescriptionTable
          data={data}
          onDetail={handleDetail}
          onPrepare={handlePrepare}
          onFinish={handleFinish}
          onAdd={handleAdd}
        />
      ) : (
        <PrescriptionForm
          onClose={handleBack}
          onSubmit={handleSubmitForm}
          initialData={editingEntry}
        />
      )}
    </div>
  );
}
