import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../ui/components/common/Card";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Input } from "../../../ui/components/elements/Input";
import { Select } from "../../../ui/components/elements/Select";
import { Button } from "../../../ui/components/elements/Button";
import { ComboBox } from "../../../ui/components/elements/ComboBox";
import { useNavigation } from "../../../logic/context/NavigationContext";
import { useRegionData } from "../../../logic/hooks/useRegionData";
import { useMasterPuskesmas } from "../../../logic/hooks/useMasterPuskesmas";
import { useMasterRekamMedis } from "../../../logic/hooks/useMasterRekamMedis";
import { usePendaftaran } from "../../../logic/hooks/usePendaftaran";
import { cn } from "../../../logic/utils/cn";
import { Modal } from "../../../ui/components/common/Modal";

interface PendaftaranFormProps {
  onCancel: () => void;
  initialData?: any;
}

export function PendaftaranForm({ onCancel, initialData }: PendaftaranFormProps) {
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

  const { data: puskList } = useMasterPuskesmas({ strategy: 'full' });
  const { patients, searchPatient, searchPatients, getPatientByNIK } = useMasterRekamMedis();
  const { registerNewPatient } = usePendaftaran();

  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [pendingNik, setPendingNik] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const puskesmasOptions = Array.from(
    new Set([
      ...puskList.map(p => p.nama).filter(Boolean),
      "Puskesmas Kecamatan",
      "Puskesmas Kelurahan",
      "Puskesmas Pembantu (Pustu)"
    ])
  );

  const patientNikOptions = Array.from(
    new Set(patients.map(p => p.nik).filter(Boolean))
  );

  const [formData, setFormData] = useState({
    idKunjungan: `KJ-${new Date().getTime().toString().slice(-6)}`,
    datetime: "",
    jenisLayanan: "",
    jenisPasien: "Baru",
    noRm: `RM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-001`,
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
    puskesmas: "",
    namaSuamiIstri: "",
    nikSuami: "",
    noTelpSuami: "",
    namaOrangTua: "",
    nikOrangTua: "",
    noTelpOrangTua: "",
    catatanKhusus: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      if (initialData.jenisPasien === "Lama") {
        setIsExistingPatient(true);
      }
    } else {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const localDatetime = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setFormData(prev => ({...prev, datetime: localDatetime}));
    }
  }, [initialData]);

  const handleSelectPatient = (patient: any) => {
    setFormData(prev => ({
      ...prev,
      nik: patient.nik,
      jenisPasien: "Lama",
      noRm: patient.noRm,
      jenisPanggilan: patient.panggilan || prev.jenisPanggilan,
      namaPasien: patient.nama,
      tanggalLahir: patient.tanggalLahir,
      alamat: patient.alamat || prev.alamat,
      noWhatsapp: patient.noWhatsapp || prev.noWhatsapp,
      puskesmas: patient.puskesmas || prev.puskesmas,
      pekerjaan: patient.pekerjaan || prev.pekerjaan,
      golDarah: patient.golDarah || prev.golDarah,
      provinsi: patient.provinsi || prev.provinsi,
      kabupaten: patient.kabupaten || prev.kabupaten,
      kecamatan: patient.kecamatan || prev.kecamatan,
      kelurahan: patient.kelurahan || prev.kelurahan,
      kk: patient.kk || prev.kk,
      noBpjs: patient.noBpjs || prev.noBpjs,
      namaSuamiIstri: patient.namaSuamiIstri || prev.namaSuamiIstri,
      nikSuami: patient.nikSuami || prev.nikSuami,
      noTelpSuami: patient.noTelpSuami || prev.noTelpSuami,
      namaOrangTua: patient.namaOrangTua || prev.namaOrangTua,
      nikOrangTua: patient.nikOrangTua || prev.nikOrangTua,
      noTelpOrangTua: patient.noTelpOrangTua || prev.noTelpOrangTua,
      catatanKhusus: patient.catatanKhusus || prev.catatanKhusus,
    }));
    setIsExistingPatient(true);
    setSearchQuery("");
    setSearchResults([]);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        try {
          const results = await searchPatients(searchQuery);
          setSearchResults(results);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchPatients]);

  const handleNikSearch = async (nikValue: string) => {
    if (nikValue.length < 16) {
      if (formData.jenisPasien === "Lama") {
        setIsExistingPatient(false);
        setFormData(prev => ({ ...prev, jenisPasien: "Baru" }));
      }
      return;
    }

    let patient = patients.find(p => p.nik === nikValue);
    if (!patient) {
      patient = (await getPatientByNIK(nikValue)) || undefined;
    }
    
    if (patient) {
      handleSelectPatient(patient);
    } else {
      setIsExistingPatient(false);
      setFormData(prev => ({ ...prev, jenisPasien: "Baru" }));
      const newRm = `RM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData(prev => ({ ...prev, noRm: newRm }));
    }
  };

  const onNikChange = (val: string) => {
    const numericVal = val.replace(/\D/g, "");
    const hasData = formData.namaPasien || formData.tanggalLahir || formData.alamat;
    
    if (hasData && isExistingPatient && numericVal !== formData.nik) {
      setPendingNik(numericVal);
      setShowResetModal(true);
    } else {
      setFormData(prev => ({ ...prev, nik: numericVal }));
      if (numericVal.length === 16) {
        handleNikSearch(numericVal);
      } else {
        setIsExistingPatient(false);
      }
    }
  };

  const EMPTY_FORM_DATA = {
    idKunjungan: "",
    datetime: "",
    jenisLayanan: "",
    jenisPasien: "Baru",
    noRm: "",
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
    puskesmas: "",
    namaSuamiIstri: "",
    nikSuami: "",
    noTelpSuami: "",
    namaOrangTua: "",
    nikOrangTua: "",
    noTelpOrangTua: "",
    catatanKhusus: "",
  };

  const confirmReset = () => {
    setFormData({
      ...EMPTY_FORM_DATA,
      nik: pendingNik,
      idKunjungan: formData.idKunjungan,
      datetime: formData.datetime,
      jenisLayanan: formData.jenisLayanan,
    });
    setIsExistingPatient(false);
    if (pendingNik.length === 16) {
      handleNikSearch(pendingNik);
    }
    setShowResetModal(false);
  };

  const handleMaintainData = () => {
    setFormData(prev => ({ ...prev, nik: pendingNik }));
    setIsExistingPatient(false);
    setShowResetModal(false);
  };

  const handleNumberChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, [field]: val }));
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
    formData.datetime &&
    formData.jenisLayanan &&
    formData.jenisPasien &&
    formData.noRm &&
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
    formData.alamat &&
    formData.puskesmas
  );

  const { jumpToPemeriksaan } = useNavigation();

  const handleSaveAndSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) return;

    await registerNewPatient({
      ...formData,
      panggilan: formData.jenisPanggilan,
      nama: formData.namaPasien,
      jenisKelamin: (formData.jenisPanggilan === "Tn." || formData.jenisPanggilan === "Sdr." || formData.jenisPanggilan === "An.") ? "L" : "P",
      sumberPendaftaran: "Offline",
    });

    onCancel();
  };

  const handleSimpanPeriksa = async () => {
    if (!isFormValid) return;
    
    const createdReg = await registerNewPatient({
      ...formData,
      panggilan: formData.jenisPanggilan,
      nama: formData.namaPasien,
      jenisKelamin: (formData.jenisPanggilan === "Tn." || formData.jenisPanggilan === "Sdr." || formData.jenisPanggilan === "An.") ? "L" : "P",
      sumberPendaftaran: "Offline",
    });

    const patientRecord = {
      id: createdReg.id,
      noAntrean: createdReg.noAntrean,
      noRm: createdReg.noRm,
      nama: createdReg.nama,
      panggilan: createdReg.panggilan,
      jenisKelamin: createdReg.jenisKelamin,
      tanggalLahir: createdReg.tanggalLahir,
      usia: createdReg.usia,
      waktuRegistrasi: createdReg.waktuRegistrasi,
      sumberPendaftaran: createdReg.sumberPendaftaran,
      jenisLayanan: createdReg.jenisLayanan,
      status: "Menunggu"
    };

    jumpToPemeriksaan(patientRecord);
  };

  return (
    <Card>
      <CardContent className="pt-[1.5rem]">
        <form className="space-y-[2rem]" onSubmit={handleSaveAndSubmit}>
          
          {/* Pencarian Pasien Lama */}
          <div className="relative">
            <h3 className="mb-[1rem] text-lg font-semibold text-gray-900 border-b pb-[0.5rem]">Cari Pasien Lama</h3>
            <div className="relative">
              <Input
                id="search_patient"
                placeholder="Cari berdasarkan No RM, NIK, atau Nama Pasien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-[2.5rem]"
              />
              {isSearching && (
                <div className="absolute right-[0.75rem] top-1/2 -translate-y-1/2">
                  <div className="w-[1rem] h-[1rem] border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-[0.25rem] bg-white border border-gray-200 rounded-[0.5rem] shadow-lg max-h-[15rem] overflow-y-auto">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPatient(p)}
                    className="w-full text-left px-[1rem] py-[0.75rem] hover:bg-gray-50 border-b last:border-0 flex flex-col"
                  >
                    <span className="font-semibold text-gray-900">{p.panggilan} {p.nama}</span>
                    <span className="text-[0.75rem] text-gray-500">No RM: {p.noRm} | NIK: {p.nik}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 1: Kunjungan */}
          <div>
            <h3 className="mb-[1rem] text-lg font-semibold text-gray-900 border-b pb-[0.5rem]">Data Kunjungan</h3>
            <div className="grid grid-cols-1 gap-[1.5rem] md:grid-cols-2 xl:grid-cols-3">
              <FormGroup id="nik_top" label="NIK Pasien" required>
                <ComboBox
                  id="nik_top"
                  options={patientNikOptions}
                  value={formData.nik}
                  onChange={onNikChange}
                  placeholder="Masukkan 16 Digit NIK"
                  maxLength={16}
                  required
                />
              </FormGroup>
              <FormGroup id="jenisLayanan" label="Jenis Layanan" required>
                <Select id="jenisLayanan" value={formData.jenisLayanan} onChange={handleChange("jenisLayanan")} required>
                  <option value="">Pilih Layanan</option>
                  <option value="Umum">Umum</option>
                  <option value="KB">KB</option>
                  <option value="Imunisasi">Imunisasi</option>
                  <optgroup label="AnteNatal">
                    <option value="AnteNatal - Tanpa USG">AnteNatal - Tanpa USG</option>
                    <option value="AnteNatal - USG 2D">AnteNatal - USG 2D</option>
                    <option value="AnteNatal - USG 4D">AnteNatal - USG 4D</option>
                  </optgroup>
                  <option value="Persalinan">Persalinan</option>
                  <optgroup label="Post Natal">
                    <option value="Post Natal - KF">Post Natal - KF</option>
                    <option value="Post Natal - KN">Post Natal - KN</option>
                    <option value="Post Natal - Akhir Nifas">Post Natal - Akhir Nifas</option>
                  </optgroup>
                  <option value="Mom & Baby Care">Mom & Baby Care</option>
                </Select>
              </FormGroup>
              <FormGroup id="datetime" label="Waktu Kunjungan" required>
                <Input id="datetime" type="datetime-local" value={formData.datetime} onChange={handleChange("datetime")} required />
              </FormGroup>
              <FormGroup id="jenisPasien" label="Jenis Pasien" required>
                <div className="flex h-[2.5rem] items-center gap-[0.75rem]">
                  <span className={cn("text-sm", formData.jenisPasien === "Baru" ? "font-semibold text-purple-700" : "text-gray-500")}>Baru</span>
                  <div
                    className={cn(
                      "relative inline-flex h-[1.5rem] w-[3rem] shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-gray-200 opacity-80",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none inline-block h-[1.25rem] w-[1.25rem] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        formData.jenisPasien === "Lama" ? "translate-x-[1.5rem]" : "translate-x-0"
                      )}
                    />
                  </div>
                  <span className={cn("text-sm", formData.jenisPasien === "Lama" ? "font-semibold text-purple-700" : "text-gray-500")}>Lama</span>
                </div>
                <p className="text-[0.7rem] text-gray-400 italic">Status terdeteksi otomatis</p>
              </FormGroup>
              <FormGroup id="noRm" label="No RM" required>
                <Input id="noRm" value={formData.noRm} onChange={handleChange("noRm")} required />
              </FormGroup>
              <FormGroup id="idKunjungan" label="ID Kunjungan" required>
                <Input id="idKunjungan" value={formData.idKunjungan} readOnly className="bg-gray-50" />
              </FormGroup>
            </div>
          </div>

          {/* Section 2: Identitas Pasien */}
          <div>
            <h3 className="mb-[1rem] text-lg font-semibold text-gray-900 border-b pb-[0.5rem]">Identitas Pasien</h3>
            <div className="grid grid-cols-1 gap-[1.5rem] md:grid-cols-2 xl:grid-cols-3">
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
                  <ComboBox 
                    id="provinsiLahir" 
                    value={formData.provinsiLahir} 
                    onChange={(val) => {
                      setFormData(prev => ({ ...prev, provinsiLahir: val, tempatLahir: "" }));
                      fetchTlRegencies(val);
                    }}
                    options={tlProvinces.map(p => ({ label: p.name, value: p.id }))}
                    placeholder={tlLoading.provinces ? "Loading..." : "Pilih Prov"}
                    required 
                  />
                </FormGroup>
                <FormGroup id="tempatLahir" label="Kota/Kab Lahir" required>
                  <ComboBox 
                    id="tempatLahir" 
                    value={formData.tempatLahir} 
                    onChange={(val) => setFormData(prev => ({ ...prev, tempatLahir: val }))}
                    options={tlRegencies.map(r => ({ label: r.name, value: r.name }))}
                    disabled={!formData.provinsiLahir}
                    placeholder={tlLoading.regencies ? "Loading..." : "Pilih Kota"}
                    required 
                  />
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
                <ComboBox
                  id="provinsi"
                  value={formData.provinsi}
                  onChange={(val) => {
                    setFormData(prev => ({ ...prev, provinsi: val, kabupaten: "", kecamatan: "", kelurahan: "" }));
                    fetchRegencies(val);
                  }}
                  options={provinces.map(p => ({ label: p.name, value: p.id }))}
                  placeholder={loading.provinces ? "Loading..." : "Pilih Provinsi"}
                  required
                />
              </FormGroup>
              <FormGroup id="kabupaten" label="Kabupaten / Kota" required>
                <ComboBox
                  id="kabupaten"
                  value={formData.kabupaten}
                  onChange={(val) => {
                    setFormData(prev => ({ ...prev, kabupaten: val, kecamatan: "", kelurahan: "" }));
                    fetchDistricts(val);
                  }}
                  options={regencies.map(r => ({ label: r.name, value: r.id }))}
                  disabled={!formData.provinsi}
                  placeholder={loading.regencies ? "Loading..." : "Pilih Kabupaten"}
                  required
                />
              </FormGroup>
              <FormGroup id="kecamatan" label="Kecamatan" required>
                <ComboBox
                  id="kecamatan"
                  value={formData.kecamatan}
                  onChange={(val) => {
                    setFormData(prev => ({ ...prev, kecamatan: val, kelurahan: "" }));
                    fetchVillages(val);
                  }}
                  options={districts.map(d => ({ label: d.name, value: d.id }))}
                  disabled={!formData.kabupaten}
                  placeholder={loading.districts ? "Loading..." : "Pilih Kecamatan"}
                  required
                />
              </FormGroup>
              <FormGroup id="kelurahan" label="Kelurahan / Desa">
                <ComboBox
                  id="kelurahan"
                  value={formData.kelurahan}
                  onChange={(val) => setFormData(prev => ({ ...prev, kelurahan: val }))}
                  options={villages.map(v => ({ label: v.name, value: v.id }))}
                  disabled={!formData.kecamatan}
                  placeholder={loading.villages ? "Loading..." : "Pilih Kelurahan"}
                />
              </FormGroup>
              <FormGroup id="alamat" label="Alamat Detail" className="md:col-span-2 xl:col-span-4" required>
                <Input id="alamat" value={formData.alamat} onChange={handleChange("alamat")} placeholder="Nama Jalan, RT/RW, dsb" required />
              </FormGroup>
              <FormGroup id="puskesmas" label="Puskesmas" className="md:col-span-2 xl:col-span-4" required>
                <ComboBox 
                  id="puskesmas" 
                  value={formData.puskesmas} 
                  onChange={(val) => setFormData(prev => ({...prev, puskesmas: val}))} 
                  options={puskesmasOptions}
                  placeholder="Ketik atau pilih puskesmas rujukan/terdekat" 
                  required 
                />
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

          {/* Section 5: Catatan */}
          <div>
            <h3 className="mb-[1rem] text-lg font-semibold text-gray-900 border-b pb-[0.5rem]">Catatan</h3>
            <FormGroup id="catatanKhusus" label="Catatan Khusus">
              <textarea 
                id="catatanKhusus"
                value={formData.catatanKhusus}
                onChange={handleChange("catatanKhusus")}
                rows={3}
                className="flex w-full rounded-md border border-gray-200 bg-transparent px-[0.75rem] py-[0.5rem] text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-700"
                placeholder="Tambahkan catatan jika diperlukan..."
              />
            </FormGroup>
          </div>

          <div className="flex justify-end gap-[1rem] pt-[1rem] border-t">
            <Button variant="outline" type="button" onClick={onCancel}>Batal</Button>
            
            <div className="relative group inline-block">
              {!isFormValid && <div className="absolute inset-0 z-10 cursor-not-allowed"></div>}
              <Button 
                variant="outline" 
                type="button"
                onClick={handleSimpanPeriksa}
                disabled={!isFormValid}
                className={cn(
                  "border-purple-200 text-purple-700 hover:bg-purple-50",
                  !isFormValid ? "opacity-50" : ""
                )}
              >
                Simpan & Periksa
              </Button>
            </div>

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
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Deteksi Perubahan NIK"
        footer={
          <div className="flex justify-end gap-[0.75rem]">
            <Button variant="outline" onClick={handleMaintainData}>Pertahankan Data</Button>
            <Button variant="primary" onClick={confirmReset}>Reset & Update</Button>
          </div>
        }
      >
        <div className="p-[1rem]">
          <p className="text-sm text-gray-600">
            Anda sedang mengubah NIK saat data pasien sudah terisi. Apakah Anda ingin mereset formulir dan memuat data (jika NIK baru terdaftar) atau tetap mempertahankan data yang ada untuk NIK baru ini?
          </p>
          <div className="mt-[1rem] p-[0.75rem] bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-xs text-amber-700 font-medium">
              Saran: Jika ini adalah koreksi typo pada NIK pasien yang sama, pilih "Pertahankan Data". Jika ini adalah pasien yang berbeda, pilih "Reset & Update".
            </p>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
