import React, { useState, useEffect } from "react";
import { HargaDasar } from "../types";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Input } from "../../../ui/components/elements/Input";
import { PriceInput } from "../../../ui/components/elements/PriceInput";
import { Select } from "../../../ui/components/elements/Select";
import { Button } from "../../../ui/components/elements/Button";

interface HargaDasarFormProps {
  initialData?: HargaDasar | null;
  onSubmit: (data: Partial<HargaDasar>) => void;
  onCancel: () => void;
}

const LAYANAN_OPTIONS = [
  "Umum", "KB", "Imunisasi", 
  "AnteNatal - Tanpa USG", "AnteNatal - USG 2D", "AnteNatal - USG 4D", 
  "Persalinan", 
  "Post Natal - KF", "Post Natal - KN", "Post Natal - Akhir Nifas", 
  "Mom & Baby Care"
];

export function HargaDasarForm({ initialData, onSubmit, onCancel }: HargaDasarFormProps) {
  const [formData, setFormData] = useState<Partial<HargaDasar>>({
    namaLayanan: "",
    hargaDasar: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[1.5rem]">
      <FormGroup id="namaLayanan" label="Nama Layanan" required>
        <Select 
          id="namaLayanan" 
          value={formData.namaLayanan} 
          onChange={(e) => setFormData(prev => ({ ...prev, namaLayanan: e.target.value }))}
          required
        >
          <option value="">Pilih Layanan</option>
          {LAYANAN_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup id="hargaDasar" label="Harga Dasar (Rp)" required>
        <PriceInput 
          id="hargaDasar"
          value={formData.hargaDasar || 0}
          onChange={(val) => setFormData(prev => ({ ...prev, hargaDasar: val }))}
          required
        />
      </FormGroup>

      <div className="flex items-center justify-end gap-[0.75rem] pt-[1rem] border-t border-gray-100">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Batal
        </Button>
        <Button variant="primary" type="submit">
          {initialData ? "Simpan Perubahan" : "Tambah Harga Dasar"}
        </Button>
      </div>
    </form>
  );
}
