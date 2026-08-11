import React from "react";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Textarea } from "../../../ui/components/elements/Textarea";
import { Button } from "../../../ui/components/elements/Button";

interface TemplateFormProps {
  initialContent?: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  title: string;
}

export function TemplateForm({ initialContent, onSave, onCancel, title }: TemplateFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSave(formData.get("content") as string);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[1.5rem]">
      <div className="p-[1rem] bg-gray-50 border border-gray-100 rounded-lg">
        <p className="text-sm font-bold text-gray-700">{title}</p>
      </div>

      <FormGroup id="template-content" label="Isi Pesan Broadcast">
        <div className="space-y-[0.5rem]">
          <Textarea
            id="template-content"
            name="content"
            defaultValue={initialContent}
            rows={6}
            required
            placeholder="Contoh: Halo {{A}}, kami dari Puskesmas..."
          />
          <div className="p-[0.75rem] bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
            <p className="font-bold mb-[0.25rem]">Informasi Placeholder (kirimpesan.net):</p>
            <ul className="list-disc list-inside space-y-[0.125rem]">
              <li><code className="bg-blue-100 px-1 rounded">{"{{A}}"}</code> : Nama Pasien</li>
              <li><code className="bg-blue-100 px-1 rounded">{"{{B}}"}</code> : Tanggal Kunjungan / Jadwal Kembali</li>
              <li><code className="bg-blue-100 px-1 rounded">{"{{C}}"}</code> : Jenis Layanan</li>
            </ul>
          </div>
        </div>
      </FormGroup>

      <div className="flex justify-end gap-[1rem]">
        <Button variant="outline" type="button" onClick={onCancel}>Batal</Button>
        <Button variant="primary" type="submit">Simpan Perubahan</Button>
      </div>
    </form>
  );
}
