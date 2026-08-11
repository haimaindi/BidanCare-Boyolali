export interface JurnalBhp {
  id: string;
  tanggal: string;
  jenis: "Masuk" | "Keluar" | "Terjual" | "Perbaikan Stok";
  perubahanQty: number;
  sisaQty: number;
  keterangan: string;
}

export interface StokBerjalanBhp {
  sku: string;
  kategori: string;
  namaBhp: string;
  satuan: string;
  sisaQty: number;
  hargaBeliTerakhir: number;
  hargaJual: number;
  margin: number;
  jurnal: JurnalBhp[];
}

export interface BhpMasuk {
  id: string;
  sku: string;
  kategori: string;
  namaBhp: string;
  satuan: string;
  qtyMasuk: number;
  hargaBeli: number;
  tanggal: string;
}

export interface BhpKeluar {
  id: string;
  sku: string;
  kategori: string;
  namaBhp: string;
  satuan: string;
  qtyKeluar: number;
  keterangan: string;
  tanggal: string;
}

export const DUMMY_STOK_BERJALAN_BHP: StokBerjalanBhp[] = [
  {
    sku: "BHP-001",
    kategori: "Alat Medis",
    namaBhp: "Spuit 3cc",
    satuan: "Pcs",
    sisaQty: 100,
    hargaBeliTerakhir: 1500,
    hargaJual: 2500,
    margin: 1000,
    jurnal: [
      { id: "J1", tanggal: "2024-03-20T10:00:00Z", jenis: "Masuk", perubahanQty: 100, sisaQty: 100, keterangan: "Stok Awal" }
    ]
  },
  {
    sku: "BHP-002",
    kategori: "Laboratorium",
    namaBhp: "Alkohol Swab",
    satuan: "Box",
    sisaQty: 50,
    hargaBeliTerakhir: 25000,
    hargaJual: 35000,
    margin: 10000,
    jurnal: [
      { id: "J2", tanggal: "2024-03-20T11:00:00Z", jenis: "Masuk", perubahanQty: 50, sisaQty: 50, keterangan: "Stok Awal" }
    ]
  }
];

export const DUMMY_BHP_MASUK: BhpMasuk[] = [
  {
    id: "BM-1",
    sku: "BHP-001",
    kategori: "Alat Medis",
    namaBhp: "Spuit 3cc",
    satuan: "Pcs",
    qtyMasuk: 100,
    hargaBeli: 1500,
    tanggal: "2024-03-20T10:00:00Z"
  }
];

export const DUMMY_BHP_KELUAR: BhpKeluar[] = [];
