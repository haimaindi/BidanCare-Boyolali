import { Patient, VisitLog } from "../types";
import { Button } from "../../../ui/components/elements/Button";
import { ArrowLeft, Edit2, Trash2, ClipboardList } from "lucide-react";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Input } from "../../../ui/components/elements/Input";

interface PatientDetailViewProps {
  patient: Patient;
  onBack: () => void;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onViewLogs: () => void;
}

export function PatientDetailView({ patient, onBack, onEdit, onDelete, onViewLogs }: PatientDetailViewProps) {
  // Helper to render readonly inputs
  const ReadonlyField = ({ label, value }: { label: string, value?: string }) => (
    <FormGroup id={label.toLowerCase().replace(/\s/g, "-")} label={label}>
      <Input value={value || "-"} readOnly className="bg-gray-50 border-gray-100 cursor-default" />
    </FormGroup>
  );

  return (
    <div className="space-y-[2rem] animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[80rem] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[1rem]">
        <div className="flex items-center gap-[0.5rem]">
          <Button variant="ghost" onClick={onBack} className="-ml-[0.75rem]">
            <ArrowLeft className="mr-[0.5rem] h-[1rem] w-[1rem]" />
            Kembali
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Detail Profil Pasien</h2>
        </div>
        <div className="flex flex-wrap gap-[0.75rem]">
          <Button variant="outline" onClick={onViewLogs} className="border-purple-200 text-purple-700 hover:bg-purple-50">
            <ClipboardList className="mr-[0.5rem] h-[1rem] w-[1rem]" />
            Lihat Log Kunjungan
          </Button>
          <Button variant="outline" onClick={() => onEdit(patient)} className="border-amber-200 text-amber-700 hover:bg-amber-50">
            <Edit2 className="mr-[0.5rem] h-[1rem] w-[1rem]" />
            Edit Data
          </Button>
          <Button variant="outline" onClick={() => onDelete(patient.id)} className="border-rose-200 text-rose-600 hover:bg-rose-50">
            <Trash2 className="mr-[0.5rem] h-[1rem] w-[1rem]" />
            Hapus Pasien
          </Button>
        </div>
      </div>

      <div className="bg-white p-[2rem] rounded-xl shadow-sm border border-gray-100 space-y-[2.5rem]">
        {/* Identitas Utama */}
        <section className="space-y-[1.5rem]">
          <h3 className="text-lg font-semibold text-purple-800 border-b pb-[0.5rem] flex items-center gap-[0.5rem]">
            <span className="h-[1rem] w-[0.25rem] bg-purple-600 rounded-full"></span>
            Identitas Dasar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1.5rem]">
            <ReadonlyField label="No. Rekam Medis" value={patient.noRm} />
            <ReadonlyField label="NIK" value={patient.nik} />
            <ReadonlyField label="No. KK" value={patient.kk} />
            <ReadonlyField label="No. BPJS" value={patient.noBpjs} />
            <ReadonlyField label="Panggilan" value={patient.panggilan} />
            <div className="lg:col-span-2">
              <ReadonlyField label="Nama Lengkap" value={patient.nama} />
            </div>
            <ReadonlyField label="Jenis Kelamin" value={patient.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"} />
          </div>
        </section>

        {/* Profil Kelahiran & Pekerjaan */}
        <section className="space-y-[1.5rem]">
          <h3 className="text-lg font-semibold text-purple-800 border-b pb-[0.5rem] flex items-center gap-[0.5rem]">
            <span className="h-[1rem] w-[0.25rem] bg-purple-600 rounded-full"></span>
            Profil & Kelahiran
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1.5rem]">
            <ReadonlyField label="Provinsi" value={patient.provinsi} />
            <ReadonlyField label="Kabupaten / Kota" value={patient.kabupaten} />
            <ReadonlyField label="Kecamatan" value={patient.kecamatan} />
            <ReadonlyField label="Tempat Lahir" value={patient.tempatLahir} />
            <ReadonlyField label="Tanggal Lahir" value={patient.tanggalLahir} />
            <ReadonlyField label="Golongan Darah" value={patient.golDarah} />
            <ReadonlyField label="Pekerjaan" value={patient.pekerjaan} />
            <ReadonlyField label="No. Whatsapp" value={patient.noWhatsapp} />
          </div>
        </section>

        {/* Domisili */}
        <section className="space-y-[1.5rem]">
          <h3 className="text-lg font-semibold text-purple-800 border-b pb-[0.5rem] flex items-center gap-[0.5rem]">
            <span className="h-[1rem] w-[0.25rem] bg-purple-600 rounded-full"></span>
            Alamat & Faskes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1.5rem]">
            <div className="md:col-span-2 lg:col-span-3">
              <ReadonlyField label="Alamat" value={patient.alamat} />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <ReadonlyField label="Puskesmas" value={patient.puskesmas} />
            </div>
          </div>
        </section>

        {/* Data Keluarga */}
        <section className="space-y-[1.5rem]">
          <h3 className="text-lg font-semibold text-purple-800 border-b pb-[0.5rem] flex items-center gap-[0.5rem]">
            <span className="h-[1rem] w-[0.25rem] bg-purple-600 rounded-full"></span>
            Data Keluarga
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1.5rem]">
            <ReadonlyField label="Nama Suami / Istri" value={patient.namaSuamiIstri} />
            <ReadonlyField label="NIK Suami" value={patient.nikSuami} />
            <ReadonlyField label="No telpon Suami/Istri" value={patient.noTelpSuami} />
            <ReadonlyField label="Nama Orang Tua" value={patient.namaOrangTua} />
            <ReadonlyField label="NIK Orang Tua" value={patient.nikOrangTua} />
            <ReadonlyField label="No telpon Orangtua" value={patient.noTelpOrangTua} />
          </div>
        </section>

        {/* Catatan Khusus */}
        <section className="space-y-[1.5rem]">
          <h3 className="text-lg font-semibold text-rose-700 border-b pb-[0.5rem] flex items-center gap-[0.5rem]">
            <span className="h-[1rem] w-[0.25rem] bg-rose-500 rounded-full"></span>
            Catatan Khusus
          </h3>
          <div className="p-[1.25rem] bg-rose-50 border border-rose-100 rounded-lg">
            <p className="text-sm text-rose-800 italic leading-relaxed">
              {patient.catatanKhusus || "Tidak ada catatan khusus."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
