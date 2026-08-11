import { 
  FinancialTrendPoint, 
  PiutangCicilanPoint, 
  PaymentTypeSummary, 
  PaymentStatusSummary, 
  PatientVisitTrendPoint, 
  NewPatientTrendPoint, 
  RegionBreakdownItem, 
  GenderBreakdownItem, 
  SalutationBreakdownItem, 
  LaporanVisitRecord 
} from "../types";
import { Billing } from "../../kasir/types";
import { DUMMY_STOK_BERJALAN } from "../../obat/data/dummy";
import { DUMMY_STOK_BERJALAN_BHP } from "../../bhp/data/dummy";

// 1. Financial Trend Data (30 Days)
export const DUMMY_FINANCIAL_TREND: FinancialTrendPoint[] = [
  { tanggal: "2026-08-01", totalPendapatan: 1250000, pendapatanLayanan: 400000, pendapatanObat: 550000, pendapatanBhp: 150000, pendapatanLayananLain: 150000 },
  { tanggal: "2026-08-02", totalPendapatan: 1800000, pendapatanLayanan: 600000, pendapatanObat: 800000, pendapatanBhp: 200000, pendapatanLayananLain: 200000 },
  { tanggal: "2026-08-03", totalPendapatan: 1450000, pendapatanLayanan: 450000, pendapatanObat: 650000, pendapatanBhp: 180000, pendapatanLayananLain: 170000 },
  { tanggal: "2026-08-04", totalPendapatan: 2100000, pendapatanLayanan: 750000, pendapatanObat: 950000, pendapatanBhp: 220000, pendapatanLayananLain: 180000 },
  { tanggal: "2026-08-05", totalPendapatan: 1950000, pendapatanLayanan: 650000, pendapatanObat: 880000, pendapatanBhp: 210000, pendapatanLayananLain: 210000 },
  { tanggal: "2026-08-06", totalPendapatan: 2400000, pendapatanLayanan: 800000, pendapatanObat: 1100000, pendapatanBhp: 250000, pendapatanLayananLain: 250000 },
  { tanggal: "2026-08-07", totalPendapatan: 1600000, pendapatanLayanan: 500000, pendapatanObat: 750000, pendapatanBhp: 190000, pendapatanLayananLain: 160000 },
  { tanggal: "2026-08-08", totalPendapatan: 2250000, pendapatanLayanan: 700000, pendapatanObat: 1050000, pendapatanBhp: 240000, pendapatanLayananLain: 260000 },
  { tanggal: "2026-08-09", totalPendapatan: 2800000, pendapatanLayanan: 950000, pendapatanObat: 1250000, pendapatanBhp: 300000, pendapatanLayananLain: 300000 },
  { tanggal: "2026-08-10", totalPendapatan: 2150000, pendapatanLayanan: 720000, pendapatanObat: 980000, pendapatanBhp: 230000, pendapatanLayananLain: 220000 },
];

// 2. Piutang & Installments Trend
export const DUMMY_PIUTANG_TREND: PiutangCicilanPoint[] = [
  { tanggal: "2026-08-01", totalPiutang: 850000, cicilanDibayar: 250000 },
  { tanggal: "2026-08-02", totalPiutang: 1100000, cicilanDibayar: 400000 },
  { tanggal: "2026-08-03", totalPiutang: 950000, cicilanDibayar: 350000 },
  { tanggal: "2026-08-04", totalPiutang: 1400000, cicilanDibayar: 600000 },
  { tanggal: "2026-08-05", totalPiutang: 1200000, cicilanDibayar: 500000 },
  { tanggal: "2026-08-06", totalPiutang: 1650000, cicilanDibayar: 750000 },
  { tanggal: "2026-08-07", totalPiutang: 1300000, cicilanDibayar: 450000 },
  { tanggal: "2026-08-08", totalPiutang: 1750000, cicilanDibayar: 800000 },
  { tanggal: "2026-08-09", totalPiutang: 1500000, cicilanDibayar: 900000 },
  { tanggal: "2026-08-10", totalPiutang: 1250000, cicilanDibayar: 650000 },
];

// 3. Payment Method Distribution
export const DUMMY_PAYMENT_TYPES: PaymentTypeSummary[] = [
  { name: "Tunai (Cash)", value: 12500000, color: "#7e22ce" }, // purple-700
  { name: "Transfer Bank", value: 5400000, color: "#3b82f6" },  // blue-500
  { name: "QRIS", value: 3800000, color: "#10b981" },           // emerald-500
  { name: "E-Wallet", value: 1800000, color: "#f59e0b" },       // amber-500
];

// 4. Payment Status Breakdown
export const DUMMY_PAYMENT_STATUS: PaymentStatusSummary[] = [
  { name: "Langsung Lunas", value: 82, color: "#10b981" },   // emerald-500
  { name: "Tidak Lunas (Piutang)", value: 18, color: "#f43f5e" }, // rose-500
];

// 5. Billing Records Table
export const DUMMY_BILLING_RECORDS: (Billing & { paymentType: string; paidAmount: number; paymentDate: string })[] = [
  {
    id: "BILL-202608-001",
    visitId: "VST-001",
    patientName: "Budi Santoso",
    serviceType: "Poli Umum",
    baseServiceFee: 50000,
    medicinePrice: 125000,
    bhpPrice: 15000,
    otherServicePrice: 0,
    totalBill: 190000,
    paidAmount: 100000,
    paymentType: "Tunai",
    status: "Belum Lunas",
    createdAt: "2026-08-10T08:30:00Z",
    paymentDate: "2026-08-10",
  },
  {
    id: "BILL-202608-002",
    visitId: "VST-002",
    patientName: "Siti Aminah",
    serviceType: "KIA - AnteNatal",
    baseServiceFee: 60000,
    medicinePrice: 75000,
    bhpPrice: 20000,
    otherServicePrice: 30000,
    totalBill: 185000,
    paidAmount: 185000,
    paymentType: "QRIS",
    status: "Lunas",
    createdAt: "2026-08-10T09:15:00Z",
    paymentDate: "2026-08-10",
  },
  {
    id: "BILL-202608-003",
    visitId: "VST-003",
    patientName: "Rina Wati",
    serviceType: "Pelayanan KB",
    baseServiceFee: 45000,
    medicinePrice: 60000,
    bhpPrice: 25000,
    otherServicePrice: 0,
    totalBill: 130000,
    paidAmount: 130000,
    paymentType: "Transfer",
    status: "Lunas",
    createdAt: "2026-08-09T10:00:00Z",
    paymentDate: "2026-08-09",
  },
  {
    id: "BILL-202608-004",
    visitId: "VST-004",
    patientName: "An. Budi Susanto",
    serviceType: "Imunisasi",
    baseServiceFee: 40000,
    medicinePrice: 85000,
    bhpPrice: 15000,
    otherServicePrice: 0,
    totalBill: 140000,
    paidAmount: 140000,
    paymentType: "Tunai",
    status: "Lunas",
    createdAt: "2026-08-08T11:20:00Z",
    paymentDate: "2026-08-08",
  },
  {
    id: "BILL-202608-005",
    visitId: "VST-005",
    patientName: "Dewi Lestari",
    serviceType: "Poli Umum",
    baseServiceFee: 50000,
    medicinePrice: 150000,
    bhpPrice: 30000,
    otherServicePrice: 20000,
    totalBill: 250000,
    paidAmount: 100000,
    paymentType: "Tunai",
    status: "Belum Lunas",
    createdAt: "2026-08-07T14:10:00Z",
    paymentDate: "2026-08-07",
  },
  {
    id: "BILL-202608-006",
    visitId: "VST-006",
    patientName: "Hendra Gunawan",
    serviceType: "Layanan Lain - Lab",
    baseServiceFee: 75000,
    medicinePrice: 90000,
    bhpPrice: 35000,
    otherServicePrice: 50000,
    totalBill: 250000,
    paidAmount: 250000,
    paymentType: "QRIS",
    status: "Lunas",
    createdAt: "2026-08-06T15:45:00Z",
    paymentDate: "2026-08-06",
  },
];

// 6. Patient Visit Trend Data (Total & By Service)
export const DUMMY_PATIENT_VISIT_TREND: PatientVisitTrendPoint[] = [
  { tanggal: "2026-08-01", totalKunjungan: 18, poliUmum: 8, kia: 4, kb: 3, imunisasi: 2, layananLain: 1 },
  { tanggal: "2026-08-02", totalKunjungan: 24, poliUmum: 11, kia: 6, kb: 4, imunisasi: 2, layananLain: 1 },
  { tanggal: "2026-08-03", totalKunjungan: 21, poliUmum: 9, kia: 5, kb: 4, imunisasi: 2, layananLain: 1 },
  { tanggal: "2026-08-04", totalKunjungan: 29, poliUmum: 14, kia: 7, kb: 4, imunisasi: 3, layananLain: 1 },
  { tanggal: "2026-08-05", totalKunjungan: 26, poliUmum: 12, kia: 6, kb: 5, imunisasi: 2, layananLain: 1 },
  { tanggal: "2026-08-06", totalKunjungan: 32, poliUmum: 15, kia: 8, kb: 5, imunisasi: 3, layananLain: 1 },
  { tanggal: "2026-08-07", totalKunjungan: 22, poliUmum: 10, kia: 5, kb: 4, imunisasi: 2, layananLain: 1 },
  { tanggal: "2026-08-08", totalKunjungan: 30, poliUmum: 13, kia: 8, kb: 5, imunisasi: 3, layananLain: 1 },
  { tanggal: "2026-08-09", totalKunjungan: 36, poliUmum: 17, kia: 9, kb: 5, imunisasi: 4, layananLain: 1 },
  { tanggal: "2026-08-10", totalKunjungan: 28, poliUmum: 12, kia: 7, kb: 5, imunisasi: 3, layananLain: 1 },
];

// 7. Weekly New Patient Fluctuation
export const DUMMY_NEW_PATIENT_TREND: NewPatientTrendPoint[] = [
  { minggu: "Minggu 1 (Jul)", pasienBaru: 14, pasienLama: 42 },
  { minggu: "Minggu 2 (Jul)", pasienBaru: 22, pasienLama: 58 },
  { minggu: "Minggu 3 (Jul)", pasienBaru: 18, pasienLama: 61 },
  { minggu: "Minggu 4 (Jul)", pasienBaru: 27, pasienLama: 74 },
  { minggu: "Minggu 1 (Aug)", pasienBaru: 31, pasienLama: 82 },
  { minggu: "Minggu 2 (Aug)", pasienBaru: 25, pasienLama: 78 },
];

// 8. Regional Breakdown Data (Puskesmas, Provinsi, Kab/Kota, Kecamatan, Kelurahan)
export const DUMMY_REGION_DATA: Record<string, RegionBreakdownItem[]> = {
  puskesmas: [
    { name: "Puskesmas Tebet", jumlahPasien: 142 },
    { name: "Puskesmas Gubeng", jumlahPasien: 98 },
    { name: "Puskesmas Bandung", jumlahPasien: 85 },
    { name: "Puskesmas Kebayoran", jumlahPasien: 64 },
    { name: "Puskesmas Cicendo", jumlahPasien: 52 },
  ],
  provinsi: [
    { name: "DKI Jakarta", jumlahPasien: 210 },
    { name: "Jawa Barat", jumlahPasien: 137 },
    { name: "Jawa Timur", jumlahPasien: 98 },
    { name: "Banten", jumlahPasien: 45 },
    { name: "Jawa Tengah", jumlahPasien: 28 },
  ],
  kabupaten: [
    { name: "Jakarta Selatan", jumlahPasien: 165 },
    { name: "Surabaya", jumlahPasien: 98 },
    { name: "Bandung", jumlahPasien: 85 },
    { name: "Jakarta Timur", jumlahPasien: 45 },
    { name: "Depok", jumlahPasien: 32 },
  ],
  kecamatan: [
    { name: "Tebet", jumlahPasien: 112 },
    { name: "Gubeng", jumlahPasien: 98 },
    { name: "Cicendo", jumlahPasien: 85 },
    { name: "Kebayoran Baru", jumlahPasien: 53 },
    { name: "Pancoran", jumlahPasien: 38 },
  ],
  kelurahan: [
    { name: "Kebon Baru", jumlahPasien: 78 },
    { name: "Pasirkaliki", jumlahPasien: 65 },
    { name: "Mojo", jumlahPasien: 54 },
    { name: "Tebet Timur", jumlahPasien: 34 },
    { name: "Gundih", jumlahPasien: 29 },
  ]
};

// 9. Gender Breakdown
export const DUMMY_GENDER_DATA: GenderBreakdownItem[] = [
  { name: "Perempuan (P)", value: 312, color: "#ec4899" }, // pink-500
  { name: "Laki-laki (L)", value: 186, color: "#3b82f6" },  // blue-500
];

// 10. Salutation (Jenis Panggilan) Breakdown
export const DUMMY_SALUTATION_DATA: SalutationBreakdownItem[] = [
  { panggilan: "Ny.", jumlah: 245 },
  { panggilan: "Ny. Hamil", jumlah: 88 },
  { panggilan: "Tn.", jumlah: 92 },
  { panggilan: "An.", jumlah: 54 },
  { panggilan: "Sdr.", jumlah: 19 },
];

// 11. Patient Visit Logs List for Domain Pasien (Clickable to jump to Examination / Pemeriksaan)
export const DUMMY_LAPORAN_VISITS: LaporanVisitRecord[] = [
  {
    id: "VST-202608-001",
    patientId: "p1",
    noRm: "RM-202408-001",
    panggilan: "Ny.",
    namaPasien: "Rina Wati",
    nik: "1234567890123456",
    jenisKelamin: "P",
    tanggalLahir: "1990-05-12",
    waktuKunjungan: "2026-08-10 08:30",
    layanan: "Poli Umum",
    diagnosa: "Common Cold",
    keluhan: "Demam dan pusing 2 hari",
    petugas: "dr. Andi",
    status: "Selesai",
  },
  {
    id: "VST-202608-002",
    patientId: "p3",
    noRm: "RM-202408-003",
    panggilan: "Ny.",
    namaPasien: "Siti Halimah",
    nik: "1122334455667788",
    jenisKelamin: "P",
    tanggalLahir: "1995-10-20",
    waktuKunjungan: "2026-08-10 09:15",
    layanan: "KIA - AnteNatal",
    diagnosa: "G2P1A0 UK 28 Minggu",
    keluhan: "Kontrol rutin kehamilan",
    petugas: "Bdn. Siti",
    status: "Selesai",
  },
  {
    id: "VST-202608-003",
    patientId: "p2",
    noRm: "RM-202408-002",
    panggilan: "An.",
    namaPasien: "Budi Susanto",
    nik: "6543210987654321",
    jenisKelamin: "L",
    tanggalLahir: "2023-01-15",
    waktuKunjungan: "2026-08-09 10:00",
    layanan: "Imunisasi",
    diagnosa: "Jadwal Imunisasi DPT-HB-Hib 3",
    keluhan: "Imunisasi rutin",
    petugas: "Bdn. Siti",
    status: "Selesai",
  },
  {
    id: "VST-202608-004",
    patientId: "p1",
    noRm: "RM-202408-001",
    panggilan: "Ny.",
    namaPasien: "Rina Wati",
    nik: "1234567890123456",
    jenisKelamin: "P",
    tanggalLahir: "1990-05-12",
    waktuKunjungan: "2026-08-08 11:30",
    layanan: "Pelayanan KB",
    diagnosa: "Akseptor KB Suntik 3 Bulan",
    keluhan: "Suntik KB ulang",
    petugas: "Bdn. Siti",
    status: "Selesai",
  },
  {
    id: "VST-202608-005",
    patientId: "p4",
    noRm: "RM-202408-004",
    panggilan: "Tn.",
    namaPasien: "Hendra Gunawan",
    nik: "3271234567890001",
    jenisKelamin: "L",
    tanggalLahir: "1988-11-05",
    waktuKunjungan: "2026-08-07 14:00",
    layanan: "Layanan Lain",
    diagnosa: "Cek Darah Lengkap",
    keluhan: "Pemeriksaan Lab Rutin",
    petugas: "Petugas Lab",
    status: "Selesai",
  },
];

// Mirroring Stok Obat and Stok BHP
export const DUMMY_STOK_OBAT_MIRROR = DUMMY_STOK_BERJALAN;
export const DUMMY_STOK_BHP_MIRROR = DUMMY_STOK_BERJALAN_BHP;
