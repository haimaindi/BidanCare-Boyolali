import { PemeriksaanData } from "../pemeriksaan/types";

export type PrescriptionStatus = "Menunggu" | "Disiapkan" | "Selesai";

export interface LoketObatEntry {
  id: string;
  noRm: string;
  namaPasien: string;
  jenisKelamin: "L" | "P";
  tanggalLahir: string;
  usia: string;
  waktuPesan: string;
  sumber: "Pemeriksaan" | "Beli Langsung";
  status: PrescriptionStatus;
  items: PrescriptionItem[];
  pemeriksaanId?: string; // Link back to Pemeriksaan if source is Pemeriksaan
}

export interface PrescriptionItem {
  sku: string;
  namaObat: string;
  dosis: string;
  aturanPakai: string;
  jumlah: number;
  catatan?: string;
}
