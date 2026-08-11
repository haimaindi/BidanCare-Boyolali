export interface Obat {
  sku: string;
  namaObat: string;
  namaMerk: string;
  bentukSediaan: string;
  dosisSediaan: string;
}

export interface JurnalStok {
  id: string;
  tanggal: string;
  jenis: "Masuk" | "Keluar" | "Terjual" | "Perbaikan Stok";
  perubahanQty: number;
  sisaQty: number;
  keterangan?: string;
}

export interface StokBerjalan extends Obat {
  sisaQty: number;
  hargaBeliTerakhir: number;  
  hargaJual: number;
  margin: number;
  jurnal: JurnalStok[];
}

export interface ObatMasuk extends Obat {
  id: string;
  qtyMasuk: number;
  hargaBeli: number;
  tanggal: string;
}

export interface ObatKeluar extends Obat {
  id: string;
  qtyKeluar: number;
  keterangan: string;
  tanggal: string;
}

export const DUMMY_STOK_BERJALAN: StokBerjalan[] = [
  {
    sku: "OBT-001",
    namaObat: "Paracetamol",
    namaMerk: "Panadol",
    bentukSediaan: "Tablet",
    dosisSediaan: "500mg",
    sisaQty: 150,
    hargaBeliTerakhir: 8000,
    hargaJual: 12000,
    margin: 4000,
    jurnal: [
      { id: "J001", tanggal: "2024-08-01T10:00:00", jenis: "Masuk", perubahanQty: 200, sisaQty: 200, keterangan: "Pembelian awal" },
      { id: "J002", tanggal: "2024-08-05T14:30:00", jenis: "Terjual", perubahanQty: -50, sisaQty: 150, keterangan: "Resep pasien" }
    ]
  },
  {
    sku: "OBT-002",
    namaObat: "Amoxicillin",
    namaMerk: "Amoxsan",
    bentukSediaan: "Kapsul",
    dosisSediaan: "500mg",
    sisaQty: 75,
    hargaBeliTerakhir: 15000,
    hargaJual: 22500,
    margin: 7500,
    jurnal: [
      { id: "J003", tanggal: "2024-08-02T11:00:00", jenis: "Masuk", perubahanQty: 100, sisaQty: 100, keterangan: "Pembelian rutin" },
      { id: "J004", tanggal: "2024-08-06T09:15:00", jenis: "Terjual", perubahanQty: -20, sisaQty: 80, keterangan: "Resep pasien" },
      { id: "J005", tanggal: "2024-08-08T16:00:00", jenis: "Keluar", perubahanQty: -5, sisaQty: 75, keterangan: "Obat rusak" }
    ]
  }
];

export const DUMMY_OBAT_MASUK: ObatMasuk[] = [
  { id: "OM-001", sku: "OBT-001", namaObat: "Paracetamol", namaMerk: "Panadol", bentukSediaan: "Tablet", dosisSediaan: "500mg", qtyMasuk: 200, hargaBeli: 8000, tanggal: "2024-08-01T10:00:00" },
  { id: "OM-002", sku: "OBT-002", namaObat: "Amoxicillin", namaMerk: "Amoxsan", bentukSediaan: "Kapsul", dosisSediaan: "500mg", qtyMasuk: 100, hargaBeli: 15000, tanggal: "2024-08-02T11:00:00" }
];

export const DUMMY_OBAT_KELUAR: ObatKeluar[] = [
  { id: "OK-001", sku: "OBT-002", namaObat: "Amoxicillin", namaMerk: "Amoxsan", bentukSediaan: "Kapsul", dosisSediaan: "500mg", qtyKeluar: 5, keterangan: "Obat rusak", tanggal: "2024-08-08T16:00:00" }
];
