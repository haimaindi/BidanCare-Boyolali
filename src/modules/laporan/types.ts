export interface DateRangeFilter {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface FinancialTrendPoint {
  tanggal: string; // YYYY-MM-DD or DD/MM
  totalPendapatan: number;
  pendapatanLayanan: number;
  pendapatanObat: number;
  pendapatanBhp: number;
  pendapatanLayananLain: number;
}

export interface PiutangCicilanPoint {
  tanggal: string;
  totalPiutang: number;
  cicilanDibayar: number;
}

export interface PaymentTypeSummary {
  name: string;
  value: number;
  color: string;
}

export interface PaymentStatusSummary {
  name: string;
  value: number;
  color: string;
}

export interface PatientVisitTrendPoint {
  tanggal: string;
  totalKunjungan: number;
  poliUmum: number;
  kia: number;
  kb: number;
  imunisasi: number;
  layananLain: number;
}

export interface NewPatientTrendPoint {
  minggu: string; // e.g. "Minggu 1", "Minggu 2"
  pasienBaru: number;
  pasienLama: number;
}

export interface RegionBreakdownItem {
  name: string;
  jumlahPasien: number;
}

export interface GenderBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface SalutationBreakdownItem {
  panggilan: string;
  jumlah: number;
}

export interface LaporanVisitRecord {
  id: string;
  patientId: string;
  noRm: string;
  panggilan: string;
  namaPasien: string;
  nik: string;
  jenisKelamin: "L" | "P";
  tanggalLahir: string;
  waktuKunjungan: string;
  layanan: string;
  diagnosa: string;
  keluhan: string;
  petugas: string;
  status: "Selesai" | "Dalam Antrean" | "Batal";
}
