import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../ui/components/common/Card";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Input } from "../../../ui/components/elements/Input";
import { Select } from "../../../ui/components/elements/Select";
import { Button } from "../../../ui/components/elements/Button";
import { ComboBox } from "../../../ui/components/elements/ComboBox";
import { useRegionData } from "../../../logic/hooks/useRegionData";
import { useMasterRekamMedis } from "../../../logic/hooks/useMasterRekamMedis";
import { cn } from "../../../logic/utils/cn";

interface PendaftaranOnlineFormProps {
  onSubmitSuccess: () => void;
}

export function PendaftaranOnlineForm({ onSubmitSuccess }: PendaftaranOnlineFormProps) {
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

  const { getPatientByNIK } = useMasterRekamMedis();
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [checkingNik, setCheckingNik] = useState(false);

  const [formData, setFormData] = useState({
    estimasiWaktu: "",
    jenisLayanan: "",
    nik: "",
    kk: "",
    noBpjs: "",
    jenisPanggilan: "",
    namaPasien: "",
    provinsiLahir: "",
    tempatLahir: "",
    tanggalLahir: "",
    golDarah: "",
    pekerjaan: "",
    noWhatsapp: "",
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    kelurahan: "",
    alamat: "",
    namaSuamiIstri: "",
    nikSuami: "",
    noTelpSuami: "",
    namaOrangTua: "",
    nikOrangTua: "",
    noTelpOrangTua: "",
  });

  // Remove the useEffect that sets datetime

  const getMinDateTime = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const handleNumberChange = (field: keyof typeof formData) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, [field]: val }));

    if (field === "nik" && val.length === 16) {
      setCheckingNik(true);
      try {
        const patient = await getPatientByNIK(val);
        if (patient) {
          setIsExistingPatient(true);
          // Pre-fill form with existing patient data
          setFormData(prev => ({
            ...prev,
            kk: patient.kk || prev.kk,
            noBpjs: patient.noBpjs || prev.noBpjs,
            jenisPanggilan: patient.panggilan || prev.jenisPanggilan,
            namaPasien: patient.nama,
            tanggalLahir: patient.tanggalLahir,
            golDarah: patient.golDarah || prev.golDarah,
            pekerjaan: patient.pekerjaan || prev.pekerjaan,
            noWhatsapp: patient.noWhatsapp || prev.noWhatsapp,
            alamat: patient.alamat || prev.alamat,
          }));
          // Note: Region data (provinsi, etc) are IDs in the hook but might be names in the record. 
          // For simplicity and safety, we focus on main fields.
        } else {
          setIsExistingPatient(false);
        }
      } catch (err) {
        console.error("Check NIK error:", err);
      } finally {
        setCheckingNik(false);
      }
    } else if (field === "nik" && val.length < 16) {
      setIsExistingPatient(false);
    }
  };

  const handlePhoneChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    const formatted = val.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleProvinsiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, provinsi: val, kabupaten: "", kecamatan: "", kelurahan: "" }));
    fetchRegencies(val);
  };

  const handleKabupatenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, kabupaten: val, kecamatan: "", kelurahan: "" }));
    fetchDistricts(val);
  };

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, kecamatan: val, kelurahan: "" }));
    fetchVillages(val);
  };

  const handleProvinsiLahirChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, provinsiLahir: val, tempatLahir: "" }));
    fetchTlRegencies(val);
  };

  const isFormValid = !!(
    formData.estimasiWaktu &&
    formData.jenisLayanan &&
    formData.nik &&
    formData.jenisPanggilan &&
    formData.namaPasien &&
    formData.provinsiLahir &&
    formData.tempatLahir &&
    formData.tanggalLahir &&
    formData.golDarah &&
    formData.pekerjaan &&
    formData.provinsi &&
    formData.kabupaten &&
    formData.kecamatan &&
    formData.alamat
  );

  return (
    <Card>
      <CardContent className="pt-[1.5rem]">
        <form className="space-y-[2rem]" onSubmit={(e) => { e.preventDefault(); if(isFormValid) onSubmitSuccess(); }}>
          
          {/* Section 1: Kunjungan */}
          <div>
            <h3 className="mb-[1rem] text-lg font-semibold text-gray-900 border-b pb-[0.5rem]">Data Kunjungan</h3>
            <div className="grid grid-cols-1 gap-[1.5rem] md:grid-cols-2">
              <FormGroup id="jenisLayanan" label="Jenis Layanan" required>
                <Select id="jenisLayanan" value={formData.jenisLayanan} onChange={handleChange("jenisLayanan")} required>
                  <option value="">Pilih Layanan</option>
                  <option value="Umum">Umum</option>
                  <option value="KB">KB</option>
                  <option value="Imunisasi">Imunisasi</option>
                  <optgroup label="AnteNatal (Kehamilan)">
                    <option value="AnteNatal - Tanpa USG">AnteNatal (Kehamilan) - Tanpa USG</option>
                    <option value="AnteNatal - USG 2D">AnteNatal (Kehamilan) - USG 2D</option>
                    <option value="AnteNatal - USG 4D">AnteNatal (Kehamilan) - USG 4D</option>
                  </optgroup>
                  <option value="Persalinan">Persalinan</option>
                  <optgroup label="Post Natal (Pasca Salin)">
                    <option value="Post Natal - KF">Post Natal (Pasca Salin) - KF</option>
                    <option value="Post Natal - KN">Post Natal (Pasca Salin) - KN</option>
                    <option value="Post Natal - Akhir Nifas">Post Natal (Pasca Salin) - Akhir Nifas</option>
                  </optgroup>
                  <option value="Mom & Baby Care">Mom & Baby Care</option>
                </Select>
              </FormGroup>
              <FormGroup id="estimasiWaktu" label="Estimasi Waktu Kunjungan" required>
                <Input id="estimasiWaktu" type="datetime-local" value={formData.estimasiWaktu} onChange={handleChange("estimasiWaktu")} min={getMinDateTime()} required />
              </FormGroup>
            </div>
          </div>

          {/* Section 2: Identitas Pasien */}
          <div>
            <div className="flex items-center justify-between mb-[1rem] border-b pb-[0.5rem]">
              <h3 className="text-lg font-semibold text-gray-900">Identitas Pasien</h3>
              {formData.nik.length === 16 && !checkingNik && (
                <div className={cn(
                  "px-[0.75rem] py-[0.25rem] rounded-full text-[0.75rem] font-bold uppercase tracking-wider",
                  isExistingPatient ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                )}>
                  {isExistingPatient ? "PASIEN LAMA TERDETEKSI" : "PASIEN BARU"}
                </div>
              )}
              {checkingNik && (
                <div className="flex items-center gap-[0.5rem] text-[0.75rem] text-gray-500">
                  <div className="w-[0.75rem] h-[0.75rem] border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Memverifikasi NIK...
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-[1.5rem] md:grid-cols-2 xl:grid-cols-3">
              <FormGroup id="nik" label="NIK" required>
                <Input id="nik" value={formData.nik} onChange={handleNumberChange("nik")} placeholder="16 Digit NIK" required maxLength={16} />
              </FormGroup>
              <FormGroup id="kk" label="No KK">
                <Input id="kk" value={formData.kk} onChange={handleNumberChange("kk")} placeholder="16 Digit KK" maxLength={16} />
              </FormGroup>
              <FormGroup id="noBpjs" label="No BPJS">
                <Input id="noBpjs" value={formData.noBpjs} onChange={handleNumberChange("noBpjs")} placeholder="Nomor BPJS (Opsional)" />
              </FormGroup>
              <FormGroup id="jenisPanggilan" label="Jenis Panggilan" required>
                <Select id="jenisPanggilan" value={formData.jenisPanggilan} onChange={handleChange("jenisPanggilan")} required>
                  <option value="">Pilih</option>
                  <option value="Ny.">Ny. (Nyonya)</option>
                  <option value="Nn.">Nn. (Nona)</option>
                  <option value="Sdr.">Sdr. (Saudara)</option>
                  <option value="Sdri.">Sdri. (Saudari)</option>
                  <option value="An.">An. (Anak)</option>
                  <option value="By.">By. (Bayi)</option>
                  <option value="Tn.">Tn. (Tuan)</option>
                </Select>
              </FormGroup>
              <FormGroup id="namaPasien" label="Nama Pasien" required>
                <Input id="namaPasien" value={formData.namaPasien} onChange={handleChange("namaPasien")} placeholder="Sesuai Identitas" required />
              </FormGroup>
              <div className="grid grid-cols-2 gap-[1rem]">
                <FormGroup id="provinsiLahir" label="Prov. Lahir" required>
                  <Select id="provinsiLahir" value={formData.provinsiLahir} onChange={handleProvinsiLahirChange} required>
                    <option value="">{tlLoading.provinces ? "Loading..." : "Pilih Prov"}</option>
                    {tlProvinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup id="tempatLahir" label="Kota/Kab Lahir" required>
                  <Select id="tempatLahir" value={formData.tempatLahir} onChange={handleChange("tempatLahir")} disabled={!formData.provinsiLahir} required>
                    <option value="">{tlLoading.regencies ? "Loading..." : "Pilih Kota"}</option>
                    {tlRegencies.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </Select>
                </FormGroup>
              </div>
              <FormGroup id="tanggalLahir" label="Tanggal Lahir" required>
                <Input id="tanggalLahir" type="date" value={formData.tanggalLahir} onChange={handleChange("tanggalLahir")} required />
              </FormGroup>
              <FormGroup id="golDarah" label="Golongan Darah" required>
                <Select id="golDarah" value={formData.golDarah} onChange={handleChange("golDarah")} required>
                  <option value="">Pilih</option>
                  <optgroup label="Golongan A">
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="A (Tidak Tahu Rhesus)">A (Tidak Tahu Rhesus)</option>
                  </optgroup>
                  <optgroup label="Golongan B">
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="B (Tidak Tahu Rhesus)">B (Tidak Tahu Rhesus)</option>
                  </optgroup>
                  <optgroup label="Golongan AB">
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="AB (Tidak Tahu Rhesus)">AB (Tidak Tahu Rhesus)</option>
                  </optgroup>
                  <optgroup label="Golongan O">
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="O (Tidak Tahu Rhesus)">O (Tidak Tahu Rhesus)</option>
                  </optgroup>
                  <option value="Belum Tahu">Belum Tahu</option>
                </Select>
              </FormGroup>
              <FormGroup id="pekerjaan" label="Pekerjaan" required>
                <ComboBox 
                  id="pekerjaan" 
                  value={formData.pekerjaan} 
                  onChange={(val) => setFormData(prev => ({...prev, pekerjaan: val}))} 
                  options={["Ibu Rumah Tangga", "PNS", "TNI/POLRI", "Pegawai Swasta", "Wiraswasta / Pengusaha", "Petani / Peternak", "Nelayan", "Pelajar / Mahasiswa", "Tidak / Belum Bekerja"]}
                  placeholder="Pilih atau ketik pekerjaan" 
                  required 
                />
              </FormGroup>
              <FormGroup id="noWhatsapp" label="No Whatsapp">
                <Input id="noWhatsapp" value={formData.noWhatsapp} onChange={handlePhoneChange("noWhatsapp")} placeholder="081 234 567 890" type="tel" />
              </FormGroup>
            </div>
          </div>

          {/* Section 3: Alamat */}
          <div>
            <h3 className="mb-[1rem] text-lg font-semibold text-gray-900 border-b pb-[0.5rem]">Alamat & Domisili</h3>
            <div className="grid grid-cols-1 gap-[1.5rem] md:grid-cols-2 xl:grid-cols-4">
              <FormGroup id="provinsi" label="Provinsi" required>
                <Select id="provinsi" value={formData.provinsi} onChange={handleProvinsiChange} required>
                  <option value="">{loading.provinces ? "Loading..." : "Pilih Provinsi"}</option>
                  {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </FormGroup>
              <FormGroup id="kabupaten" label="Kabupaten / Kota" required>
                <Select id="kabupaten" value={formData.kabupaten} onChange={handleKabupatenChange} disabled={!formData.provinsi} required>
                  <option value="">{loading.regencies ? "Loading..." : "Pilih Kabupaten"}</option>
                  {regencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </FormGroup>
              <FormGroup id="kecamatan" label="Kecamatan" required>
                <Select id="kecamatan" value={formData.kecamatan} onChange={handleKecamatanChange} disabled={!formData.kabupaten} required>
                  <option value="">{loading.districts ? "Loading..." : "Pilih Kecamatan"}</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </FormGroup>
              <FormGroup id="kelurahan" label="Kelurahan / Desa">
                <Select id="kelurahan" value={formData.kelurahan} onChange={handleChange("kelurahan")} disabled={!formData.kecamatan}>
                  <option value="">{loading.villages ? "Loading..." : "Pilih Kelurahan"}</option>
                  {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </Select>
              </FormGroup>
              <FormGroup id="alamat" label="Alamat Detail" className="md:col-span-2 xl:col-span-4" required>
                <Input id="alamat" value={formData.alamat} onChange={handleChange("alamat")} placeholder="Nama Jalan, RT/RW, dsb" required />
              </FormGroup>
            </div>
          </div>

          {/* Section 4: Data Keluarga */}
          <div>
            <h3 className="mb-[1rem] text-lg font-semibold text-gray-900 border-b pb-[0.5rem]">Data Keluarga</h3>
            <div className="grid grid-cols-1 gap-[1.5rem] md:grid-cols-2">
              <FormGroup id="namaSuamiIstri" label="Nama Suami / Istri">
                <Input id="namaSuamiIstri" value={formData.namaSuamiIstri} onChange={handleChange("namaSuamiIstri")} placeholder="Nama Pasangan" />
              </FormGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1rem]">
                <FormGroup id="nikSuami" label="NIK Suami / Istri">
                  <Input id="nikSuami" value={formData.nikSuami} onChange={handleNumberChange("nikSuami")} placeholder="16 Digit NIK" maxLength={16} />
                </FormGroup>
                <FormGroup id="noTelpSuami" label="No Telepon Suami / Istri">
                  <Input id="noTelpSuami" value={formData.noTelpSuami} onChange={handlePhoneChange("noTelpSuami")} placeholder="081 234 567 890" type="tel" />
                </FormGroup>
              </div>

              <FormGroup id="namaOrangTua" label="Nama Orang Tua">
                <Input id="namaOrangTua" value={formData.namaOrangTua} onChange={handleChange("namaOrangTua")} placeholder="Nama Ayah/Ibu" />
              </FormGroup>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1rem]">
                <FormGroup id="nikOrangTua" label="NIK Orang Tua">
                  <Input id="nikOrangTua" value={formData.nikOrangTua} onChange={handleNumberChange("nikOrangTua")} placeholder="16 Digit NIK" maxLength={16} />
                </FormGroup>
                <FormGroup id="noTelpOrangTua" label="No Telepon Orang Tua">
                  <Input id="noTelpOrangTua" value={formData.noTelpOrangTua} onChange={handlePhoneChange("noTelpOrangTua")} placeholder="081 234 567 890" type="tel" />
                </FormGroup>
              </div>
            </div>
          </div>



          <div className="flex justify-end gap-[1rem] pt-[1rem] border-t">
            <div className="relative group inline-block">
              {!isFormValid && <div className="absolute inset-0 z-10 cursor-not-allowed"></div>}
              <Button 
                variant="primary" 
                type="submit" 
                disabled={!isFormValid}
                className={!isFormValid ? "opacity-50" : ""}
              >
                Simpan Pendaftaran
              </Button>
              {!isFormValid && (
                <div className="absolute bottom-[100%] left-[50%] z-[9999] mb-[0.5rem] hidden w-max -translate-x-[50%] rounded bg-gray-900 px-[0.75rem] py-[0.5rem] text-xs font-medium text-white shadow-lg group-hover:block">
                  Data wajib diisi belum lengkap
                  <div className="absolute left-[50%] top-[100%] h-0 w-0 -translate-x-[50%] border-[4px] border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
