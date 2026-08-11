import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../ui/components/common/Card";
import { updateRegistrationStatus } from "../../../logic/services/pendaftaranService.js";
import { usePemeriksaan } from "../../../logic/hooks/usePemeriksaan.js";
import { fetchObatStokBerjalanList, addObatMasukEntry } from "../../../logic/services/manajemenObatService.js";
import { fetchBhpStokBerjalanList, addBhpMasukEntry } from "../../../logic/services/manajemenBhpService.js";
import { fetchMasterLayananLainList, createMasterLayananLainItem } from "../../../logic/services/masterLayananLainService.js";
import { fetchMasterKbList } from "../../../logic/services/masterKbService.js";
import { fetchMasterImunisasiList } from "../../../logic/services/masterImunisasiService.js";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { Input } from "../../../ui/components/elements/Input";
import { Textarea } from "../../../ui/components/elements/Textarea";
import { Button } from "../../../ui/components/elements/Button";
import { Select } from "../../../ui/components/elements/Select";
import { ComboBox } from "../../../ui/components/elements/ComboBox";
import { PriceInput } from "../../../ui/components/elements/PriceInput";
import { AntreanPemeriksaan, PemeriksaanData } from "../types";
import { tokens } from "../../../ui/styles/tokens";
import { Plus, Trash2, Save, ArrowLeft, Search, Pill, Package, Syringe, Edit, CheckCircle, ClipboardCheck, Play } from "lucide-react";
import Swal from "sweetalert2";
import { cn } from "../../../logic/utils/cn";
import { DUMMY_STOK_BERJALAN } from "../../obat/data/dummy";
import { DUMMY_STOK_BERJALAN_BHP } from "../../bhp/data/dummy";
import { dummyLayananLainData } from "../../master-layanan-lain/data/dummy";
import { dummyUsers } from "../../master-user/data/dummy";
import { dummyKbData } from "../../master-kb/data/dummy";
import { dummyImunisasiData } from "../../master-imunisasi/data/dummy";
import { PopUpModal } from "../../../ui/components/common/PopUpModal";
import { FileText } from "lucide-react";

interface PemeriksaanFormProps {
  patient: AntreanPemeriksaan;
  isReadOnly?: boolean;
  onBack: () => void;
  onSickLeave: () => void;
  onBirthCertificate: () => void;
  onLabReferral: () => void;
}

const COMMON_DIAGNOSES = [
  "Common Cold (J00)",
  "Essential hypertension (I10)",
  "Non-insulin-dependent diabetes mellitus (E11)",
  "Gastro-oesophageal reflux disease (K21)",
  "Acute pharyngitis (J02)",
  "Acute tonsillitis (J03)",
  "Dengue haemorrhagic fever (A91)",
  "Typhoid fever (A01.0)",
  "Dyspepsia (K30)",
  "Myalgia (M79.1)"
];

export function PemeriksaanForm({ patient, isReadOnly = false, onBack, onSickLeave, onBirthCertificate, onLabReferral }: PemeriksaanFormProps) {
  const [status, setStatus] = useState(patient.status);
  const [internalReadOnly, setInternalReadOnly] = useState(isReadOnly || patient.status === "Selesai");

  useEffect(() => {
    setStatus(patient.status);
    setInternalReadOnly(isReadOnly || patient.status === "Selesai");
  }, [isReadOnly, patient.status]);

  const serviceTypeStr = (patient?.jenisLayanan || (patient as any)?.layanan || "").toLowerCase();
  const isKbService = useMemo(() => serviceTypeStr.includes("kb"), [serviceTypeStr]);
  const isImunisasiService = useMemo(() => serviceTypeStr.includes("imunisasi"), [serviceTypeStr]);
  const isAncService = useMemo(() => serviceTypeStr.includes("anc") || serviceTypeStr.includes("antenatal"), [serviceTypeStr]);
  const isPersalinanService = useMemo(() => serviceTypeStr.includes("persalinan"), [serviceTypeStr]);
  const isPncService = useMemo(() => serviceTypeStr.includes("pnc") || serviceTypeStr.includes("post natal"), [serviceTypeStr]);
  const isMomCareService = useMemo(() => serviceTypeStr.includes("mom") || serviceTypeStr.includes("baby care"), [serviceTypeStr]);
  
  const [activeTab, setActiveTab] = useState<"umum" | "kb" | "imunisasi" | "anc" | "persalinan" | "pnc" | "momCare">("umum");

  const { data: dbPemeriksaan, save: savePemeriksaanDb, loading: dbLoading } = usePemeriksaan(patient?.id);

  const [listObat, setListObat] = useState<any[]>([]);
  const [listBhp, setListBhp] = useState<any[]>([]);
  const [listLayananLain, setListLayananLain] = useState<any[]>([]);
  const [listKb, setListKb] = useState<any[]>([]);
  const [listImunisasi, setListImunisasi] = useState<any[]>([]);

  useEffect(() => {
    async function loadMasterData() {
      try {
        const [obatRes, bhpRes, layananRes, kbRes, imunisasiRes] = await Promise.all([
          fetchObatStokBerjalanList({ strategy: "full" }),
          fetchBhpStokBerjalanList({ strategy: "full" }),
          fetchMasterLayananLainList({ strategy: "full" }),
          fetchMasterKbList({ strategy: "full" }),
          fetchMasterImunisasiList({ strategy: "full" }),
        ]);
        setListObat(obatRes.items || []);
        setListBhp(bhpRes.items || []);
        setListLayananLain(layananRes.items || []);
        setListKb(kbRes.items || []);
        setListImunisasi(imunisasiRes.items || []);
      } catch (err) {
        console.error("Gagal memuat master data di pemeriksaan form", err);
      }
    }
    loadMasterData();
  }, []);

  const [formData, setFormData] = useState<Partial<PemeriksaanData>>({
    subjektif: { keluhan: "", riwAlergi: "", riwPenyakit: "", riwKeluarga: "" },
    objektifPrimary: { beratBadan: "", tinggiBadan: "", tekananDarah: "", heartRate: "", suhu: "", respirationRate: "", spo2: "" },
    objektifFisik: { pxKepalaLeher: "", pxDada: "", pxAbdomen: "", pxEkstremitasAtas: "", pxEkstremitasBawah: "", pxGenitalUrinaria: "", pxFisikLain: "" },
    penunjang: [],
    diagnosa: { utama: "", sekunder: "" },
    plan: { 
      terapiFarmakologi: [], 
      layananLain: [] 
    },
    bhp: [],
    kb: isKbService ? {
      jumlahAnak: 0,
      umurAnakTerkecil: "",
      pus4T: { terlaluMuda: false, terlaluTua: false, terlaluDekat: false, terlaluBanyak: false },
      jenisKontrasepsiId: "",
      kunjunganUlangTier: 1,
      kunjunganUlangDate: new Date().toISOString().split('T')[0]
    } : undefined,
    imunisasi: isImunisasiService ? {
      diberikan: [{ vaksin: "", noBatch: "" }],
      berikutnya: [],
      tglKembali: ""
    } : undefined,
    anc: isAncService ? {
      periksaKe: 1,
      hpht: "",
      gestasi: 0,
      partus: 0,
      abortus: 0,
      usiaKehamilan: "",
      tglKembaliAnc: "",
      tfu: "",
      letakJanin: "",
      djj: "",
      pxLab: "",
      risikoTinggi: []
    } : undefined,
    persalinan: isPersalinanService ? {
      periksaKe: 1,
      hpht: "",
      gestasi: 0,
      partus: 0,
      abortus: 0,
      usiaKehamilan: "",
      tfu: "",
      letakJanin: "",
      djj: "",
      pxLab: "",
      risikoTinggi: [],
      tindakLanjut: "Persalinan",
      dataLahir: {
        waktuLahir: new Date().toISOString().slice(0, 16),
        tindakan: "Normal",
        bbl: "Cukup",
        jkBayi: "L",
        bbBayi: 0,
        pbBayi: 0,
        lkBayi: 0,
        ldBayi: 0,
        apgarScore: "",
        keadaanIbu: "Sehat",
        keadaanAnak: "Sehat"
      }
    } : undefined,
    pnc: isPncService ? {
      jenisKunjungan: "KF",
      kf: {
        riwayatKehamilan: "",
        caraPersalinan: "",
        komplikasiPersalinan: "",
        tandaVital: { td: "", nadi: "", nafas: "", suhu: "" },
        kontraksiTfu: "",
        perdarahan: "",
        lochea: "",
        babBak: "",
        terapi: "",
        nasihat: "",
        kbPascasalin: "",
        pxDarah: "",
        tglKembali: ""
      }
    } : undefined,
    momCare: isMomCareService ? {
      jenisLayanan: "",
      catatanKhusus: ""
    } : undefined,
    catatan: "",
    petugas: "Siti Aminah, S.Kep"
  });

  const calculateGestasi = (hpht: string) => {
    if (!hpht) return "";
    const lmpDate = new Date(hpht);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    return `${weeks} Minggu ${days} Hari`;
  };

  const handleAncChange = (field: keyof NonNullable<PemeriksaanData["anc"]>, value: any) => {
    setFormData(prev => {
      const newAnc = { ...prev.anc!, [field]: value };
      if (field === "hpht") {
        newAnc.usiaKehamilan = calculateGestasi(value);
      }
      return { ...prev, anc: newAnc };
    });
  };

  const toggleRisikoTinggi = (risiko: string) => {
    const current = formData.anc?.risikoTinggi || [];
    const next = current.includes(risiko)
      ? current.filter(r => r !== risiko)
      : [...current, risiko];
    handleAncChange("risikoTinggi", next);
  };

  const handlePersalinanChange = (field: string, value: any) => {
    setFormData(prev => {
      const parts = field.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        return {
          ...prev,
          persalinan: {
            ...prev.persalinan!,
            [parent]: {
              ...(prev.persalinan as any)[parent],
              [child]: value
            }
          }
        };
      }

      const newPersalinan = { ...prev.persalinan!, [field]: value };
      if (field === "hpht") {
        newPersalinan.usiaKehamilan = calculateGestasi(value);
      }
      
      // Initialize sub-objects if they don't exist based on tindakLanjut
      if (field === "tindakLanjut") {
        if (value === "Persalinan" && !newPersalinan.dataLahir) {
          newPersalinan.dataLahir = {
            waktuLahir: new Date().toISOString().slice(0, 16),
            tindakan: "Normal",
            bbl: "Cukup",
            jkBayi: "L",
            bbBayi: 0,
            pbBayi: 0,
            lkBayi: 0,
            ldBayi: 0,
            apgarScore: "",
            keadaanIbu: "Sehat",
            keadaanAnak: "Sehat"
          };
        } else if (value === "Rujuk" && !newPersalinan.dataRujuk) {
          newPersalinan.dataRujuk = {
            waktuRujuk: new Date().toISOString().slice(0, 16),
            tujuan: "",
            alasan: ""
          };
        }
      }

      return { ...prev, persalinan: newPersalinan };
    });
  };
  
  const handlePncChange = (field: string, value: any) => {
    setFormData(prev => {
      const parts = field.split('.');
      if (parts.length >= 2) {
        const [parent, child, subchild] = parts;
        if (subchild) {
          return {
            ...prev,
            pnc: {
              ...prev.pnc!,
              [parent]: {
                ...(prev.pnc as any)[parent],
                [child]: {
                  ...(prev.pnc as any)[parent][child],
                  [subchild]: value
                }
              }
            }
          };
        }
        return {
          ...prev,
          pnc: {
            ...prev.pnc!,
            [parent]: {
              ...(prev.pnc as any)[parent],
              [child]: value
            }
          }
        };
      }
      
      const newPnc = { ...prev.pnc!, [field]: value };
      
      // Initialize sub-objects if needed when switching jenisKunjungan
      if (field === "jenisKunjungan") {
        if (value === "KF" && !newPnc.kf) {
          newPnc.kf = {
            riwayatKehamilan: "", caraPersalinan: "", komplikasiPersalinan: "",
            tandaVital: { td: "", nadi: "", nafas: "", suhu: "" },
            kontraksiTfu: "", perdarahan: "", lochea: "", babBak: "",
            terapi: "", nasihat: "", kbPascasalin: "", pxDarah: "", tglKembali: ""
          };
        } else if (value === "KN" && !newPnc.kn) {
          newPnc.kn = {
            tglLahir: "", bbPbPenolong: "", vitK: false, imd: false, salepMata: false, hb0: false,
            pxKejang: "", pxNafas: "", pxHipotermi: "", pxBakteri: "", pxIkterus: "", pxSalCerna: "",
            pxDiare: "", pxAsiBb: "", pxTaliPusat: "", sosialisasiHbBcg: "",
            tglKembali: ""
          };
        } else if (value === "Akhir Nifas" && !newPnc.akhirNifas) {
          newPnc.akhirNifas = {
            keadaanIbu: "", keadaanBayi: "", tglKembali: ""
          };
        }
      }
      
      return { ...prev, pnc: newPnc };
    });
  };

  const handleMomCareChange = (field: keyof NonNullable<PemeriksaanData["momCare"]>, value: any) => {
    setFormData(prev => ({
      ...prev,
      momCare: { ...prev.momCare!, [field]: value }
    }));
  };

  const [tdSistole, setTdSistole] = useState("");
  const [tdDiastole, setTdDiastole] = useState("");

  // Modal States
  const [isObatModalOpen, setIsObatModalOpen] = useState(false);
  const [editingObatIndex, setEditingObatIndex] = useState<number | null>(null);
  const [currentObat, setCurrentObat] = useState({ sku: "", namaObat: "", dosis: "", aturanPakai: "", jumlah: 1, harga: 0 });

  const [isBhpModalOpen, setIsBhpModalOpen] = useState(false);
  const [editingBhpIndex, setEditingBhpIndex] = useState<number | null>(null);
  const [currentBhp, setCurrentBhp] = useState({ sku: "", namaBhp: "", jumlah: 1, satuan: "", harga: 0 });

  const [isLayananModalOpen, setIsLayananModalOpen] = useState(false);
  const [editingLayananIndex, setEditingLayananIndex] = useState<number | null>(null);
  const [currentLayanan, setCurrentLayanan] = useState({ id: "", nama: "", biaya: 0 });

  const petugasOptions = useMemo(() => {
    return dummyUsers
      .filter(u => u.permissions.includes("Pemeriksaan"))
      .map(u => u.nama);
  }, []);

  const handleAddPenunjang = () => {
    setFormData(prev => ({
      ...prev,
      penunjang: [...(prev.penunjang || []), { id: Date.now().toString(), jenis: "", hasil: "", catatan: "" }]
    }));
  };

  const handleRemovePenunjang = (id: string) => {
    Swal.fire({
      title: "Hapus Hasil Penunjang?",
      text: "Data yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444"
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData(prev => ({
          ...prev,
          penunjang: prev.penunjang?.filter(p => p.id !== id)
        }));
      }
    });
  };

  // Obat Handlers
  const openObatModal = (index?: number) => {
    if (index !== undefined) {
      setEditingObatIndex(index);
      setCurrentObat(formData.plan!.terapiFarmakologi[index]);
    } else {
      setEditingObatIndex(null);
      setCurrentObat({ sku: "", namaObat: "", dosis: "", aturanPakai: "", jumlah: 1, harga: 0 });
    }
    setIsObatModalOpen(true);
  };

  const handleSaveObat = () => {
    if (!currentObat.namaObat) {
      Swal.fire("Peringatan", "Nama obat harus dipilih.", "warning");
      return;
    }

    setFormData(prev => {
      const newList = [...(prev.plan?.terapiFarmakologi || [])];
      if (editingObatIndex !== null) {
        newList[editingObatIndex] = currentObat;
      } else {
        newList.push(currentObat);
      }
      return {
        ...prev,
        plan: { ...prev.plan!, terapiFarmakologi: newList }
      };
    });
    setIsObatModalOpen(false);
  };

  const handleRemoveObat = (index: number) => {
    Swal.fire({
      title: "Hapus Obat?",
      text: "Obat ini akan dihapus dari resep.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444"
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData(prev => ({
          ...prev,
          plan: {
            ...prev.plan!,
            terapiFarmakologi: prev.plan?.terapiFarmakologi.filter((_, i) => i !== index) || []
          }
        }));
      }
    });
  };

  // BHP Handlers
  const openBhpModal = (index?: number) => {
    if (index !== undefined) {
      setEditingBhpIndex(index);
      setCurrentBhp(formData.bhp![index]);
    } else {
      setEditingBhpIndex(null);
      setCurrentBhp({ sku: "", namaBhp: "", jumlah: 1, satuan: "", harga: 0 });
    }
    setIsBhpModalOpen(true);
  };

  const handleSaveBhp = () => {
    if (!currentBhp.namaBhp) {
      Swal.fire("Peringatan", "Nama BHP harus dipilih.", "warning");
      return;
    }

    setFormData(prev => {
      const newList = [...(prev.bhp || [])];
      if (editingBhpIndex !== null) {
        newList[editingBhpIndex] = currentBhp;
      } else {
        newList.push(currentBhp);
      }
      return { ...prev, bhp: newList };
    });
    setIsBhpModalOpen(false);
  };

  const handleRemoveBhp = (index: number) => {
    Swal.fire({
      title: "Hapus BHP?",
      text: "Penggunaan BHP ini akan dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444"
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData(prev => ({
          ...prev,
          bhp: prev.bhp?.filter((_, i) => i !== index)
        }));
      }
    });
  };

  // Layanan Handlers
  const openLayananModal = (index?: number) => {
    if (index !== undefined) {
      setEditingLayananIndex(index);
      setCurrentLayanan(formData.plan!.layananLain[index]);
    } else {
      setEditingLayananIndex(null);
      setCurrentLayanan({ id: "", nama: "", biaya: 0 });
    }
    setIsLayananModalOpen(true);
  };

  const handleSaveLayanan = () => {
    if (!currentLayanan.nama) {
      Swal.fire("Peringatan", "Layanan harus dipilih.", "warning");
      return;
    }

    setFormData(prev => {
      const newList = [...(prev.plan?.layananLain || [])];
      if (editingLayananIndex !== null) {
        newList[editingLayananIndex] = currentLayanan;
      } else {
        newList.push(currentLayanan);
      }
      return {
        ...prev,
        plan: { ...prev.plan!, layananLain: newList }
      };
    });
    setIsLayananModalOpen(false);
  };

  const handleRemoveLayanan = (index: number) => {
    Swal.fire({
      title: "Hapus Layanan?",
      text: "Layanan ini akan dihapus dari rencana pemeriksaan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444"
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData(prev => ({
          ...prev,
          plan: {
            ...prev.plan!,
            layananLain: prev.plan?.layananLain.filter((_, i) => i !== index) || []
          }
        }));
      }
    });
  };

  useEffect(() => {
    if (dbPemeriksaan) {
      setFormData(prev => ({
        ...prev,
        ...dbPemeriksaan,
        subjektif: dbPemeriksaan.subjektif || prev.subjektif,
        objektifPrimary: dbPemeriksaan.objektifPrimary || prev.objektifPrimary,
        objektifFisik: dbPemeriksaan.objektifFisik || prev.objektifFisik,
        penunjang: dbPemeriksaan.penunjang || prev.penunjang,
        diagnosa: dbPemeriksaan.diagnosa || prev.diagnosa,
        plan: dbPemeriksaan.plan || prev.plan,
        bhp: dbPemeriksaan.bhp || prev.bhp,
        kb: dbPemeriksaan.kb !== undefined ? dbPemeriksaan.kb : prev.kb,
        imunisasi: dbPemeriksaan.imunisasi !== undefined ? dbPemeriksaan.imunisasi : prev.imunisasi,
        anc: dbPemeriksaan.anc !== undefined ? dbPemeriksaan.anc : prev.anc,
        persalinan: dbPemeriksaan.persalinan !== undefined ? dbPemeriksaan.persalinan : prev.persalinan,
        pnc: dbPemeriksaan.pnc !== undefined ? dbPemeriksaan.pnc : prev.pnc,
        momCare: dbPemeriksaan.momCare !== undefined ? dbPemeriksaan.momCare : prev.momCare,
      }));
    }
  }, [dbPemeriksaan]);

  const handleSave = () => {
    Swal.fire({
      title: "Simpan Pemeriksaan?",
      text: "Data pemeriksaan akan disimpan ke dalam rekam medis pasien.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#7e22ce"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Auto-register manual items
          const manualObat = formData.plan?.terapiFarmakologi?.filter(o => o.sku.startsWith("M-OBAT-")) || [];
          const manualBhp = formData.bhp?.filter(b => b.sku.startsWith("M-BHP-")) || [];
          const manualLayanan = formData.plan?.layananLain?.filter(l => l.id.startsWith("M-SERV-")) || [];

          for (const o of manualObat) {
            await addObatMasukEntry({
              sku: o.sku,
              namaObat: o.namaObat,
              namaMerk: "-",
              bentukSediaan: "Tablet",
              dosisSediaan: "-",
              qtyMasuk: 100, // Initial stock for manual entry
              hargaBeli: (o.harga || 0) * 0.8, // Estimate cost
            });
          }

          for (const b of manualBhp) {
            await addBhpMasukEntry({
              sku: b.sku,
              namaBhp: b.namaBhp,
              kategori: "Alat Medis",
              satuan: b.satuan || "pcs",
              qtyMasuk: 100,
              hargaBeli: (b.harga || 0) * 0.8,
            });
          }

          for (const l of manualLayanan) {
            await createMasterLayananLainItem({
              nama: l.nama,
              harga: l.biaya,
              keterangan: "Input Manual via Pemeriksaan"
            });
          }

          await savePemeriksaanDb(formData as any);
          Swal.fire("Berhasil!", "Data pemeriksaan telah disimpan.", "success");
        } catch (err: any) {
          Swal.fire("Error", err.message || "Gagal menyimpan pemeriksaan", "error");
        }
      }
    });
  };

  const handleStartExam = () => {
    Swal.fire({
      title: "Mulai Pemeriksaan?",
      text: "Ubah status antrian menjadi 'Diperiksa'?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Mulai",
      cancelButtonText: "Batal",
      confirmButtonColor: "#4f46e5"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await updateRegistrationStatus(patient.id, "Diperiksa");
          setStatus("Diperiksa");
          Swal.fire("Berhasil!", "Status antrian telah diubah menjadi Diperiksa.", "success");
        } catch (err: any) {
          Swal.fire("Error", err.message || "Gagal memulai pemeriksaan", "error");
        }
      }
    });
  };

  const handleFinish = () => {
    Swal.fire({
      title: "Selesaikan Pemeriksaan?",
      text: "Setelah selesai, status pasien akan berubah menjadi 'Selesai' dan data akan dikunci.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Selesai",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10b981"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await savePemeriksaanDb(formData as any);
          await updateRegistrationStatus(patient.id, "Selesai");
          Swal.fire("Selesai!", "Pemeriksaan telah diselesaikan.", "success");
          onBack();
        } catch (err: any) {
          Swal.fire("Error", err.message || "Gagal menyelesaikan pemeriksaan", "error");
        }
      }
    });
  };

  const handleKbChange = (field: keyof NonNullable<PemeriksaanData["kb"]>, value: any) => {
    setFormData(prev => {
      const newKb = { ...prev.kb!, [field]: value };
      
      // Auto-calculate kunjungan ulang date if kontrasepsi or tier changes
      if (field === "jenisKontrasepsiId" || field === "kunjunganUlangTier") {
        const activeKbList = listKb.length > 0 ? listKb : dummyKbData;
        const selectedKb = activeKbList.find(k => k.id === (field === "jenisKontrasepsiId" ? value : prev.kb!.jenisKontrasepsiId));
        if (selectedKb) {
          const tierNum = field === "kunjunganUlangTier" ? value : prev.kb!.kunjunganUlangTier;
          const tier = selectedKb.tiers.find(t => t.tier === tierNum) || selectedKb.tiers[0];
          const date = new Date();
          date.setDate(date.getDate() + tier.durationDays);
          newKb.kunjunganUlangDate = date.toISOString().split('T')[0];
        }
      }
      
      return { ...prev, kb: newKb };
    });
  };

  const handleImunisasiChange = (field: keyof NonNullable<PemeriksaanData["imunisasi"]>, value: any) => {
    setFormData(prev => ({
      ...prev,
      imunisasi: { ...prev.imunisasi!, [field]: value }
    }));
  };

  const handleAddDiberikan = () => {
    setFormData(prev => ({
      ...prev,
      imunisasi: {
        ...prev.imunisasi!,
        diberikan: [...prev.imunisasi!.diberikan, { vaksin: "", noBatch: "" }]
      }
    }));
  };

  const handleRemoveDiberikan = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imunisasi: {
        ...prev.imunisasi!,
        diberikan: prev.imunisasi!.diberikan.filter((_, i) => i !== index)
      }
    }));
  };

  const toggleBerikutnya = (vaksinNama: string) => {
    const current = formData.imunisasi?.berikutnya || [];
    const next = current.includes(vaksinNama)
      ? current.filter(v => v !== vaksinNama)
      : [...current, vaksinNama];
    handleImunisasiChange("berikutnya", next);
  };

  return (
    <div className="space-y-[2rem] pb-[4rem]">
      {/* Waiting Queue / Mulai Periksa Banner */}
      {status === "Menunggu" && (
        <div className="p-[1rem] rounded-xl flex items-center justify-between gap-[0.75rem] bg-purple-50 border border-purple-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-[0.75rem]">
            <div className="p-[0.5rem] rounded-full bg-purple-100">
              <ClipboardCheck className="h-[1.25rem] w-[1.25rem] text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-purple-900">Pasien Menunggu Pemeriksaan</p>
              <p className="text-xs text-purple-700">Silakan klik "Mulai Periksa" untuk mengubah status antrian menjadi "Diperiksa" dan mulai menginput data pemeriksaan.</p>
            </div>
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={async () => {
              try {
                await updateRegistrationStatus(patient.id, "Diperiksa");
                setStatus("Diperiksa");
                Swal.fire("Berhasil!", "Status antrian telah diubah menjadi Diperiksa.", "success");
              } catch (err: any) {
                Swal.fire("Error", err.message || "Gagal memulai pemeriksaan", "error");
              }
            }}
            className="gap-[0.5rem] bg-purple-700 hover:bg-purple-800"
          >
            Mulai Periksa
          </Button>
        </div>
      )}

      {/* Read Only Banner */}
      {internalReadOnly && (
        <div className={cn(
          "p-[1rem] rounded-xl flex items-center justify-between gap-[0.75rem] animate-in fade-in slide-in-from-top-2 duration-300 border",
          patient.status === "Selesai" 
            ? "bg-emerald-50 border-emerald-200" 
            : "bg-amber-50 border-amber-200"
        )}>
          <div className="flex items-center gap-[0.75rem]">
            <div className={cn(
              "p-[0.5rem] rounded-full",
              patient.status === "Selesai" ? "bg-emerald-100" : "bg-amber-100"
            )}>
              <FileText className={cn(
                "h-[1.25rem] w-[1.25rem]",
                patient.status === "Selesai" ? "text-emerald-700" : "text-amber-700"
              )} />
            </div>
            <div>
              <p className={cn(
                "text-sm font-bold",
                patient.status === "Selesai" ? "text-emerald-900" : "text-amber-900"
              )}>
                {patient.status === "Selesai" ? "Pemeriksaan Selesai (Data Dikunci)" : "Mode Lihat Saja (Read Only)"}
              </p>
              <p className={cn(
                "text-xs",
                patient.status === "Selesai" ? "text-emerald-700" : "text-amber-700"
              )}>
                {patient.status === "Selesai" 
                  ? "Pemeriksaan ini telah diselesaikan. Gunakan tombol 'Buka Kunci' jika ingin melakukan perubahan darurat." 
                  : "Anda sedang melihat riwayat pemeriksaan medis. Data tidak dapat diubah."}
              </p>
            </div>
          </div>
          
          {patient.status === "Selesai" && internalReadOnly && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                Swal.fire({
                  title: "Buka Kunci Data?",
                  text: "Gunakan fitur ini hanya untuk perbaikan data yang mendesak. Tetap berhati-hati saat mengubah data yang sudah selesai.",
                  icon: "info",
                  showCancelButton: true,
                  confirmButtonText: "Ya, Buka Kunci",
                  cancelButtonText: "Batal",
                  confirmButtonColor: "#7c3aed"
                }).then((result) => {
                  if (result.isConfirmed) {
                    setInternalReadOnly(false);
                  }
                });
              }}
              className="gap-[0.5rem] bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <Edit className="h-[1rem] w-[1rem]" />
              Buka Kunci / Edit
            </Button>
          )}
        </div>
      )}

      {/* Header Info Pasien - SEAMLESS */}
      <div className="flex items-center justify-between border-b pb-[1.5rem] pt-[1rem]">
        <div className="flex items-center gap-[1.5rem]">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-0 hover:bg-transparent">
            <ArrowLeft className="h-[1.5rem] w-[1.5rem] text-gray-400 hover:text-purple-700 transition-colors" />
          </Button>
          <div>
            <h1 className="text-[2rem] font-black text-purple-700 leading-none">
              {patient.panggilan} {patient.nama}
            </h1>
            <div className="flex items-center gap-[0.75rem] mt-[0.5rem] text-[0.875rem] font-medium text-gray-500">
              <span className="bg-purple-50 text-purple-700 px-[0.625rem] py-[0.125rem] rounded-full border border-purple-100">
                {patient.noRm}
              </span>
              <span>•</span>
              <span>{patient.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</span>
              <span>•</span>
              <span>{patient.usia}</span>
              <span>•</span>
              <span>Layanan: <span className="text-gray-900">{patient.jenisLayanan}</span></span>
            </div>
            <div className="flex items-center gap-[0.75rem] mt-[1rem] print:hidden">
              {!internalReadOnly && (
                <>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handleSave}
                    className="gap-[0.5rem] bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200"
                  >
                    <Save className="h-[1.125rem] w-[1.125rem]" />
                    Simpan
                  </Button>
                  {status === "Menunggu" ? (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={handleStartExam}
                      className="gap-[0.5rem] bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
                    >
                      <Play className="h-[1.125rem] w-[1.125rem]" />
                      Mulai Periksa
                    </Button>
                  ) : (
                    status === "Diperiksa" && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={handleFinish}
                        className="gap-[0.5rem] bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200"
                      >
                        <CheckCircle className="h-[1.125rem] w-[1.125rem]" />
                        Selesai
                      </Button>
                    )
                  )}
                  <div className="w-[1px] h-[1.5rem] bg-gray-200 mx-[0.25rem]" />
                </>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onSickLeave}
                className="gap-[0.5rem] border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <FileText className="h-[1.125rem] w-[1.125rem]" />
                Surat Izin Sakit / Istirahat
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBirthCertificate}
                className="gap-[0.5rem] border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Plus className="h-[1.125rem] w-[1.125rem]" />
                Surat Keterangan Lahir
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLabReferral}
                className="gap-[0.5rem] border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <FileText className="h-[1.125rem] w-[1.125rem]" />
                Surat Pengantar Lab
              </Button>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[0.75rem] font-bold text-gray-400 uppercase tracking-[0.2em] block mb-[0.25rem]">No Antrean</span>
          <span className="text-[3rem] font-black text-purple-700 leading-none">{patient.noAntrean}</span>
        </div>
      </div>

      {/* Sub Tabs for KB, Imunisasi, ANC, Persalinan, PNC, or Mom Care Service */}
      {(isKbService || isImunisasiService || isAncService || isPersalinanService || isPncService || isMomCareService) && (
        <div className="flex items-center gap-[0.5rem] border-b border-gray-100 -mt-[1rem] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("umum")}
            className={cn(
              "px-[1.5rem] py-[1rem] font-bold text-[0.875rem] uppercase tracking-wider transition-all relative whitespace-nowrap",
              activeTab === "umum" ? "text-purple-700" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Pemeriksaan Umum
            {activeTab === "umum" && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-purple-700" />
            )}
          </button>
          {isKbService && (
            <button
              onClick={() => setActiveTab("kb")}
              className={cn(
                "px-[1.5rem] py-[1rem] font-bold text-[0.875rem] uppercase tracking-wider transition-all relative whitespace-nowrap",
                activeTab === "kb" ? "text-purple-700" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Pemeriksaan KB
              {activeTab === "kb" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-purple-700" />
              )}
            </button>
          )}
          {isImunisasiService && (
            <button
              onClick={() => setActiveTab("imunisasi")}
              className={cn(
                "px-[1.5rem] py-[1rem] font-bold text-[0.875rem] uppercase tracking-wider transition-all relative whitespace-nowrap",
                activeTab === "imunisasi" ? "text-purple-700" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Pemeriksaan Imunisasi
              {activeTab === "imunisasi" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-purple-700" />
              )}
            </button>
          )}
          {isAncService && (
            <button
              onClick={() => setActiveTab("anc")}
              className={cn(
                "px-[1.5rem] py-[1rem] font-bold text-[0.875rem] uppercase tracking-wider transition-all relative whitespace-nowrap",
                activeTab === "anc" ? "text-purple-700" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Pemeriksaan ANC
              {activeTab === "anc" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-purple-700" />
              )}
            </button>
          )}
          {isPersalinanService && (
            <button
              onClick={() => setActiveTab("persalinan")}
              className={cn(
                "px-[1.5rem] py-[1rem] font-bold text-[0.875rem] uppercase tracking-wider transition-all relative whitespace-nowrap",
                activeTab === "persalinan" ? "text-purple-700" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Pemeriksaan Persalinan
              {activeTab === "persalinan" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-purple-700" />
              )}
            </button>
          )}
          {isPncService && (
            <button
              onClick={() => setActiveTab("pnc")}
              className={cn(
                "px-[1.5rem] py-[1rem] font-bold text-[0.875rem] uppercase tracking-wider transition-all relative whitespace-nowrap",
                activeTab === "pnc" ? "text-purple-700" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Pemeriksaan PNC
              {activeTab === "pnc" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-purple-700" />
              )}
            </button>
          )}
          {isMomCareService && (
            <button
              onClick={() => setActiveTab("momCare")}
              className={cn(
                "px-[1.5rem] py-[1rem] font-bold text-[0.875rem] uppercase tracking-wider transition-all relative whitespace-nowrap",
                activeTab === "momCare" ? "text-purple-700" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Mom & Baby Care
              {activeTab === "momCare" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[3px] bg-purple-700" />
              )}
            </button>
          )}
        </div>
      )}

      <fieldset disabled={internalReadOnly} className="contents">
        {activeTab === "umum" && (
          <div className="space-y-[2rem]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2rem]">
            {/* a. Pemeriksaan Subjektif Dasar */}
        <div className="space-y-[1.5rem]">
          <h3 className="text-[1.25rem] font-bold text-gray-900 border-l-[3px] border-purple-600 pl-[0.75rem]">
            Subjektif
          </h3>
          <Card>
            <div className="space-y-[1.25rem]">
              <FormGroup id="keluhan" label="Keluhan Utama">
                <Textarea 
                  placeholder="Tuliskan keluhan pasien..." 
                  className="min-h-[6rem]"
                  value={formData.subjektif?.keluhan}
                  onChange={(e) => setFormData(prev => ({ ...prev, subjektif: { ...prev.subjektif!, keluhan: e.target.value } }))}
                />
              </FormGroup>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[1rem]">
                <FormGroup id="alergi" label="Riwayat Alergi">
                  <Input 
                    placeholder="Alergi" 
                    value={formData.subjektif?.riwAlergi}
                    onChange={(e) => setFormData(prev => ({ ...prev, subjektif: { ...prev.subjektif!, riwAlergi: e.target.value } }))}
                  />
                </FormGroup>
                <FormGroup id="penyakit" label="Riwayat Penyakit">
                  <Input 
                    placeholder="Riwayat penyakit" 
                    value={formData.subjektif?.riwPenyakit}
                    onChange={(e) => setFormData(prev => ({ ...prev, subjektif: { ...prev.subjektif!, riwPenyakit: e.target.value } }))}
                  />
                </FormGroup>
                <FormGroup id="keluarga" label="Riwayat Keluarga">
                  <Input 
                    placeholder="Riwayat keluarga" 
                    value={formData.subjektif?.riwKeluarga}
                    onChange={(e) => setFormData(prev => ({ ...prev, subjektif: { ...prev.subjektif!, riwKeluarga: e.target.value } }))}
                  />
                </FormGroup>
              </div>
            </div>
          </Card>
        </div>

        {/* b. Pemeriksaan Objektif Primary Survey */}
        <div className="space-y-[1.5rem]">
          <h3 className="text-[1.25rem] font-bold text-gray-900 border-l-[3px] border-purple-600 pl-[0.75rem]">
            Objektif: Primary Survey
          </h3>
          <Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-[1rem] gap-y-[1.25rem]">
              <FormGroup id="bb" label="BB (kg)">
                <Input type="number" placeholder="0" value={formData.objektifPrimary?.beratBadan} onChange={(e) => setFormData(prev => ({ ...prev, objektifPrimary: { ...prev.objektifPrimary!, beratBadan: e.target.value } }))} />
              </FormGroup>
              <FormGroup id="tb" label="TB (cm)">
                <Input type="number" placeholder="0" value={formData.objektifPrimary?.tinggiBadan} onChange={(e) => setFormData(prev => ({ ...prev, objektifPrimary: { ...prev.objektifPrimary!, tinggiBadan: e.target.value } }))} />
              </FormGroup>
              
              {/* TD SPLIT INPUT */}
              <div className="col-span-2">
                <FormGroup id="td" label="Tekanan Darah (mmHg)">
                  <div className="flex items-center gap-[0.5rem]">
                    <Input 
                      placeholder="Sis" 
                      className="text-center"
                      value={tdSistole} 
                      onChange={(e) => setTdSistole(e.target.value)} 
                    />
                    <span className="text-gray-400 font-bold text-xl">/</span>
                    <Input 
                      placeholder="Dia" 
                      className="text-center"
                      value={tdDiastole} 
                      onChange={(e) => setTdDiastole(e.target.value)} 
                    />
                  </div>
                </FormGroup>
              </div>

              <FormGroup id="hr" label="HR (bpm)">
                <Input type="number" placeholder="80" value={formData.objektifPrimary?.heartRate} onChange={(e) => setFormData(prev => ({ ...prev, objektifPrimary: { ...prev.objektifPrimary!, heartRate: e.target.value } }))} />
              </FormGroup>
              <FormGroup id="suhu" label="Suhu (°C)">
                <Input type="number" placeholder="36.5" value={formData.objektifPrimary?.suhu} onChange={(e) => setFormData(prev => ({ ...prev, objektifPrimary: { ...prev.objektifPrimary!, suhu: e.target.value } }))} />
              </FormGroup>
              <FormGroup id="rr" label="RR (/mnt)">
                <Input type="number" placeholder="20" value={formData.objektifPrimary?.respirationRate} onChange={(e) => setFormData(prev => ({ ...prev, objektifPrimary: { ...prev.objektifPrimary!, respirationRate: e.target.value } }))} />
              </FormGroup>
              <FormGroup id="spo2" label="SpO2 (%)">
                <Input type="number" placeholder="98" value={formData.objektifPrimary?.spo2} onChange={(e) => setFormData(prev => ({ ...prev, objektifPrimary: { ...prev.objektifPrimary!, spo2: e.target.value } }))} />
              </FormGroup>
            </div>
          </Card>
        </div>
      </div>

      {/* c. Pemeriksaan Objektif Pemeriksaan Fisik Dasar */}
      <div className="space-y-[1.5rem]">
        <h3 className="text-[1.25rem] font-bold text-gray-900 border-l-[3px] border-purple-600 pl-[0.75rem]">
          Objektif: Pemeriksaan Fisik Dasar
        </h3>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1.25rem]">
            <FormGroup id="pxKepalaLeher" label="Px Kepala Leher">
              <Textarea rows={2} placeholder="Normal" value={formData.objektifFisik?.pxKepalaLeher} onChange={(e) => setFormData(prev => ({ ...prev, objektifFisik: { ...prev.objektifFisik!, pxKepalaLeher: e.target.value } }))} />
            </FormGroup>
            <FormGroup id="pxDada" label="Px Dada">
              <Textarea rows={2} placeholder="Normal" value={formData.objektifFisik?.pxDada} onChange={(e) => setFormData(prev => ({ ...prev, objektifFisik: { ...prev.objektifFisik!, pxDada: e.target.value } }))} />
            </FormGroup>
            <FormGroup id="pxAbdomen" label="Px Abdomen">
              <Textarea rows={2} placeholder="Normal" value={formData.objektifFisik?.pxAbdomen} onChange={(e) => setFormData(prev => ({ ...prev, objektifFisik: { ...prev.objektifFisik!, pxAbdomen: e.target.value } }))} />
            </FormGroup>
            <FormGroup id="pxEkstremitasAtas" label="Px Ekstremitas Atas">
              <Textarea rows={2} placeholder="Normal" value={formData.objektifFisik?.pxEkstremitasAtas} onChange={(e) => setFormData(prev => ({ ...prev, objektifFisik: { ...prev.objektifFisik!, pxEkstremitasAtas: e.target.value } }))} />
            </FormGroup>
            <FormGroup id="pxEkstremitasBawah" label="Px Ekstremitas Bawah">
              <Textarea rows={2} placeholder="Normal" value={formData.objektifFisik?.pxEkstremitasBawah} onChange={(e) => setFormData(prev => ({ ...prev, objektifFisik: { ...prev.objektifFisik!, pxEkstremitasBawah: e.target.value } }))} />
            </FormGroup>
            <FormGroup id="pxGenitalUrinaria" label="Px Genital Urinaria">
              <Textarea rows={2} placeholder="Normal" value={formData.objektifFisik?.pxGenitalUrinaria} onChange={(e) => setFormData(prev => ({ ...prev, objektifFisik: { ...prev.objektifFisik!, pxGenitalUrinaria: e.target.value } }))} />
            </FormGroup>
            <FormGroup id="pxFisikLain" label="Px Fisik Lain">
              <Textarea rows={2} placeholder="Normal" value={formData.objektifFisik?.pxFisikLain} onChange={(e) => setFormData(prev => ({ ...prev, objektifFisik: { ...prev.objektifFisik!, pxFisikLain: e.target.value } }))} />
            </FormGroup>
          </div>
        </Card>
      </div>

      {/* d. Pemeriksaan Objektif Penunjang - MULTIPLE INPUT */}
      <div className="space-y-[1.5rem]">
        <div className="flex items-center justify-between">
          <h3 className="text-[1.25rem] font-bold text-gray-900 border-l-[3px] border-purple-600 pl-[0.75rem]">
            Objektif: Pemeriksaan Penunjang
          </h3>
          <Button variant="ghost" size="sm" onClick={handleAddPenunjang} className="text-purple-600 font-bold gap-[0.5rem]">
            <Plus className="h-[1.125rem] w-[1.125rem]" />
            Tambah Hasil Penunjang
          </Button>
        </div>
        <Card>
          <div className="space-y-[1rem]">
            {formData.penunjang?.length === 0 && (
              <div className="py-[3rem] text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg flex flex-col items-center gap-[0.5rem]">
                <Search className="h-[2rem] w-[2rem] text-gray-200" />
                <span>Belum ada data pemeriksaan penunjang</span>
              </div>
            )}
            {formData.penunjang?.map((p) => (
              <div key={p.id} className="flex gap-[1rem] items-end bg-gray-50 p-[1rem] rounded-lg border border-gray-100 animate-in fade-in zoom-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[1rem] flex-1">
                  <FormGroup id={`penunjang-jenis-${p.id}`} label="Jenis Pemeriksaan">
                    <Input placeholder="Misal: Lab Darah" value={p.jenis} onChange={(e) => {
                      const newPenunjang = [...formData.penunjang!];
                      const idx = newPenunjang.findIndex(item => item.id === p.id);
                      newPenunjang[idx].jenis = e.target.value;
                      setFormData(prev => ({ ...prev, penunjang: newPenunjang }));
                    }} />
                  </FormGroup>
                  <FormGroup id={`penunjang-hasil-${p.id}`} label="Hasil">
                    <Input placeholder="Hasil pemeriksaan" value={p.hasil} onChange={(e) => {
                      const newPenunjang = [...formData.penunjang!];
                      const idx = newPenunjang.findIndex(item => item.id === p.id);
                      newPenunjang[idx].hasil = e.target.value;
                      setFormData(prev => ({ ...prev, penunjang: newPenunjang }));
                    }} />
                  </FormGroup>
                  <FormGroup id={`penunjang-catatan-${p.id}`} label="Catatan">
                    <Input placeholder="Catatan tambahan" value={p.catatan} onChange={(e) => {
                      const newPenunjang = [...formData.penunjang!];
                      const idx = newPenunjang.findIndex(item => item.id === p.id);
                      newPenunjang[idx].catatan = e.target.value;
                      setFormData(prev => ({ ...prev, penunjang: newPenunjang }));
                    }} />
                  </FormGroup>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemovePenunjang(p.id)}
                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 mb-[0.25rem]"
                >
                  <Trash2 className="h-[1.125rem] w-[1.125rem]" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* e. Diagnosa (Assessment) - REUSABLE DROPDOWN */}
      <div className="space-y-[1.5rem]">
        <h3 className="text-[1.25rem] font-bold text-gray-900 border-l-[3px] border-purple-600 pl-[0.75rem]">
          Assessment (Diagnosa)
        </h3>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
            <FormGroup id="diagnosaUtama" label="Diagnosa Utama">
              <ComboBox 
                options={COMMON_DIAGNOSES}
                value={formData.diagnosa?.utama || ""}
                placeholder="Pilih atau cari diagnosa utama (ICD-10)..."
                onChange={(val) => setFormData(prev => ({ ...prev, diagnosa: { ...prev.diagnosa!, utama: val } }))}
              />
            </FormGroup>
            <FormGroup id="diagnosaSekunder" label="Diagnosa Sekunder">
              <ComboBox 
                options={COMMON_DIAGNOSES}
                value={formData.diagnosa?.sekunder || ""}
                placeholder="Pilih atau cari diagnosa sekunder..."
                onChange={(val) => setFormData(prev => ({ ...prev, diagnosa: { ...prev.diagnosa!, sekunder: val } }))}
              />
            </FormGroup>
          </div>
        </Card>
      </div>

      {/* f. Plan: Terapi Farmakologi - DIGITAL PRESCRIPTION FULL WIDTH */}
      <div className="space-y-[1.5rem]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[0.75rem]">
            <div className="p-[0.5rem] bg-purple-50 text-purple-700 rounded-lg">
              <Pill className="h-[1.25rem] w-[1.25rem]" />
            </div>
            <h3 className="text-[1.25rem] font-bold text-gray-900">
              Terapi Farmakologi (Peresepan Digital)
            </h3>
          </div>
          <Button variant="primary" size="sm" onClick={() => openObatModal()} className="gap-[0.5rem]">
            <Plus className="h-[1.125rem] w-[1.125rem]" />
            Tambah Obat
          </Button>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-[0.75rem] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-[1rem] text-left">Nama Obat / Sediaan</th>
                  <th className="pb-[1rem] text-left w-[12rem]">Dosis</th>
                  <th className="pb-[1rem] text-left w-[12rem]">Aturan Pakai</th>
                  <th className="pb-[1rem] text-center w-[6rem]">Jumlah</th>
                  <th className="pb-[1rem] text-right w-[10rem]">Harga (Rp)</th>
                  <th className="pb-[1rem] text-center w-[8rem]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {formData.plan?.terapiFarmakologi?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-[3rem] text-center text-gray-400 italic">
                      Belum ada resep obat yang ditambahkan
                    </td>
                  </tr>
                ) : (
                  formData.plan?.terapiFarmakologi?.map((obat, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-[1rem] pr-[1rem]">
                        <div className="font-semibold text-gray-900">{obat.namaObat}</div>
                        <div className="text-[0.75rem] text-gray-400">SKU: {obat.sku}</div>
                      </td>
                      <td className="py-[1rem] pr-[1rem]">
                        <span className="text-gray-600">{obat.dosis || "-"}</span>
                      </td>
                      <td className="py-[1rem] pr-[1rem]">
                        <span className="text-gray-600 font-medium italic">"{obat.aturanPakai || "-"}"</span>
                      </td>
                      <td className="py-[1rem] pr-[1rem] text-center">
                        <span className="font-bold text-purple-700">{obat.jumlah}</span>
                      </td>
                      <td className="py-[1rem] pr-[1rem] text-right">
                        <span className="font-bold text-gray-900">Rp {((obat.harga || 0) * (obat.jumlah || 1)).toLocaleString("id-ID")}</span>
                        <div className="text-[0.625rem] text-gray-400">@ Rp {(obat.harga || 0).toLocaleString("id-ID")}</div>
                      </td>
                      <td className="py-[1rem] text-center">
                        <div className="flex items-center justify-center gap-[0.5rem]">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openObatModal(idx)}
                            className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 p-0"
                          >
                            <Edit className="h-[1.125rem] w-[1.125rem]" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveObat(idx)}
                            className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-0"
                          >
                            <Trash2 className="h-[1.125rem] w-[1.125rem]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* g. Data BHP - FULL WIDTH */}
      <div className="space-y-[1.5rem]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[0.75rem]">
            <div className="p-[0.5rem] bg-emerald-50 text-emerald-700 rounded-lg">
              <Package className="h-[1.25rem] w-[1.25rem]" />
            </div>
            <h3 className="text-[1.25rem] font-bold text-gray-900">
              Penggunaan BHP (Bahan Habis Pakai)
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => openBhpModal()} className="text-emerald-700 font-bold gap-[0.5rem]">
            <Plus className="h-[1.125rem] w-[1.125rem]" />
            Tambah BHP
          </Button>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-[0.75rem] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-[1rem] text-left">Nama Barang / SKU</th>
                  <th className="pb-[1rem] text-center w-[8rem]">Jumlah</th>
                  <th className="pb-[1rem] text-center w-[8rem]">Satuan</th>
                  <th className="pb-[1rem] text-right w-[10rem]">Harga (Rp)</th>
                  <th className="pb-[1rem] text-center w-[8rem]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {formData.bhp?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-[3rem] text-center text-gray-400 italic">
                      Belum ada penggunaan BHP yang ditambahkan
                    </td>
                  </tr>
                ) : (
                  formData.bhp?.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-[1rem] pr-[1rem]">
                        <div className="font-semibold text-gray-900">{item.namaBhp}</div>
                        <div className="text-[0.75rem] text-gray-400">SKU: {item.sku}</div>
                      </td>
                      <td className="py-[1rem] pr-[1rem] text-center">
                        <span className="font-bold text-emerald-700">{item.jumlah}</span>
                      </td>
                      <td className="py-[1rem] pr-[1rem] text-center">
                        <span className="text-gray-500">{item.satuan}</span>
                      </td>
                      <td className="py-[1rem] pr-[1rem] text-right">
                        <span className="font-bold text-gray-900">Rp {((item.harga || 0) * (item.jumlah || 1)).toLocaleString("id-ID")}</span>
                        <div className="text-[0.625rem] text-gray-400">@ Rp {(item.harga || 0).toLocaleString("id-ID")}</div>
                      </td>
                      <td className="py-[1rem] text-center">
                        <div className="flex items-center justify-center gap-[0.5rem]">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openBhpModal(idx)}
                            className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 p-0"
                          >
                            <Edit className="h-[1.125rem] w-[1.125rem]" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveBhp(idx)}
                            className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-0"
                          >
                            <Trash2 className="h-[1.125rem] w-[1.125rem]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Plan: Layanan Lain - FULL WIDTH */}
      <div className="space-y-[1.5rem]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[0.75rem]">
            <div className="p-[0.5rem] bg-blue-50 text-blue-700 rounded-lg">
              <Syringe className="h-[1.25rem] w-[1.25rem]" />
            </div>
            <h3 className="text-[1.25rem] font-bold text-gray-900">
              Layanan & Tindakan Lain
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => openLayananModal()} className="text-blue-700 font-bold gap-[0.5rem]">
            <Plus className="h-[1.125rem] w-[1.125rem]" />
            Tambah Layanan
          </Button>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-[0.75rem] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-[1rem] text-left">Nama Layanan / Tindakan</th>
                  <th className="pb-[1rem] text-right w-[15rem]">Biaya (Rp)</th>
                  <th className="pb-[1rem] text-center w-[8rem]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {formData.plan?.layananLain?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-[3rem] text-center text-gray-400 italic">
                      Belum ada layanan/tindakan lain yang ditambahkan
                    </td>
                  </tr>
                ) : (
                  formData.plan?.layananLain?.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-[1rem] pr-[1rem]">
                        <span className="font-semibold text-gray-900">{item.nama}</span>
                      </td>
                      <td className="py-[1rem] pr-[1rem] text-right">
                        <span className="font-bold text-blue-700">Rp {item.biaya.toLocaleString("id-ID")}</span>
                      </td>
                      <td className="py-[1rem] text-center">
                        <div className="flex items-center justify-center gap-[0.5rem]">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openLayananModal(idx)}
                            className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 p-0"
                          >
                            <Edit className="h-[1.125rem] w-[1.125rem]" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveLayanan(idx)}
                            className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-0"
                          >
                            <Trash2 className="h-[1.125rem] w-[1.125rem]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      </div>
      )}

      {activeTab === "kb" && (
        <div className="space-y-[2rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-[1.25rem] font-bold text-gray-900 border-l-[3px] border-purple-600 pl-[0.75rem]">
            Data Pemeriksaan KB
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2rem]">
            <div className="lg:col-span-2 space-y-[2rem]">
              <Card>
                <CardContent className="pt-[1.5rem]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
                    <FormGroup id="kb-jml-anak" label="Jumlah Anak">
                      <Input 
                        type="number" 
                        placeholder="0"
                        value={formData.kb?.jumlahAnak}
                        onChange={(e) => handleKbChange("jumlahAnak", parseInt(e.target.value) || 0)}
                      />
                    </FormGroup>
                    <FormGroup id="kb-umur-anak" label="Umur Anak Terkecil">
                      <Input 
                        placeholder="Misal: 2 Tahun 3 Bulan"
                        value={formData.kb?.umurAnakTerkecil}
                        onChange={(e) => handleKbChange("umurAnakTerkecil", e.target.value)}
                      />
                    </FormGroup>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>PUS 4T (Tanda Bahaya/Risiko)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
                    <div className="space-y-[1rem]">
                      <label className="flex items-center gap-[0.75rem] cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-[1.25rem] h-[1.25rem] rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                          checked={formData.kb?.pus4T.terlaluMuda}
                          onChange={(e) => handleKbChange("pus4T", { ...formData.kb!.pus4T, terlaluMuda: e.target.checked })}
                        />
                        <span className="text-[0.875rem] text-gray-700 group-hover:text-purple-700 transition-colors font-medium">Terlalu Muda (&lt; 20 thn)</span>
                      </label>
                      <label className="flex items-center gap-[0.75rem] cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-[1.25rem] h-[1.25rem] rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                          checked={formData.kb?.pus4T.terlaluTua}
                          onChange={(e) => handleKbChange("pus4T", { ...formData.kb!.pus4T, terlaluTua: e.target.checked })}
                        />
                        <span className="text-[0.875rem] text-gray-700 group-hover:text-purple-700 transition-colors font-medium">Terlalu Tua (&gt; 35 thn)</span>
                      </label>
                    </div>
                    <div className="space-y-[1rem]">
                      <label className="flex items-center gap-[0.75rem] cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-[1.25rem] h-[1.25rem] rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                          checked={formData.kb?.pus4T.terlaluDekat}
                          onChange={(e) => handleKbChange("pus4T", { ...formData.kb!.pus4T, terlaluDekat: e.target.checked })}
                        />
                        <span className="text-[0.875rem] text-gray-700 group-hover:text-purple-700 transition-colors font-medium">Terlalu Dekat (&lt; 2 thn)</span>
                      </label>
                      <label className="flex items-center gap-[0.75rem] cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-[1.25rem] h-[1.25rem] rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                          checked={formData.kb?.pus4T.terlaluBanyak}
                          onChange={(e) => handleKbChange("pus4T", { ...formData.kb!.pus4T, terlaluBanyak: e.target.checked })}
                        />
                        <span className="text-[0.875rem] text-gray-700 group-hover:text-purple-700 transition-colors font-medium">Terlalu Banyak (&gt; 3 anak)</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-[2rem]">
              <Card>
                <CardHeader>
                  <CardTitle>Rencana Kontrasepsi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-[1.5rem]">
                    <FormGroup id="kb-jenis" label="Jenis Kontrasepsi">
                      <Select 
                        value={formData.kb?.jenisKontrasepsiId}
                        onChange={(e) => handleKbChange("jenisKontrasepsiId", e.target.value)}
                      >
                        <option value="">Pilih Kontrasepsi</option>
                        {(listKb.length > 0 ? listKb : dummyKbData).map(kb => (
                          <option key={kb.id} value={kb.id}>{kb.name}</option>
                        ))}
                      </Select>
                    </FormGroup>

                    {formData.kb?.jenisKontrasepsiId && (
                      <>
                        <FormGroup id="kb-tier" label="Tier Kunjungan">
                          <Select 
                            value={formData.kb?.kunjunganUlangTier}
                            onChange={(e) => handleKbChange("kunjunganUlangTier", parseInt(e.target.value))}
                          >
                            {(listKb.length > 0 ? listKb : dummyKbData).find(k => k.id === formData.kb?.jenisKontrasepsiId)?.tiers.map(t => (
                              <option key={t.tier} value={t.tier}>Kunjungan Ke-{t.tier}</option>
                            ))}
                          </Select>
                        </FormGroup>

                        <FormGroup id="kb-tgl-ulang" label="Waktu Kunjungan Ulang">
                          <Input 
                            type="date"
                            value={formData.kb?.kunjunganUlangDate}
                            onChange={(e) => handleKbChange("kunjunganUlangDate", e.target.value)}
                          />
                          <p className="text-[0.75rem] text-gray-500 mt-[0.5rem]">
                            Otomatis terisi berdasarkan durasi {(listKb.length > 0 ? listKb : dummyKbData).find(k => k.id === formData.kb?.jenisKontrasepsiId)?.name}
                          </p>
                        </FormGroup>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === "imunisasi" && (
        <div className="space-y-[2rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-[1.25rem] font-bold text-gray-900 border-l-[3px] border-purple-600 pl-[0.75rem]">
            Data Pemeriksaan Imunisasi
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2rem]">
            <div className="space-y-[2rem]">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Jenis Imunisasi & No Batch</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleAddDiberikan} className="text-purple-700 font-bold gap-[0.5rem]">
                    <Plus className="h-[1rem] w-[1rem]" />
                    Tambah
                  </Button>
                </CardHeader>
                <CardContent className="space-y-[1rem]">
                  {formData.imunisasi?.diberikan.map((item, idx) => (
                    <div key={idx} className="flex gap-[1rem] items-end animate-in fade-in slide-in-from-left-2">
                      <div className="flex-1">
                        <FormGroup id={`vaksin-${idx}`} label="Vaksin">
                          <Select 
                            value={item.vaksin}
                            onChange={(e) => {
                              const newList = [...formData.imunisasi!.diberikan];
                              newList[idx].vaksin = e.target.value;
                              handleImunisasiChange("diberikan", newList);
                            }}
                          >
                            <option value="">Pilih Vaksin</option>
                            {(listImunisasi.length > 0 ? listImunisasi : dummyImunisasiData).map(v => (
                              <option key={v.id} value={v.nama}>{v.nama}</option>
                            ))}
                          </Select>
                        </FormGroup>
                      </div>
                      <div className="flex-1">
                        <FormGroup id={`batch-${idx}`} label="No. Batch">
                          <Input 
                            placeholder="Mis: B12345"
                            value={item.noBatch}
                            onChange={(e) => {
                              const newList = [...formData.imunisasi!.diberikan];
                              newList[idx].noBatch = e.target.value;
                              handleImunisasiChange("diberikan", newList);
                            }}
                          />
                        </FormGroup>
                      </div>
                      {formData.imunisasi!.diberikan.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveDiberikan(idx)}
                          className="text-rose-400 mb-[0.5rem]"
                        >
                          <Trash2 className="h-[1.125rem] w-[1.125rem]" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-[2rem]">
              <Card>
                <CardHeader>
                  <CardTitle>Rencana Lanjutan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-[1.5rem]">
                    <FormGroup id="imun-next-list" label="Jenis Imunisasi Berikutnya (Multiple Select)">
                      <div className="space-y-[1rem]">
                        <ComboBox 
                          options={(listImunisasi.length > 0 ? listImunisasi : dummyImunisasiData).map(v => v.nama)}
                          value=""
                          onChange={(val) => {
                            if (val && !formData.imunisasi?.berikutnya.includes(val)) {
                              toggleBerikutnya(val);
                            }
                          }}
                          placeholder="Cari atau pilih imunisasi berikutnya..."
                        />
                        <div className="flex flex-wrap gap-[0.5rem]">
                          {formData.imunisasi?.berikutnya.map(v => (
                            <div key={v} className="flex items-center gap-[0.375rem] px-[0.75rem] py-[0.375rem] bg-purple-50 text-purple-700 rounded-full border border-purple-100 text-[0.75rem] font-bold animate-in zoom-in-95">
                              {v}
                              <button onClick={() => toggleBerikutnya(v)} className="hover:text-rose-500">
                                <Trash2 className="h-[0.875rem] w-[0.875rem]" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FormGroup>

                    <FormGroup id="imun-next-date" label="Kunjungan Imunisasi Berikutnya">
                    <Input 
                      type="date"
                      value={formData.imunisasi?.tglKembali}
                      onChange={(e) => handleImunisasiChange("tglKembali", e.target.value)}
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === "anc" && (
        <div className="space-y-[2rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-[1.25rem] font-bold text-gray-900 border-l-[3px] border-purple-600 pl-[0.75rem]">
            Data Pemeriksaan Antenatal Care (ANC)
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2rem]">
            <div className="lg:col-span-2 space-y-[2rem]">
              <Card>
                <CardHeader>
                  <CardTitle>Status Kehamilan & Riwayat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-[1.5rem]">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-[1.5rem]">
                    <FormGroup id="anc-periksa-ke" label="Periksa Ke">
                      <Input 
                        type="number"
                        value={formData.anc?.periksaKe}
                        onChange={(e) => handleAncChange("periksaKe", parseInt(e.target.value) || 0)}
                      />
                    </FormGroup>
                    <FormGroup id="anc-gestasi" label="Gestasi (G)">
                      <Input 
                        type="number"
                        value={formData.anc?.gestasi}
                        onChange={(e) => handleAncChange("gestasi", parseInt(e.target.value) || 0)}
                      />
                    </FormGroup>
                    <FormGroup id="anc-partus" label="Partus (P)">
                      <Input 
                        type="number"
                        value={formData.anc?.partus}
                        onChange={(e) => handleAncChange("partus", parseInt(e.target.value) || 0)}
                      />
                    </FormGroup>
                    <FormGroup id="anc-abortus" label="Abortus (A)">
                      <Input 
                        type="number"
                        value={formData.anc?.abortus}
                        onChange={(e) => handleAncChange("abortus", parseInt(e.target.value) || 0)}
                      />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
                    <FormGroup id="anc-hpht" label="HPHT">
                      <Input 
                        type="date"
                        value={formData.anc?.hpht}
                        onChange={(e) => handleAncChange("hpht", e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup id="anc-usia" label="Usia Kehamilan (Otomatis)">
                      <Input 
                        value={formData.anc?.usiaKehamilan}
                        readOnly
                        placeholder="Pilih HPHT dahulu"
                        className="bg-gray-50 font-bold text-purple-700"
                      />
                    </FormGroup>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pemeriksaan Fisik Janin & Lab</CardTitle>
                </CardHeader>
                <CardContent className="space-y-[1.5rem]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5rem]">
                    <FormGroup id="anc-tfu" label="Tinggi Fundus Uteri (cm)">
                      <Input 
                        placeholder="cm"
                        value={formData.anc?.tfu}
                        onChange={(e) => handleAncChange("tfu", e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup id="anc-letak" label="Letak Janin">
                      <Input 
                        placeholder="Kepala/Sungsang/Lintang"
                        value={formData.anc?.letakJanin}
                        onChange={(e) => handleAncChange("letakJanin", e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup id="anc-djj" label="DJJ (x/menit)">
                      <Input 
                        placeholder="Djj"
                        value={formData.anc?.djj}
                        onChange={(e) => handleAncChange("djj", e.target.value)}
                      />
                    </FormGroup>
                  </div>
                  <FormGroup id="anc-lab" label="Pemeriksaan Laboratorium">
                    <Textarea 
                      placeholder="Input hasil laboratorium..."
                      value={formData.anc?.pxLab}
                      onChange={(e) => handleAncChange("pxLab", e.target.value)}
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-[2rem]">
              <Card>
                <CardHeader>
                  <CardTitle>Risiko & Rencana</CardTitle>
                </CardHeader>
                <CardContent className="space-y-[1.5rem]">
                  <FormGroup id="anc-risiko" label="Jenis Risiko Tinggi (Multiple Select + Custom)">
                    <div className="space-y-[1rem]">
                      <ComboBox 
                        options={["Anemia", "Hipertensi", "Diabetes", "KEK", "Preeklampsia", "Jantung", "Asma"]}
                        value=""
                        onChange={(val) => {
                          if (val && !formData.anc?.risikoTinggi.includes(val)) {
                            toggleRisikoTinggi(val);
                          }
                        }}
                        placeholder="Cari atau ketik risiko baru..."
                      />
                      <div className="flex flex-wrap gap-[0.5rem]">
                        {formData.anc?.risikoTinggi.map(r => (
                          <div key={r} className="flex items-center gap-[0.375rem] px-[0.75rem] py-[0.375rem] bg-purple-50 text-purple-700 rounded-full border border-purple-100 text-[0.75rem] font-bold animate-in zoom-in-95">
                            {r}
                            <button onClick={() => toggleRisikoTinggi(r)} className="hover:text-rose-500">
                              <Trash2 className="h-[0.875rem] w-[0.875rem]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </FormGroup>

                  <FormGroup id="anc-next" label="Kunjungan Ulang ANC">
                    <Input 
                      type="date"
                      value={formData.anc?.tglKembaliAnc}
                      onChange={(e) => handleAncChange("tglKembaliAnc", e.target.value)}
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === "persalinan" && (
        <div className="space-y-[2rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-[1.25rem] font-bold text-gray-900 border-l-[3px] border-purple-600 pl-[0.75rem]">
            Data Pemeriksaan Persalinan
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2rem]">
            <div className="lg:col-span-2 space-y-[2rem]">
              <Card>
                <CardHeader>
                  <CardTitle>Status Kehamilan & Risiko</CardTitle>
                </CardHeader>
                <CardContent className="space-y-[1.5rem]">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-[1.5rem]">
                    <FormGroup id="persalinan-periksa-ke" label="Periksa Ke">
                      <Input 
                        type="number"
                        value={formData.persalinan?.periksaKe}
                        onChange={(e) => handlePersalinanChange("periksaKe", parseInt(e.target.value) || 0)}
                      />
                    </FormGroup>
                    <div className="md:col-span-3">
                      <FormGroup id="persalinan-gpa" label="Status GPA (G-P-A)">
                        <div className="flex gap-[1rem]">
                          <Input 
                            type="number"
                            placeholder="G"
                            value={formData.persalinan?.gestasi}
                            onChange={(e) => handlePersalinanChange("gestasi", parseInt(e.target.value) || 0)}
                          />
                          <Input 
                            type="number"
                            placeholder="P"
                            value={formData.persalinan?.partus}
                            onChange={(e) => handlePersalinanChange("partus", parseInt(e.target.value) || 0)}
                          />
                          <Input 
                            type="number"
                            placeholder="A"
                            value={formData.persalinan?.abortus}
                            onChange={(e) => handlePersalinanChange("abortus", parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </FormGroup>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
                    <FormGroup id="persalinan-hpht" label="HPHT">
                      <Input 
                        type="date"
                        value={formData.persalinan?.hpht}
                        onChange={(e) => handlePersalinanChange("hpht", e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup id="persalinan-usia" label="Usia Kehamilan">
                      <Input 
                        value={formData.persalinan?.usiaKehamilan}
                        readOnly
                        placeholder="Pilih HPHT dahulu"
                        className="bg-gray-50 font-bold text-purple-700"
                      />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5rem]">
                    <FormGroup id="persalinan-tfu" label="TFU (cm)">
                      <Input 
                        placeholder="cm"
                        value={formData.persalinan?.tfu}
                        onChange={(e) => handlePersalinanChange("tfu", e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup id="persalinan-letak" label="Letak Janin">
                      <Input 
                        placeholder="Kepala/Sungsang"
                        value={formData.persalinan?.letakJanin}
                        onChange={(e) => handlePersalinanChange("letakJanin", e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup id="persalinan-djj" label="DJJ">
                      <Input 
                        placeholder="x/mnt"
                        value={formData.persalinan?.djj}
                        onChange={(e) => handlePersalinanChange("djj", e.target.value)}
                      />
                    </FormGroup>
                  </div>
                  <FormGroup id="persalinan-lab" label="Pemeriksaan Lab">
                    <Textarea 
                      placeholder="Input hasil lab..."
                      value={formData.persalinan?.pxLab}
                      onChange={(e) => handlePersalinanChange("pxLab", e.target.value)}
                    />
                  </FormGroup>
                </CardContent>
              </Card>

              {formData.persalinan?.tindakLanjut === "Persalinan" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Data Kelahiran Bayi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-[1.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
                      <FormGroup id="lahir-waktu" label="Tanggal & Jam Lahir">
                        <Input 
                          type="datetime-local"
                          value={formData.persalinan?.dataLahir?.waktuLahir}
                          onChange={(e) => handlePersalinanChange("dataLahir.waktuLahir", e.target.value)}
                        />
                      </FormGroup>
                      <FormGroup id="lahir-tindakan" label="Tindakan Persalinan">
                        <Select
                          value={formData.persalinan?.dataLahir?.tindakan}
                          onChange={(e) => handlePersalinanChange("dataLahir.tindakan", e.target.value)}
                        >
                          <option value="Normal">Normal (Spontan)</option>
                          <option value="Vakum">Vakum</option>
                          <option value="Forceps">Forceps</option>
                          <option value="SC">Sectio Caesarea (SC)</option>
                          <option value="Lainnya">Lainnya</option>
                        </Select>
                      </FormGroup>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5rem]">
                      <FormGroup id="lahir-bbl" label="BBL (Berat Badan Lahir)">
                        <Select
                          value={formData.persalinan?.dataLahir?.bbl}
                          onChange={(e) => handlePersalinanChange("dataLahir.bbl", e.target.value)}
                        >
                          <option value="Cukup">Cukup (&ge; 2500g)</option>
                          <option value="Rendah">Rendah (1500-2499g)</option>
                          <option value="Sangat Rendah">Sangat Rendah (&lt; 1500g)</option>
                        </Select>
                      </FormGroup>
                      <FormGroup id="lahir-jk" label="Jenis Kelamin">
                        <Select
                          value={formData.persalinan?.dataLahir?.jkBayi}
                          onChange={(e) => handlePersalinanChange("dataLahir.jkBayi", e.target.value)}
                        >
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </Select>
                      </FormGroup>
                      <FormGroup id="lahir-apgar" label="APGAR Score">
                        <Input 
                          placeholder="Misal: 7/8/9"
                          value={formData.persalinan?.dataLahir?.apgarScore}
                          onChange={(e) => handlePersalinanChange("dataLahir.apgarScore", e.target.value)}
                        />
                      </FormGroup>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-[1rem]">
                      <FormGroup id="lahir-bb" label="BB (gram)">
                        <Input type="number" value={formData.persalinan?.dataLahir?.bbBayi} onChange={(e) => handlePersalinanChange("dataLahir.bbBayi", parseInt(e.target.value) || 0)} />
                      </FormGroup>
                      <FormGroup id="lahir-pb" label="PB (cm)">
                        <Input type="number" value={formData.persalinan?.dataLahir?.pbBayi} onChange={(e) => handlePersalinanChange("dataLahir.pbBayi", parseInt(e.target.value) || 0)} />
                      </FormGroup>
                      <FormGroup id="lahir-lk" label="LK (cm)">
                        <Input type="number" value={formData.persalinan?.dataLahir?.lkBayi} onChange={(e) => handlePersalinanChange("dataLahir.lkBayi", parseInt(e.target.value) || 0)} />
                      </FormGroup>
                      <FormGroup id="lahir-ld" label="LD (cm)">
                        <Input type="number" value={formData.persalinan?.dataLahir?.ldBayi} onChange={(e) => handlePersalinanChange("dataLahir.ldBayi", parseInt(e.target.value) || 0)} />
                      </FormGroup>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
                      <FormGroup id="lahir-ibu" label="Keadaan Ibu">
                        <Input value={formData.persalinan?.dataLahir?.keadaanIbu} onChange={(e) => handlePersalinanChange("dataLahir.keadaanIbu", e.target.value)} />
                      </FormGroup>
                      <FormGroup id="lahir-anak" label="Keadaan Anak">
                        <Input value={formData.persalinan?.dataLahir?.keadaanAnak} onChange={(e) => handlePersalinanChange("dataLahir.keadaanAnak", e.target.value)} />
                      </FormGroup>
                    </div>
                  </CardContent>
                </Card>
              )}

              {formData.persalinan?.tindakLanjut === "Rujuk" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Data Rujukan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-[1.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
                      <FormGroup id="rujuk-waktu" label="Tanggal & Jam Rujuk">
                        <Input 
                          type="datetime-local"
                          value={formData.persalinan?.dataRujuk?.waktuRujuk}
                          onChange={(e) => handlePersalinanChange("dataRujuk.waktuRujuk", e.target.value)}
                        />
                      </FormGroup>
                      <FormGroup id="rujuk-tujuan" label="Tujuan Rujukan">
                        <Input 
                          placeholder="Nama Rumah Sakit"
                          value={formData.persalinan?.dataRujuk?.tujuan}
                          onChange={(e) => handlePersalinanChange("dataRujuk.tujuan", e.target.value)}
                        />
                      </FormGroup>
                    </div>
                    <FormGroup id="rujuk-alasan" label="Alasan & Kondisi Rujuk">
                      <Textarea 
                        placeholder="Input alasan rujukan..."
                        value={formData.persalinan?.dataRujuk?.alasan}
                        onChange={(e) => handlePersalinanChange("dataRujuk.alasan", e.target.value)}
                      />
                    </FormGroup>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-[2rem]">
              <Card>
                <CardHeader>
                  <CardTitle>Rencana & Risiko</CardTitle>
                </CardHeader>
                <CardContent className="space-y-[1.5rem]">
                  <FormGroup id="persalinan-risiko" label="Risiko Tinggi (Multiple Select + Custom)">
                    <div className="space-y-[1rem]">
                      <ComboBox 
                        options={["Anemia", "Hipertensi", "Diabetes", "KEK", "Letak Lintang", "KPD", "Lainnya"]}
                        value=""
                        onChange={(val) => {
                          if (val && !formData.persalinan?.risikoTinggi.includes(val)) {
                            const next = [...formData.persalinan!.risikoTinggi, val];
                            handlePersalinanChange("risikoTinggi", next);
                          }
                        }}
                        placeholder="Tambah risiko..."
                      />
                      <div className="flex flex-wrap gap-[0.5rem]">
                        {formData.persalinan?.risikoTinggi.map(r => (
                          <div key={r} className="flex items-center gap-[0.375rem] px-[0.75rem] py-[0.375rem] bg-purple-50 text-purple-700 rounded-full border border-purple-100 text-[0.75rem] font-bold">
                            {r}
                            <button onClick={() => {
                              const next = formData.persalinan!.risikoTinggi.filter(item => item !== r);
                              handlePersalinanChange("risikoTinggi", next);
                            }} className="hover:text-rose-500">
                              <Trash2 className="h-[0.875rem] w-[0.875rem]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </FormGroup>

                  <FormGroup id="persalinan-tindak-lanjut" label="Tindak Lanjut">
                    <div className="flex items-center bg-gray-50 p-[0.25rem] rounded-[0.75rem] border border-gray-200">
                      <button
                        onClick={() => handlePersalinanChange("tindakLanjut", "Persalinan")}
                        className={cn(
                          "flex-1 py-[0.75rem] text-[0.875rem] font-bold rounded-[0.5rem] transition-all",
                          formData.persalinan?.tindakLanjut === "Persalinan"
                            ? "bg-purple-700 text-white shadow-md"
                            : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        Persalinan
                      </button>
                      <button
                        onClick={() => handlePersalinanChange("tindakLanjut", "Rujuk")}
                        className={cn(
                          "flex-1 py-[0.75rem] text-[0.875rem] font-bold rounded-[0.5rem] transition-all",
                          formData.persalinan?.tindakLanjut === "Rujuk"
                            ? "bg-rose-600 text-white shadow-md"
                            : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        Rujuk
                      </button>
                    </div>
                  </FormGroup>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === "pnc" && (
        <div className="space-y-[2rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-[1.25rem] font-bold text-gray-900 border-l-[3px] border-purple-600 pl-[0.75rem]">
              Data Pemeriksaan Post Natal Care (PNC)
            </h3>
            <div className="flex bg-gray-100 p-[0.25rem] rounded-[0.75rem]">
              {(["KF", "KN", "Akhir Nifas"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handlePncChange("jenisKunjungan", mode)}
                  className={cn(
                    "px-[1.25rem] py-[0.5rem] text-[0.75rem] font-bold rounded-[0.5rem] transition-all",
                    formData.pnc?.jenisKunjungan === mode 
                      ? "bg-white text-purple-700 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {mode === "KF" ? "Post Natal KF" : mode === "KN" ? "Post Natal KN" : "Akhir Nifas"}
                </button>
              ))}
            </div>
          </div>

          {formData.pnc?.jenisKunjungan === "KF" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2rem]">
              <Card>
                <CardHeader><CardTitle>Riwayat & Kondisi Ibu</CardTitle></CardHeader>
                <CardContent className="space-y-[1.5rem]">
                  <FormGroup id="kf-riwayat" label="Riwayat Kehamilan">
                    <Input value={formData.pnc?.kf?.riwayatKehamilan} onChange={(e) => handlePncChange("kf.riwayatKehamilan", e.target.value)} placeholder="Riwayat kehamilan sebelumnya..." />
                  </FormGroup>
                  <div className="grid grid-cols-2 gap-[1rem]">
                    <FormGroup id="kf-cara" label="Cara Persalinan">
                      <Input value={formData.pnc?.kf?.caraPersalinan} onChange={(e) => handlePncChange("kf.caraPersalinan", e.target.value)} placeholder="Normal/SC/Lainnya" />
                    </FormGroup>
                    <FormGroup id="kf-komplikasi" label="Komplikasi Persalinan">
                      <Input value={formData.pnc?.kf?.komplikasiPersalinan} onChange={(e) => handlePncChange("kf.komplikasiPersalinan", e.target.value)} placeholder="Ada/Tidak ada..." />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-[1rem]">
                    <FormGroup id="kf-td" label="TD (mmHg)">
                      <Input value={formData.pnc?.kf?.tandaVital.td} onChange={(e) => handlePncChange("kf.tandaVital.td", e.target.value)} placeholder="120/80" />
                    </FormGroup>
                    <FormGroup id="kf-nadi" label="Nadi (x/mnt)">
                      <Input value={formData.pnc?.kf?.tandaVital.nadi} onChange={(e) => handlePncChange("kf.tandaVital.nadi", e.target.value)} placeholder="80" />
                    </FormGroup>
                    <FormGroup id="kf-nafas" label="Nafas (x/mnt)">
                      <Input value={formData.pnc?.kf?.tandaVital.nafas} onChange={(e) => handlePncChange("kf.tandaVital.nafas", e.target.value)} placeholder="20" />
                    </FormGroup>
                    <FormGroup id="kf-suhu" label="Suhu (°C)">
                      <Input value={formData.pnc?.kf?.tandaVital.suhu} onChange={(e) => handlePncChange("kf.tandaVital.suhu", e.target.value)} placeholder="36.5" />
                    </FormGroup>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Pemeriksaan Fisik & Terapi</CardTitle></CardHeader>
                <CardContent className="space-y-[1rem]">
                  <div className="grid grid-cols-2 gap-[1rem]">
                    <FormGroup id="kf-kontraksi" label="Kontraksi Rahim / TFU">
                      <Input value={formData.pnc?.kf?.kontraksiTfu} onChange={(e) => handlePncChange("kf.kontraksiTfu", e.target.value)} />
                    </FormGroup>
                    <FormGroup id="kf-perdarahan" label="Perdarahan">
                      <Input value={formData.pnc?.kf?.perdarahan} onChange={(e) => handlePncChange("kf.perdarahan", e.target.value)} />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-2 gap-[1rem]">
                    <FormGroup id="kf-lochea" label="Lochea">
                      <Input value={formData.pnc?.kf?.lochea} onChange={(e) => handlePncChange("kf.lochea", e.target.value)} />
                    </FormGroup>
                    <FormGroup id="kf-bab" label="BAB / BAK">
                      <Input value={formData.pnc?.kf?.babBak} onChange={(e) => handlePncChange("kf.babBak", e.target.value)} />
                    </FormGroup>
                  </div>
                  <FormGroup id="kf-terapi" label="Terapi">
                    <Input value={formData.pnc?.kf?.terapi} onChange={(e) => handlePncChange("kf.terapi", e.target.value)} />
                  </FormGroup>
                  <FormGroup id="kf-nasihat" label="Nasihat yang Disampaikan">
                    <Input value={formData.pnc?.kf?.nasihat} onChange={(e) => handlePncChange("kf.nasihat", e.target.value)} />
                  </FormGroup>
                  <div className="grid grid-cols-2 gap-[1rem]">
                    <FormGroup id="kf-kb" label="KB Pascasalin">
                      <Input value={formData.pnc?.kf?.kbPascasalin} onChange={(e) => handlePncChange("kf.kbPascasalin", e.target.value)} />
                    </FormGroup>
                    <FormGroup id="kf-darah" label="Pemeriksaan Darah">
                      <Input value={formData.pnc?.kf?.pxDarah} onChange={(e) => handlePncChange("kf.pxDarah", e.target.value)} />
                    </FormGroup>
                  </div>
                  <FormGroup id="kf-next" label="Jadwal Periksa Ulang">
                    <Input type="date" value={formData.pnc?.kf?.tglKembali} onChange={(e) => handlePncChange("kf.tglKembali", e.target.value)} />
                  </FormGroup>
                </CardContent>
              </Card>
            </div>
          )}

          {formData.pnc?.jenisKunjungan === "KN" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2rem]">
              <Card>
                <CardHeader><CardTitle>Informasi Dasar & Injeksi</CardTitle></CardHeader>
                <CardContent className="space-y-[1.5rem]">
                  <div className="grid grid-cols-2 gap-[1rem]">
                    <FormGroup id="kn-tgl" label="Tanggal Lahir Bayi">
                      <Input type="date" value={formData.pnc?.kn?.tglLahir} onChange={(e) => handlePncChange("kn.tglLahir", e.target.value)} />
                    </FormGroup>
                    <div className="grid grid-cols-3 gap-[0.5rem]">
                      <FormGroup id="kn-bb" label="BB (kg)">
                        <Input type="number" step="0.1" placeholder="kg" onChange={(e) => {
                          const val = e.target.value;
                          const current = formData.pnc?.kn?.bbPbPenolong || "//";
                          const [bb, pb, pen] = current.split(" / ");
                          handlePncChange("kn.bbPbPenolong", `${val}kg / ${pb || ""} / ${pen || ""}`);
                        }} />
                      </FormGroup>
                      <FormGroup id="kn-pb" label="PB (cm)">
                        <Input type="number" placeholder="cm" onChange={(e) => {
                          const val = e.target.value;
                          const current = formData.pnc?.kn?.bbPbPenolong || "//";
                          const [bb, pb, pen] = current.split(" / ");
                          handlePncChange("kn.bbPbPenolong", `${bb || ""} / ${val}cm / ${pen || ""}`);
                        }} />
                      </FormGroup>
                      <FormGroup id="kn-penolong" label="Penolong">
                        <Input placeholder="Bidan/Dokter" onChange={(e) => {
                          const val = e.target.value;
                          const current = formData.pnc?.kn?.bbPbPenolong || "//";
                          const [bb, pb, pen] = current.split(" / ");
                          handlePncChange("kn.bbPbPenolong", `${bb || ""} / ${pb || ""} / ${val}`);
                        }} />
                      </FormGroup>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-[1rem] p-[1rem] bg-gray-50 rounded-[0.75rem] border border-gray-100">
                    <label className="flex items-center gap-[0.75rem] cursor-pointer">
                      <input type="checkbox" checked={formData.pnc?.kn?.vitK} onChange={(e) => handlePncChange("kn.vitK", e.target.checked)} className="w-[1.125rem] h-[1.125rem] rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-[0.875rem] font-medium text-gray-700">Injeksi Vit K</span>
                    </label>
                    <label className="flex items-center gap-[0.75rem] cursor-pointer">
                      <input type="checkbox" checked={formData.pnc?.kn?.imd} onChange={(e) => handlePncChange("kn.imd", e.target.checked)} className="w-[1.125rem] h-[1.125rem] rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-[0.875rem] font-medium text-gray-700">IMD</span>
                    </label>
                    <label className="flex items-center gap-[0.75rem] cursor-pointer">
                      <input type="checkbox" checked={formData.pnc?.kn?.salepMata} onChange={(e) => handlePncChange("kn.salepMata", e.target.checked)} className="w-[1.125rem] h-[1.125rem] rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-[0.875rem] font-medium text-gray-700">Salep Mata</span>
                    </label>
                    <label className="flex items-center gap-[0.75rem] cursor-pointer">
                      <input type="checkbox" checked={formData.pnc?.kn?.hb0} onChange={(e) => handlePncChange("kn.hb0", e.target.checked)} className="w-[1.125rem] h-[1.125rem] rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="text-[0.875rem] font-medium text-gray-700">Injeksi Hb0</span>
                    </label>
                  </div>
                  <FormGroup id="kn-sosialisasi" label="Sosialisasi unijet Hb dan BCG">
                    <Input value={formData.pnc?.kn?.sosialisasiHbBcg} onChange={(e) => handlePncChange("kn.sosialisasiHbBcg", e.target.value)} />
                  </FormGroup>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Pemeriksaan Fisik Neonatus</CardTitle></CardHeader>
                <CardContent className="space-y-[1rem] grid grid-cols-1 md:grid-cols-2 gap-x-[1.5rem]">
                  <FormGroup id="kn-kejang" label="Kemungkinan Kejang">
                    <Input value={formData.pnc?.kn?.pxKejang} onChange={(e) => handlePncChange("kn.pxKejang", e.target.value)} />
                  </FormGroup>
                  <FormGroup id="kn-nafas" label="Gangguan Nafas">
                    <Input value={formData.pnc?.kn?.pxNafas} onChange={(e) => handlePncChange("kn.pxNafas", e.target.value)} />
                  </FormGroup>
                  <FormGroup id="kn-hipotermi" label="Hipotermi">
                    <Input value={formData.pnc?.kn?.pxHipotermi} onChange={(e) => handlePncChange("kn.pxHipotermi", e.target.value)} />
                  </FormGroup>
                  <FormGroup id="kn-bakteri" label="Infeksi Bakteri">
                    <Input value={formData.pnc?.kn?.pxBakteri} onChange={(e) => handlePncChange("kn.pxBakteri", e.target.value)} />
                  </FormGroup>
                  <FormGroup id="kn-ikterus" label="Ikterus">
                    <Input value={formData.pnc?.kn?.pxIkterus} onChange={(e) => handlePncChange("kn.pxIkterus", e.target.value)} />
                  </FormGroup>
                  <FormGroup id="kn-salcerna" label="Gangguan Saluran Cerna">
                    <Input value={formData.pnc?.kn?.pxSalCerna} onChange={(e) => handlePncChange("kn.pxSalCerna", e.target.value)} />
                  </FormGroup>
                  <FormGroup id="kn-diare" label="Adanya Diare">
                    <Input value={formData.pnc?.kn?.pxDiare} onChange={(e) => handlePncChange("kn.pxDiare", e.target.value)} />
                  </FormGroup>
                  <FormGroup id="kn-asi" label="Masalah ASI / BB Rendah">
                    <Input value={formData.pnc?.kn?.pxAsiBb} onChange={(e) => handlePncChange("kn.pxAsiBb", e.target.value)} />
                  </FormGroup>
                  <div className="md:col-span-2">
                    <FormGroup id="kn-pusat" label="Memeriksa Tali Pusat">
                      <Input value={formData.pnc?.kn?.pxTaliPusat} onChange={(e) => handlePncChange("kn.pxTaliPusat", e.target.value)} />
                    </FormGroup>
                  </div>
                  <div className="md:col-span-2">
                    <FormGroup id="kn-next" label="Jadwal Periksa Ulang">
                      <Input type="date" value={formData.pnc?.kn?.tglKembali} onChange={(e) => handlePncChange("kn.tglKembali", e.target.value)} />
                    </FormGroup>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {formData.pnc?.jenisKunjungan === "Akhir Nifas" && (
            <Card>
              <CardHeader><CardTitle>Evaluasi Akhir Nifas</CardTitle></CardHeader>
              <CardContent className="space-y-[1.5rem]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
                  <FormGroup id="an-ibu" label="Keadaan Ibu">
                    <Input value={formData.pnc?.akhirNifas?.keadaanIbu} onChange={(e) => handlePncChange("akhirNifas.keadaanIbu", e.target.value)} placeholder="Sehat/Komplikasi..." />
                  </FormGroup>
                  <FormGroup id="an-bayi" label="Keadaan Bayi">
                    <Input value={formData.pnc?.akhirNifas?.keadaanBayi} onChange={(e) => handlePncChange("akhirNifas.keadaanBayi", e.target.value)} placeholder="Sehat/Sakit..." />
                  </FormGroup>
                </div>
                <FormGroup id="an-next" label="Jadwal Periksa Ulang">
                  <Input type="date" value={formData.pnc?.akhirNifas?.tglKembali} onChange={(e) => handlePncChange("akhirNifas.tglKembali", e.target.value)} />
                </FormGroup>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "momCare" && (
        <div className="space-y-[2rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-[1.25rem] font-bold text-gray-900 border-l-[3px] border-purple-600 pl-[0.75rem]">
            Data Mom & Baby Care
          </h3>
          <Card>
            <CardContent className="space-y-[1.5rem] pt-[1.5rem]">
              <FormGroup id="momcare-jenis" label="Mom & Baby Care (Pilih Layanan)">
                <Select value={formData.momCare?.jenisLayanan} onChange={(e) => handleMomCareChange("jenisLayanan", e.target.value)}>
                  <option value="">Pilih Layanan Care</option>
                  <option value="Pijat Bayi">Pijat Bayi</option>
                  <option value="Baby Spa">Baby Spa</option>
                  <option value="Pijat Oksitosin">Pijat Oksitosin (Ibu)</option>
                  <option value="Perawatan Tali Pusat">Perawatan Tali Pusat</option>
                  <option value="Memandikan Bayi">Memandikan Bayi</option>
                  <option value="Lainnya">Lainnya</option>
                </Select>
              </FormGroup>
              <FormGroup id="momcare-catatan" label="Catatan khusus Layanan">
                <Textarea 
                  placeholder="Tuliskan detail layanan atau instruksi khusus..."
                  value={formData.momCare?.catatanKhusus}
                  onChange={(e) => handleMomCareChange("catatanKhusus", e.target.value)}
                />
              </FormGroup>
            </CardContent>
          </Card>
        </div>
      )}

      {/* h. Catatan & i. Petugas - DROPDOWN FOR PETUGAS */}
      <div className="space-y-[1.5rem]">
        <h3 className="text-[1.25rem] font-bold text-gray-900 border-l-[3px] border-purple-600 pl-[0.75rem]">
          Penutup & Verifikasi
        </h3>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">
            <FormGroup id="catatanPemeriksaan" label="Catatan Pemeriksaan Tambahan">
              <Textarea 
                placeholder="Tuliskan catatan tambahan jika ada..." 
                className="min-h-[4rem]"
                value={formData.catatan} 
                onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))} 
              />
            </FormGroup>
            <FormGroup id="petugasPemeriksa" label="Petugas Pemeriksa">
              <Select 
                value={formData.petugas} 
                onChange={(e) => setFormData(prev => ({ ...prev, petugas: e.target.value }))}
              >
                {petugasOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
              <p className="text-[0.75rem] text-gray-500 mt-[0.5rem]">Pilih petugas yang bertanggung jawab atas pemeriksaan ini.</p>
            </FormGroup>
          </div>
        </Card>
      </div>

      </fieldset>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-[4rem] pt-[2rem] border-t">
        <Button variant="ghost" size="lg" onClick={onBack} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-[1.125rem] w-[1.125rem] mr-[0.5rem]" />
          Batal & Kembali
        </Button>
        {!internalReadOnly && (
          <div className="flex gap-[1rem]">
            <Button variant="primary" size="lg" className="min-w-[15rem] h-[3.5rem] text-[1rem] font-bold gap-[0.75rem] shadow-lg shadow-purple-200" onClick={handleSave}>
              <Save className="h-[1.5rem] w-[1.5rem]" />
              Simpan Hasil Pemeriksaan
            </Button>
            {status === "Menunggu" ? (
              <Button 
                variant="primary" 
                size="lg" 
                className="min-w-[15rem] h-[3.5rem] text-[1rem] font-bold gap-[0.75rem] bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" 
                onClick={handleStartExam}
              >
                <Play className="h-[1.5rem] w-[1.5rem]" />
                Mulai Periksa
              </Button>
            ) : (
              status === "Diperiksa" && (
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="min-w-[15rem] h-[3.5rem] text-[1rem] font-bold gap-[0.75rem] bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200" 
                  onClick={handleFinish}
                >
                  <CheckCircle className="h-[1.5rem] w-[1.5rem]" />
                  Selesai Periksa
                </Button>
              )
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <PopUpModal
        isOpen={isObatModalOpen}
        onClose={() => setIsObatModalOpen(false)}
        title={editingObatIndex !== null ? "Edit Obat" : "Tambah Obat"}
        footer={
          <div className="flex justify-end gap-[1rem]">
            <Button variant="ghost" onClick={() => setIsObatModalOpen(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSaveObat}>Simpan Obat</Button>
          </div>
        }
      >
        <div className="space-y-[1.25rem]">
          <FormGroup id="modal-obat-nama" label="Cari Obat">
            <ComboBox 
              allowCustom
              options={listObat.map(o => `${o.namaObat} (${o.bentukSediaan} - ${o.dosisSediaan})`)}
              value={currentObat.namaObat}
              placeholder="Cari obat dari stok..."
              onChange={(val) => {
                const selected = listObat.find(o => `${o.namaObat} (${o.bentukSediaan} - ${o.dosisSediaan})` === val);
                setCurrentObat(prev => ({
                  ...prev,
                  sku: selected?.sku || `M-OBAT-${Date.now()}`,
                  namaObat: val,
                  harga: selected?.hargaJual || prev.harga || 0
                }));
              }}
            />
          </FormGroup>
          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="modal-obat-harga" label="Harga Satuan (Rp)">
              <PriceInput 
                disabled={!currentObat.sku.startsWith("M-OBAT-")}
                value={currentObat.harga || 0}
                onChange={(e) => setCurrentObat(prev => ({ ...prev, harga: parseInt(e.target.value) || 0 }))}
              />
            </FormGroup>
            <FormGroup id="modal-obat-total" label="Total (Rp)">
              <Input 
                disabled 
                value={((currentObat.harga || 0) * (currentObat.jumlah || 1)).toLocaleString("id-ID")}
              />
            </FormGroup>
          </div>
          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="modal-obat-dosis" label="Dosis">
              <Input 
                placeholder="Mis: 500mg" 
                value={currentObat.dosis}
                onChange={(e) => setCurrentObat(prev => ({ ...prev, dosis: e.target.value }))}
              />
            </FormGroup>
            <FormGroup id="modal-obat-jumlah" label="Jumlah">
              <Input 
                type="number" 
                value={currentObat.jumlah}
                onChange={(e) => setCurrentObat(prev => ({ ...prev, jumlah: parseInt(e.target.value) || 1 }))}
              />
            </FormGroup>
          </div>
          <FormGroup id="modal-obat-aturan" label="Aturan Pakai">
            <Input 
              placeholder="Mis: 3 x 1 Sesudah Makan" 
              value={currentObat.aturanPakai}
              onChange={(e) => setCurrentObat(prev => ({ ...prev, aturanPakai: e.target.value }))}
            />
          </FormGroup>
        </div>
      </PopUpModal>

      <PopUpModal
        isOpen={isBhpModalOpen}
        onClose={() => setIsBhpModalOpen(false)}
        title={editingBhpIndex !== null ? "Edit BHP" : "Tambah BHP"}
        footer={
          <div className="flex justify-end gap-[1rem]">
            <Button variant="ghost" onClick={() => setIsBhpModalOpen(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSaveBhp}>Simpan BHP</Button>
          </div>
        }
      >
        <div className="space-y-[1.25rem]">
          <FormGroup id="modal-bhp-nama" label="Cari BHP">
            <ComboBox 
              allowCustom
              options={listBhp.map(b => b.namaBhp)}
              value={currentBhp.namaBhp}
              placeholder="Cari BHP dari stok..."
              onChange={(val) => {
                const selected = listBhp.find(b => b.namaBhp === val);
                setCurrentBhp(prev => ({
                  ...prev,
                  sku: selected?.sku || `M-BHP-${Date.now()}`,
                  namaBhp: val,
                  satuan: selected?.satuan || prev.satuan || "pcs",
                  harga: selected?.hargaJual || prev.harga || 0
                }));
              }}
            />
          </FormGroup>
          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="modal-bhp-harga" label="Harga Satuan (Rp)">
              <PriceInput 
                disabled={!currentBhp.sku.startsWith("M-BHP-")}
                value={currentBhp.harga || 0}
                onChange={(e) => setCurrentBhp(prev => ({ ...prev, harga: parseInt(e.target.value) || 0 }))}
              />
            </FormGroup>
            <FormGroup id="modal-bhp-total" label="Total (Rp)">
              <Input 
                disabled 
                value={((currentBhp.harga || 0) * (currentBhp.jumlah || 1)).toLocaleString("id-ID")}
              />
            </FormGroup>
          </div>
          <div className="grid grid-cols-2 gap-[1rem]">
            <FormGroup id="modal-bhp-jumlah" label="Jumlah">
              <Input 
                type="number" 
                value={currentBhp.jumlah}
                onChange={(e) => setCurrentBhp(prev => ({ ...prev, jumlah: parseInt(e.target.value) || 1 }))}
              />
            </FormGroup>
            <FormGroup id="modal-bhp-satuan" label="Satuan">
              <Input 
                disabled={!currentBhp.sku.startsWith("M-BHP-")}
                value={currentBhp.satuan}
                onChange={(e) => setCurrentBhp(prev => ({ ...prev, satuan: e.target.value }))}
              />
            </FormGroup>
          </div>
        </div>
      </PopUpModal>

      <PopUpModal
        isOpen={isLayananModalOpen}
        onClose={() => setIsLayananModalOpen(false)}
        title={editingLayananIndex !== null ? "Edit Layanan" : "Tambah Layanan"}
        footer={
          <div className="flex justify-end gap-[1rem]">
            <Button variant="ghost" onClick={() => setIsLayananModalOpen(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSaveLayanan}>Simpan Layanan</Button>
          </div>
        }
      >
        <div className="space-y-[1.25rem]">
          <FormGroup id="modal-layanan-nama" label="Cari Layanan">
            <ComboBox 
              allowCustom
              options={listLayananLain.map(l => l.nama)}
              value={currentLayanan.nama}
              placeholder="Cari layanan..."
              onChange={(val) => {
                const selected = listLayananLain.find(l => l.nama === val);
                setCurrentLayanan(prev => ({
                  ...prev,
                  id: selected?.id || `M-SERV-${Date.now()}`,
                  nama: val,
                  biaya: selected?.harga || prev.biaya || 0
                }));
              }}
            />
          </FormGroup>
          <FormGroup id="modal-layanan-biaya" label="Biaya">
            <PriceInput 
              disabled={!currentLayanan.id.startsWith("M-SERV-")}
              value={currentLayanan.biaya}
              onChange={(e) => setCurrentLayanan(prev => ({ ...prev, biaya: parseInt(e.target.value) || 0 }))}
            />
          </FormGroup>
        </div>
      </PopUpModal>
    </div>
  );
}
