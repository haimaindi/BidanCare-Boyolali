import React, { useState, useEffect } from "react";
import { Patient } from "../types";
import { Input } from "../../../ui/components/elements/Input";
import { Select } from "../../../ui/components/elements/Select";
import { Button } from "../../../ui/components/elements/Button";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { ComboBox } from "../../../ui/components/elements/ComboBox";
import { useRegionData } from "../../../logic/hooks/useRegionData";

interface PatientFormProps {
  initialData?: Patient | null;
  onSubmit: (data: Partial<Patient>) => void;
  onCancel: () => void;
}

export function PatientForm({ initialData, onSubmit, onCancel }: PatientFormProps) {
  const { 
    provinces, regencies, districts, villages, 
    fetchRegencies, fetchDistricts, fetchVillages,
    loading 
  } = useRegionData();

  const {
    provinces: tlProvinces,
    regencies: tlRegencies,
    fetchRegencies: fetchTlRegencies,
    loading: tlLoading
  } = useRegionData();

  const [formData, setFormData] = useState<Partial<Patient>>({
    noRm: `RM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
    nik: "",
    kk: "",
    noBpjs: "",
    panggilan: "",
    nama: "",
    provinsiLahir: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "L",
    golDarah: "",
    pekerjaan: "",
    noWhatsapp: "",
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    alamat: "",
    puskesmas: "",
    namaSuamiIstri: "",
    nikSuami: "",
    noTelpSuami: "",
    namaOrangTua: "",
    nikOrangTua: "",
    noTelpOrangTua: "",
    catatanKhusus: "",
    penjamin: "Mandiri",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      // Pre-fetch region data if editing
      if (initialData.provinsi) fetchRegencies(initialData.provinsi);
      if (initialData.kabupaten) fetchDistricts(initialData.kabupaten);
      if (initialData.kecamatan) fetchVillages(initialData.kecamatan);
      
      if (initialData.provinsiLahir) fetchTlRegencies(initialData.provinsiLahir);
    }
  }, [initialData]);

  const handleChange = (field: keyof Patient, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: keyof Patient) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handlePhoneChange = (field: keyof Patient) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    const formatted = val.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[2rem]">
      {/* Identitas Dasar */}
      <section className="space-y-[1.5rem]">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-[0.5rem]">Identitas Pasien</h3>
        <div className="grid grid-cols-1 gap-[1.5rem] md:grid-cols-2 lg:grid-cols-3">
          <FormGroup id="noRm" label="No. Rekam Medis" required>
            <Input
              id="noRm"
              value={formData.noRm}
              onChange={(e) => handleChange("noRm", e.target.value)}
              placeholder="RM-XXXX"
              required
            />
          </FormGroup>
          <FormGroup id="nik" label="NIK" required>
            <Input
              id="nik"
              value={formData.nik}
              onChange={handleNumberChange("nik")}
              placeholder="16 digit NIK"
              maxLength={16}
              required
            />
          </FormGroup>
          <FormGroup id="kk" label="No KK">
            <Input
              id="kk"
              value={formData.kk}
              onChange={handleNumberChange("kk")}
              placeholder="16 digit No KK"
              maxLength={16}
            />
          </FormGroup>
          <FormGroup id="noBpjs" label="No BPJS">
            <Input
              id="noBpjs"
              value={formData.noBpjs}
              onChange={handleNumberChange("noBpjs")}
              placeholder="Nomor kartu BPJS"
            />
          </FormGroup>
          <FormGroup id="panggilan" label="Panggilan" required>
            <Select
              id="panggilan"
              value={formData.panggilan}
              onChange={(e) => handleChange("panggilan", e.target.value)}
              required
              options={[
                { label: "Pilih", value: "" },
                { label: "Tn.", value: "Tn." },
                { label: "Ny.", value: "Ny." },
                { label: "Nn.", value: "Nn." },
                { label: "Sdr.", value: "Sdr." },
                { label: "Sdri.", value: "Sdri." },
                { label: "An.", value: "An." },
                { label: "By.", value: "By." },
              ]}
            />
          </FormGroup>
          <FormGroup id="nama" label="Nama Lengkap" required>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => handleChange("nama", e.target.value)}
              placeholder="Sesuai KTP"
              required
            />
          </FormGroup>
        </div>
      </section>

      {/* Detail Kelahiran */}
      <section className="space-y-[1.5rem]">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-[0.5rem]">Detail Kelahiran & Profil</h3>
        <div className="grid grid-cols-1 gap-[1.5rem] md:grid-cols-2 lg:grid-cols-3">
          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="provinsiLahir" label="Prov. Lahir" required>
              <Select
                id="provinsiLahir"
                value={formData.provinsiLahir}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange("provinsiLahir", val);
                  fetchTlRegencies(val);
                }}
                required
              >
                <option value="">{tlLoading.provinces ? "Loading..." : "Pilih Prov"}</option>
                {tlProvinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </FormGroup>
            <FormGroup id="tempatLahir" label="Kota Lahir" required>
              <Select
                id="tempatLahir"
                value={formData.tempatLahir}
                onChange={(e) => handleChange("tempatLahir", e.target.value)}
                disabled={!formData.provinsiLahir}
                required
              >
                <option value="">{tlLoading.regencies ? "Loading..." : "Pilih Kota"}</option>
                {tlRegencies.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </Select>
            </FormGroup>
          </div>
          <FormGroup id="tanggalLahir" label="Tanggal Lahir" required>
            <Input
              id="tanggalLahir"
              type="date"
              value={formData.tanggalLahir}
              onChange={(e) => handleChange("tanggalLahir", e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup id="jenisKelamin" label="Jenis Kelamin" required>
            <Select
              id="jenisKelamin"
              value={formData.jenisKelamin}
              onChange={(e) => handleChange("jenisKelamin", e.target.value)}
              options={[
                { label: "Laki-laki", value: "L" },
                { label: "Perempuan", value: "P" },
              ]}
              required
            />
          </FormGroup>
          <FormGroup id="golDarah" label="Golongan Darah">
            <Select
              id="golDarah"
              value={formData.golDarah}
              onChange={(e) => handleChange("golDarah", e.target.value)}
              options={[
                { label: "Pilih", value: "" },
                { label: "A", value: "A" },
                { label: "B", value: "B" },
                { label: "AB", value: "AB" },
                { label: "O", value: "O" },
                { label: "Belum Tahu", value: "Belum Tahu" },
              ]}
            />
          </FormGroup>
          <FormGroup id="pekerjaan" label="Pekerjaan">
            <ComboBox 
              id="pekerjaan" 
              value={formData.pekerjaan || ""} 
              onChange={(val) => handleChange("pekerjaan", val)} 
              options={["Ibu Rumah Tangga", "PNS", "TNI/POLRI", "Pegawai Swasta", "Wiraswasta / Pengusaha", "Petani / Peternak", "Nelayan", "Pelajar / Mahasiswa", "Tidak / Belum Bekerja"]}
              placeholder="Pilih atau ketik pekerjaan" 
            />
          </FormGroup>
          <FormGroup id="noWhatsapp" label="No Whatsapp">
            <Input
              id="noWhatsapp"
              value={formData.noWhatsapp}
              onChange={handlePhoneChange("noWhatsapp")}
              placeholder="081 234 567 890"
              type="tel"
            />
          </FormGroup>
        </div>
      </section>

      {/* Alamat */}
      <section className="space-y-[1.5rem]">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-[0.5rem]">Alamat & Domisili</h3>
        <div className="grid grid-cols-1 gap-[1.5rem] md:grid-cols-2 lg:grid-cols-4">
          <FormGroup id="provinsi" label="Provinsi" required>
            <Select
              id="provinsi"
              value={formData.provinsi}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("provinsi", val);
                fetchRegencies(val);
              }}
              required
            >
              <option value="">{loading.provinces ? "Loading..." : "Pilih Provinsi"}</option>
              {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </FormGroup>
          <FormGroup id="kabupaten" label="Kabupaten / Kota" required>
            <Select
              id="kabupaten"
              value={formData.kabupaten}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("kabupaten", val);
                fetchDistricts(val);
              }}
              disabled={!formData.provinsi}
              required
            >
              <option value="">{loading.regencies ? "Loading..." : "Pilih Kabupaten"}</option>
              {regencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </FormGroup>
          <FormGroup id="kecamatan" label="Kecamatan" required>
            <Select
              id="kecamatan"
              value={formData.kecamatan}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("kecamatan", val);
              }}
              disabled={!formData.kabupaten}
              required
            >
              <option value="">{loading.districts ? "Loading..." : "Pilih Kecamatan"}</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </FormGroup>
          <div className="lg:col-span-4">
            <FormGroup id="alamat" label="Alamat Detail" required>
              <Input
                id="alamat"
                value={formData.alamat}
                onChange={(e) => handleChange("alamat", e.target.value)}
                placeholder="Nama Jalan, RT/RW, No. Rumah"
                required
              />
            </FormGroup>
          </div>
          <div className="lg:col-span-4">
            <FormGroup id="puskesmas" label="Puskesmas" required>
              <ComboBox 
                id="puskesmas" 
                value={formData.puskesmas || ""} 
                onChange={(val) => handleChange("puskesmas", val)} 
                options={["Puskesmas Kecamatan", "Puskesmas Kelurahan", "Puskesmas Pembantu (Pustu)"]}
                placeholder="Ketik atau pilih puskesmas rujukan/terdekat" 
                required 
              />
            </FormGroup>
          </div>
        </div>
      </section>

      {/* Data Keluarga */}
      <section className="space-y-[1.5rem]">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-[0.5rem]">Data Keluarga</h3>
        <div className="grid grid-cols-1 gap-[1.5rem] md:grid-cols-2">
          <FormGroup id="namaSuamiIstri" label="Nama Suami / Istri">
            <Input
              id="namaSuamiIstri"
              value={formData.namaSuamiIstri}
              onChange={(e) => handleChange("namaSuamiIstri", e.target.value)}
              placeholder="Nama Pasangan"
            />
          </FormGroup>
          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="nikSuami" label="NIK Pasangan">
              <Input
                id="nikSuami"
                value={formData.nikSuami}
                onChange={handleNumberChange("nikSuami")}
                placeholder="16 digit NIK"
                maxLength={16}
              />
            </FormGroup>
            <FormGroup id="noTelpSuami" label="No Telp Pasangan">
              <Input
                id="noTelpSuami"
                value={formData.noTelpSuami}
                onChange={handlePhoneChange("noTelpSuami")}
                placeholder="081 234 567 890"
              />
            </FormGroup>
          </div>
          <FormGroup id="namaOrangTua" label="Nama Orang Tua">
            <Input
              id="namaOrangTua"
              value={formData.namaOrangTua}
              onChange={(e) => handleChange("namaOrangTua", e.target.value)}
              placeholder="Nama Ayah/Ibu"
            />
          </FormGroup>
          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="nikOrangTua" label="NIK Orang Tua">
              <Input
                id="nikOrangTua"
                value={formData.nikOrangTua}
                onChange={handleNumberChange("nikOrangTua")}
                placeholder="16 digit NIK"
                maxLength={16}
              />
            </FormGroup>
            <FormGroup id="noTelpOrangTua" label="No Telp Orang Tua">
              <Input
                id="noTelpOrangTua"
                value={formData.noTelpOrangTua}
                onChange={handlePhoneChange("noTelpOrangTua")}
                placeholder="081 234 567 890"
              />
            </FormGroup>
          </div>
        </div>
      </section>

      {/* Catatan */}
      <section className="space-y-[1.5rem]">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-[0.5rem]">Lainnya</h3>
        <div className="grid grid-cols-1 gap-[1.5rem] md:grid-cols-2">
          <FormGroup id="catatanKhusus" label="Catatan Khusus">
            <textarea
              id="catatanKhusus"
              value={formData.catatanKhusus}
              onChange={(e) => handleChange("catatanKhusus", e.target.value)}
              placeholder="Alergi, riwayat penyakit kronis, dll"
              rows={3}
              className="flex w-full rounded-md border border-gray-200 bg-transparent px-[0.75rem] py-[0.5rem] text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-700"
            />
          </FormGroup>
        </div>
      </section>

      <div className="flex justify-end gap-[0.75rem] pt-[1.5rem] border-t">
        <Button variant="ghost" onClick={onCancel} type="button">
          Batal
        </Button>
        <Button type="submit">
          {initialData ? "Simpan Perubahan" : "Daftarkan Pasien"}
        </Button>
      </div>
    </form>
  );
}
