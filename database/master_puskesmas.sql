-- =============================================================================
-- DATABASE SCHEMA: MASTER PUSKESMAS
-- Path: /database/master_puskesmas.sql
-- Description: Tabel master data unit pelaksana teknis puskesmas
-- =============================================================================

CREATE TABLE IF NOT EXISTS master_puskesmas (
    id VARCHAR(36) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    alamat TEXT,
    no_telepon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_master_puskesmas_nama ON master_puskesmas(nama);

-- Trigger & Fungsi untuk Otomatisasi Timestamp updated_at
CREATE OR REPLACE FUNCTION update_master_puskesmas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_master_puskesmas_modtime ON master_puskesmas;
CREATE TRIGGER trigger_update_master_puskesmas_modtime
    BEFORE UPDATE ON master_puskesmas
    FOR EACH ROW
    EXECUTE FUNCTION update_master_puskesmas_timestamp();

-- Data Seed Initial
INSERT INTO master_puskesmas (id, nama, alamat, no_telepon) VALUES
    ('pusk-1', 'Puskesmas Sukamaju', 'Jl. Merdeka No. 123, Sukamaju, Kota Sejahtera', '021-1234567'),
    ('pusk-2', 'Puskesmas Harapan Bangsa', 'Jl. Melati No. 45, Harapan, Kabupaten Maju', '021-7654321'),
    ('pusk-3', 'Puskesmas Ceria Utama', 'Jl. Matahari No. 8, Ceria, Kota Damai', '022-9876543')
ON CONFLICT (id) DO NOTHING;
