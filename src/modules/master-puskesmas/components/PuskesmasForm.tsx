import { useState, useEffect, FormEvent } from "react";
import { PuskesmasData } from "../types";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Input } from "../../../ui/components/elements/Input";
import { Textarea } from "../../../ui/components/elements/Textarea";

interface PuskesmasFormProps {
  initialData: PuskesmasData | null;
  onSubmit: (data: Omit<PuskesmasData, "id">) => void;
  onCancel: () => void;
}

export function PuskesmasForm({ initialData, onSubmit, onCancel }: PuskesmasFormProps) {
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [noTelepon, setNoTelepon] = useState("");

  useEffect(() => {
    if (initialData) {
      setNama(initialData.nama);
      setAlamat(initialData.alamat);
      setNoTelepon(initialData.noTelepon);
    } else {
      setNama("");
      setAlamat("");
      setNoTelepon("");
    }
  }, [initialData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ nama, alamat, noTelepon });
  };

  return (
    <form id="puskesmas-master-form" onSubmit={handleSubmit} className="space-y-[1rem]">
      <FormGroup id="pusk-nama" label="Nama Puskesmas" required>
        <Input
          id="pusk-nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Masukkan nama puskesmas..."
          required
        />
      </FormGroup>

      <FormGroup id="pusk-alamat" label="Alamat Lengkap" required>
        <Textarea
          id="pusk-alamat"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          placeholder="Masukkan alamat lengkap puskesmas..."
          required
        />
      </FormGroup>

      <FormGroup id="pusk-telp" label="No. Telepon" required>
        <Input
          id="pusk-telp"
          value={noTelepon}
          onChange={(e) => setNoTelepon(e.target.value)}
          placeholder="Contoh: 021-xxxxxxx"
          required
        />
      </FormGroup>
    </form>
  );
}
