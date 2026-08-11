-- Table Schema: Pemeriksaan Pasien (Medical Examinations across all services: Umum, KB, Imunisasi, ANC, Persalinan, PNC, Mom & Baby Care)
-- Path: /database/pemeriksaan_pasien.sql

CREATE TABLE IF NOT EXISTS pemeriksaan_pasien (
  id VARCHAR(255) PRIMARY KEY,
  pendaftaran_id VARCHAR(255) NOT NULL REFERENCES pendaftaran_pasien(id) ON DELETE CASCADE,
  subjektif JSONB NOT NULL,
  objektif_primary JSONB NOT NULL,
  objektif_fisik JSONB NOT NULL,
  penunjang JSONB NOT NULL DEFAULT '[]'::jsonb,
  diagnosa JSONB NOT NULL,
  plan JSONB NOT NULL,
  bhp JSONB NOT NULL DEFAULT '[]'::jsonb,
  kb JSONB DEFAULT NULL,
  imunisasi JSONB DEFAULT NULL,
  anc JSONB DEFAULT NULL,
  persalinan JSONB DEFAULT NULL,
  pnc JSONB DEFAULT NULL,
  mom_care JSONB DEFAULT NULL,
  catatan TEXT,
  petugas VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pemeriksaan_pendaftaran_id ON pemeriksaan_pasien(pendaftaran_id);
