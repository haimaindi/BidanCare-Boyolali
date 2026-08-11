-- Table Schema: Pendaftaran Pasien (Offline, Online, Booking Online, Antrean, Check-In, Examination)
-- Path: /database/pendaftaran_pasien.sql

CREATE TABLE IF NOT EXISTS pendaftaran_pasien (
  id VARCHAR(255) PRIMARY KEY,
  no_antrean VARCHAR(50),
  jenis_layanan VARCHAR(100),
  patient_id VARCHAR(255) REFERENCES master_rekam_medis(id) ON DELETE SET NULL,
  no_rm VARCHAR(100),
  nik VARCHAR(20),
  panggilan VARCHAR(20) DEFAULT 'Ny.',
  nama VARCHAR(255),
  jenis_kelamin VARCHAR(10) CHECK (jenis_kelamin IN ('L', 'P')),
  tanggal_lahir DATE,
  usia VARCHAR(50),
  alamat TEXT,
  no_whatsapp VARCHAR(50),
  puskesmas VARCHAR(255),
  penanggung_jawab VARCHAR(100) DEFAULT 'Pribadi / Umum',
  penjamin VARCHAR(100) DEFAULT 'Umum',
  sumber_pendaftaran VARCHAR(20) CHECK (sumber_pendaftaran IN ('Online', 'Offline')),
  status VARCHAR(50) DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Menunggu Check-In', 'Diperiksa', 'Selesai', 'Batal')),
  tanggal_booking DATE,
  jam_booking VARCHAR(20),
  waktu_registrasi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pendaftaran_no_antrean ON pendaftaran_pasien(no_antrean);
CREATE INDEX IF NOT EXISTS idx_pendaftaran_no_rm ON pendaftaran_pasien(no_rm);
CREATE INDEX IF NOT EXISTS idx_pendaftaran_nik ON pendaftaran_pasien(nik);
CREATE INDEX IF NOT EXISTS idx_pendaftaran_status ON pendaftaran_pasien(status);
CREATE INDEX IF NOT EXISTS idx_pendaftaran_sumber ON pendaftaran_pasien(sumber_pendaftaran);
