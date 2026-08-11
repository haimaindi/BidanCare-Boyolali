-- =============================================================================
-- DATABASE SCHEMA: MASTER LAYANAN LAIN
-- Path: /database/master_layanan_lain.sql
-- Description: Tabel master data tindakan medis dan layanan tambahan
-- =============================================================================

CREATE TABLE IF NOT EXISTS master_layanan_lain (
    id VARCHAR(36) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    keterangan TEXT,
    harga NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (harga >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_master_layanan_lain_nama ON master_layanan_lain(nama);

-- Trigger & Fungsi untuk Otomatisasi Timestamp updated_at
CREATE OR REPLACE FUNCTION update_master_layanan_lain_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_master_layanan_lain_modtime ON master_layanan_lain;
CREATE TRIGGER trigger_update_master_layanan_lain_modtime
    BEFORE UPDATE ON master_layanan_lain
    FOR EACH ROW
    EXECUTE FUNCTION update_master_layanan_lain_timestamp();

-- Data Seed Initial
INSERT INTO master_layanan_lain (id, nama, keterangan, harga) VALUES
    ('serv-1', 'Tindakan Hecting (Jahit Luka)', 'Layanan penjahitan luka robek ringan', 75000),
    ('serv-2', 'Angkat Jahit (Aff Hecting)', 'Pelepasan benang jahitan luka', 35000),
    ('serv-3', 'Nebulizer', 'Pemberian obat uap untuk pernapasan', 50000),
    ('serv-4', 'Ganti Balutan (Wound Care)', 'Pembersihan dan penggantian perban luka', 40000),
    ('serv-5', 'Cek Gula Darah Sewaktu', 'Pemeriksaan kadar glukosa darah', 25000)
ON CONFLICT (id) DO NOTHING;
