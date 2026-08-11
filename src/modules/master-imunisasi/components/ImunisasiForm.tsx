import { useState, useEffect, FormEvent } from "react";
import { ImunisasiData } from "../types";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Input } from "../../../ui/components/elements/Input";
import { Textarea } from "../../../ui/components/elements/Textarea";

interface ImunisasiFormProps {
  initialData: ImunisasiData | null;
  onSubmit: (data: Omit<ImunisasiData, "id">) => void;
  onCancel: () => void;
}

export function ImunisasiForm({ initialData, onSubmit, onCancel }: ImunisasiFormProps) {
  const [nama, setNama] = useState("");
  const [keterangan, setKeterangan] = useState("");

  useEffect(() => {
    if (initialData) {
      setNama(initialData.nama);
      setKeterangan(initialData.keterangan || "");
    } else {
      setNama("");
      setKeterangan("");
    }
  }, [initialData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ nama, keterangan });
  };

  return (
    <form id="imunisasi-master-form" onSubmit={handleSubmit} className="space-y-[1rem]">
      <FormGroup id="imun-nama" label="Nama Imunisasi" required>
        <Input
          id="imun-nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: BCG, DPT, Polio..."
          required
        />
      </FormGroup>

      <FormGroup id="imun-ket" label="Keterangan (Opsional)">
        <Textarea
          id="imun-ket"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          placeholder="Masukkan keterangan singkat mengenai imunisasi ini"
        />
      </FormGroup>
    </form>
  );
}
