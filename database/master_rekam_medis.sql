-- Table Schema: Master Rekam Medis (Patient Database) & Riwayat Kunjungan
-- Path: /database/master_rekam_medis.sql

CREATE TABLE IF NOT EXISTS master_rekam_medis (
  id VARCHAR(255) PRIMARY KEY,
  no_rm VARCHAR(100) UNIQUE NOT NULL,
  nik VARCHAR(20) UNIQUE NOT NULL,
  kk VARCHAR(20),
  no_bpjs VARCHAR(50),
  panggilan VARCHAR(20) DEFAULT 'Ny.',
  nama VARCHAR(255) NOT NULL,
  provinsi_lahir VARCHAR(100),
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin VARCHAR(10) NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
  gol_darah VARCHAR(10),
  pekerjaan VARCHAR(100),
  no_whatsapp VARCHAR(50),
  no_hp VARCHAR(50),
  provinsi VARCHAR(100),
  kabupaten VARCHAR(100),
  kecamatan VARCHAR(100),
  kelurahan VARCHAR(100),
  alamat TEXT,
  puskesmas VARCHAR(255),
  nama_suami_isti VARCHAR(255),
  nik_suami VARCHAR(20),
  no_telp_suami VARCHAR(50),
  nama_orang_tua VARCHAR(255),
  nik_orang_tua VARCHAR(20),
  no_telp_orang_tua VARCHAR(50),
  catatan_khusus TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_master_rm_no_rm ON master_rekam_medis(no_rm);
CREATE INDEX IF NOT EXISTS idx_master_rm_nik ON master_rekam_medis(nik);
CREATE INDEX IF NOT EXISTS idx_master_rm_nama ON master_rekam_medis(nama);

-- Table Schema: Riwayat Kunjungan Pasien
CREATE TABLE IF NOT EXISTS riwayat_kunjungan (
  id VARCHAR(255) PRIMARY KEY,
  patient_id VARCHAR(255) REFERENCES master_rekam_medis(id) ON DELETE CASCADE,
  tanggal_kunjungan DATE NOT NULL,
  keluhan TEXT,
  diagnosa TEXT,
  layanan VARCHAR(100),
  petugas VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_riwayat_patient_id ON riwayat_kunjungan(patient_id);
