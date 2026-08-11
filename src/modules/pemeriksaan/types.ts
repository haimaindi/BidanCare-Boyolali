import { ReactNode } from "react";

export interface AntreanPemeriksaan {
  id: string;
  noAntrean: string;
  noRm: string;
  nama: string;
  panggilan: string;
  jenisKelamin: "L" | "P";
  tanggalLahir: string;
  usia: string;
  waktuRegistrasi: string;
  sumberPendaftaran: "Online" | "Offline";
  jenisLayanan: string;
  status: "Menunggu" | "Diperiksa" | "Selesai";
}

export interface PemeriksaanData {
  id: string;
  patientId: string;
  // a. Subjektif Dasar
  subjektif: {
    keluhan: string;
    riwAlergi: string;
    riwPenyakit: string;
    riwKeluarga: string;
  };
  // b. Objektif Primary Survey
  objektifPrimary: {
    beratBadan: string; // kg
    tinggiBadan: string; // cm
    tekananDarah: string;
    heartRate: string;
    suhu: string;
    respirationRate: string;
    spo2: string;
  };
  // c. Objektif Pemeriksaan Fisik Dasar
  objektifFisik: {
    pxKepalaLeher: string;
    pxDada: string;
    pxAbdomen: string;
    pxEkstremitasAtas: string;
    pxEkstremitasBawah: string;
    pxGenitalUrinaria: string;
    pxFisikLain: string;
  };
  // d. Objektif Penunjang (multiple input)
  penunjang: {
    id: string;
    jenis: string;
    hasil: string;
    catatan: string;
  }[];
  // e. Diagnosa (Assessment)
  diagnosa: {
    utama: string;
    sekunder: string;
  };
  // f. Plan
  plan: {
    terapiFarmakologi: {
      sku: string;
      namaObat: string;
      dosis: string;
      aturanPakai: string;
      jumlah: number;
      harga?: number;
    }[];
    layananLain: {
      id: string;
      nama: string;
      biaya: number;
    }[];
  };
  // g. Data BHP
  bhp: {
    sku: string;
    namaBhp: string;
    jumlah: number;
    satuan: string;
    harga?: number;
  }[];
  // h. Data KB (Optional)
  kb?: {
    jumlahAnak: number;
    umurAnakTerkecil: string;
    pus4T: {
      terlaluMuda: boolean;
      terlaluTua: boolean;
      terlaluDekat: boolean;
      terlaluBanyak: boolean;
    };
    jenisKontrasepsiId: string;
    kunjunganUlangTier: number;
    kunjunganUlangDate: string;
  };
  // i. Data Imunisasi (Optional)
  imunisasi?: {
    diberikan: {
      vaksin: string;
      noBatch: string;
    }[];
    berikutnya: string[];
    tglKembali: string;
  };
  // k. Data Antenatal (ANC)
  anc?: {
    periksaKe: number;
    hpht: string;
    gestasi: number;
    partus: number;
    abortus: number;
    usiaKehamilan: string; // Calculated
    tglKembaliAnc: string;
    tfu: string;
    letakJanin: string;
    djj: string;
    pxLab: string;
    risikoTinggi: string[];
  };
  // l. Data Persalinan (Optional)
  persalinan?: {
    periksaKe: number;
    hpht: string;
    gestasi: number;
    partus: number;
    abortus: number;
    usiaKehamilan: string;
    tfu: string;
    letakJanin: string;
    djj: string;
    pxLab: string;
    risikoTinggi: string[];
    tindakLanjut: "Persalinan" | "Rujuk";
    // Jika Persalinan
    dataLahir?: {
      waktuLahir: string;
      tindakan: string;
      bbl: string;
      jkBayi: "L" | "P";
      bbBayi: number;
      pbBayi: number;
      lkBayi: number;
      ldBayi: number;
      apgarScore: string;
      keadaanIbu: string;
      keadaanAnak: string;
    };
    // Jika Rujuk
    dataRujuk?: {
      waktuRujuk: string;
      tujuan: string;
      alasan: string;
    };
  };
  // o. Data PNC (Post Natal Care)
  pnc?: {
    jenisKunjungan: "KF" | "KN" | "Akhir Nifas";
    // KF Data
    kf?: {
      riwayatKehamilan: string;
      caraPersalinan: string;
      komplikasiPersalinan: string;
      tandaVital: {
        td: string;
        nadi: string;
        nafas: string;
        suhu: string;
      };
      kontraksiTfu: string;
      perdarahan: string;
      lochea: string;
      babBak: string;
      terapi: string;
      nasihat: string;
      kbPascasalin: string;
      pxDarah: string;
      tglKembali: string;
    };
    // KN Data
    kn?: {
      tglLahir: string;
      bbPbPenolong: string;
      vitK: boolean;
      imd: boolean;
      salepMata: boolean;
      hb0: boolean;
      pxKejang: string;
      pxNafas: string;
      pxHipotermi: string;
      pxBakteri: string;
      pxIkterus: string;
      pxSalCerna: string;
      pxDiare: string;
      pxAsiBb: string;
      pxTaliPusat: string;
      sosialisasiHbBcg: string;
      tglKembali: string;
    };
    // Akhir Nifas Data
    akhirNifas?: {
      keadaanIbu: string;
      keadaanBayi: string;
      tglKembali: string;
    };
  };
  // p. Data Mom & Baby Care
  momCare?: {
    jenisLayanan: string;
    catatanKhusus: string;
  };
  // q. Catatan Pemeriksaan
  catatan: string;
  // r. Petugas
  petugas: string;
  timestamp: string;
}
