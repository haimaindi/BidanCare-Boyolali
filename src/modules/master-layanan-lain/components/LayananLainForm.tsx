import { useState, useEffect, FormEvent } from "react";
import { LayananLainData } from "../types";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Input } from "../../../ui/components/elements/Input";
import { PriceInput } from "../../../ui/components/elements/PriceInput";
import { Textarea } from "../../../ui/components/elements/Textarea";

interface LayananLainFormProps {
  initialData: LayananLainData | null;
  onSubmit: (data: Omit<LayananLainData, "id">) => void;
  onCancel: () => void;
}

export function LayananLainForm({ initialData, onSubmit, onCancel }: LayananLainFormProps) {
  const [nama, setNama] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [harga, setHarga] = useState(0);

  useEffect(() => {
    if (initialData) {
      setNama(initialData.nama);
      setKeterangan(initialData.keterangan);
      setHarga(initialData.harga);
    } else {
      setNama("");
      setKeterangan("");
      setHarga(0);
    }
  }, [initialData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ nama, keterangan, harga });
  };

  return (
    <form id="layanan-lain-master-form" onSubmit={handleSubmit} className="space-y-[1rem]">
      <FormGroup id="layanan-nama" label="Nama Layanan" required>
        <Input
          id="layanan-nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Hecting, Nebulizer, dll..."
          required
        />
      </FormGroup>

      <FormGroup id="layanan-ket" label="Keterangan" required>
        <Textarea
          id="layanan-ket"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          placeholder="Deskripsi singkat layanan"
          required
        />
      </FormGroup>

      <FormGroup id="layanan-harga" label="Harga Layanan" required>
        <PriceInput
          id="layanan-harga"
          value={harga}
          onChange={(e: any) => setHarga(Number(e.target.value))}
          placeholder="0"
          required
        />
      </FormGroup>
    </form>
  );
}
