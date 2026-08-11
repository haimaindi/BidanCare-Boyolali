-- Table Schema: Loket Obat (Prescription Dispensing)
-- Path: /database/loket_obat.sql

CREATE TABLE IF NOT EXISTS loket_obat (
  id VARCHAR(255) PRIMARY KEY,
  no_rm VARCHAR(255) NOT NULL,
  nama_pasien VARCHAR(255) NOT NULL,
  jenis_kelamin VARCHAR(10) NOT NULL,
  tanggal_lahir DATE,
  usia VARCHAR(100),
  waktu_pesan TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sumber VARCHAR(50) NOT NULL, -- 'Pemeriksaan' or 'Beli Langsung'
  status VARCHAR(50) NOT NULL DEFAULT 'Menunggu', -- 'Menunggu', 'Disiapkan', 'Selesai'
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of PrescriptionItem: sku, namaObat, dosis, aturanPakai, jumlah, catatan
  pemeriksaan_id VARCHAR(255) REFERENCES pemeriksaan_pasien(id) ON DELETE SET NULL,
  pendaftaran_id VARCHAR(255) REFERENCES pendaftaran_pasien(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_loket_obat_pemeriksaan_id ON loket_obat(pemeriksaan_id);
CREATE INDEX IF NOT EXISTS idx_loket_obat_pendaftaran_id ON loket_obat(pendaftaran_id);
