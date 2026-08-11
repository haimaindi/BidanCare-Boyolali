-- =============================================================================
-- DATABASE SCHEMA: MASTER IMUNISASI
-- Path: /database/master_imunisasi.sql
-- Description: Tabel master data jenis imunisasi
-- =============================================================================

CREATE TABLE IF NOT EXISTS master_imunisasi (
    id VARCHAR(36) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_master_imunisasi_nama ON master_imunisasi(nama);

-- Trigger & Fungsi untuk Otomatisasi Timestamp updated_at
CREATE OR REPLACE FUNCTION update_master_imunisasi_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_master_imunisasi_modtime ON master_imunisasi;
CREATE TRIGGER trigger_update_master_imunisasi_modtime
    BEFORE UPDATE ON master_imunisasi
    FOR EACH ROW
    EXECUTE FUNCTION update_master_imunisasi_timestamp();

-- Data Seed Initial
INSERT INTO master_imunisasi (id, nama, keterangan) VALUES
    ('imun-1', 'BCG', 'Pencegahan Tuberkulosis (TBC)'),
    ('imun-2', 'DPT-HB-Hib', 'Pencegahan Difteri, Pertusis, Tetanus, Hepatitis B, dan Haemophilus influenzae tipe b'),
    ('imun-3', 'Polio (IPV/OPV)', 'Pencegahan kelumpuhan akibat virus Polio'),
    ('imun-4', 'Campak-Rubella (MR)', 'Pencegahan Campak dan Rubella'),
    ('imun-5', 'Hepatitis B0', 'Diberikan segera setelah lahir')
ON CONFLICT (id) DO NOTHING;
