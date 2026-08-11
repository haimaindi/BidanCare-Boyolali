import { LoketObatEntry } from "../types";

export const DUMMY_LOKET_OBAT: LoketObatEntry[] = [
  {
    id: "LO-001",
    noRm: "RM-001",
    namaPasien: "Siti Rahmawati",
    jenisKelamin: "P",
    tanggalLahir: "1992-05-15",
    usia: "32 Thn 2 Bln",
    waktuPesan: "2026-08-09T09:30:00",
    sumber: "Pemeriksaan",
    status: "Menunggu",
    pemeriksaanId: "PEM-001",
    items: [
      {
        sku: "OBT-001",
        namaObat: "Paracetamol 500mg",
        dosis: "500mg",
        aturanPakai: "3 x 1 Sesudah Makan",
        jumlah: 10
      },
      {
        sku: "OBT-002",
        namaObat: "Amoxicillin 500mg",
        dosis: "500mg",
        aturanPakai: "3 x 1 Habiskan",
        jumlah: 15
      }
    ]
  },
  {
    id: "LO-002",
    noRm: "RM-004",
    namaPasien: "Ahmad Jaelani",
    jenisKelamin: "L",
    tanggalLahir: "1978-07-25",
    usia: "46 Thn 0 Bln",
    waktuPesan: "2026-08-09T09:45:00",
    sumber: "Beli Langsung",
    status: "Disiapkan",
    items: [
      {
        sku: "OBT-003",
        namaObat: "Vitamin C 500mg",
        dosis: "500mg",
        aturanPakai: "1 x 1",
        jumlah: 30
      }
    ]
  },
  {
    id: "LO-003",
    noRm: "RM-002",
    namaPasien: "Budi Santoso",
    jenisKelamin: "L",
    tanggalLahir: "1985-11-20",
    usia: "38 Thn 8 Bln",
    waktuPesan: "2026-08-09T08:45:00",
    sumber: "Pemeriksaan",
    status: "Selesai",
    pemeriksaanId: "PEM-002",
    items: [
      {
        sku: "OBT-004",
        namaObat: "Ibuprofen 400mg",
        dosis: "400mg",
        aturanPakai: "2 x 1 Bila Nyeri",
        jumlah: 10
      }
    ]
  }
];
