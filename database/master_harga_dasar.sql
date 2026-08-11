-- =============================================================================
-- DATABASE SCHEMA: MASTER HARGA DASAR
-- Path: /database/master_harga_dasar.sql
-- Description: Tabel master data harga dasar per jenis layanan
-- =============================================================================

CREATE TABLE IF NOT EXISTS master_harga_dasar (
    id VARCHAR(36) PRIMARY KEY,
    nama_layanan VARCHAR(255) NOT NULL,
    harga_dasar NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (harga_dasar >= 0),
    last_updated DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_master_harga_dasar_nama ON master_harga_dasar(nama_layanan);

-- Trigger & Fungsi untuk Otomatisasi Timestamp updated_at
CREATE OR REPLACE FUNCTION update_master_harga_dasar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.last_updated = CURRENT_DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_master_harga_dasar_modtime ON master_harga_dasar;
CREATE TRIGGER trigger_update_master_harga_dasar_modtime
    BEFORE UPDATE ON master_harga_dasar
    FOR EACH ROW
    EXECUTE FUNCTION update_master_harga_dasar_timestamp();

-- Data Seed Initial
INSERT INTO master_harga_dasar (id, nama_layanan, harga_dasar, last_updated) VALUES
    ('HD-001', 'Umum', 50000, '2026-01-10'),
    ('HD-002', 'KB', 75000, '2026-01-10'),
    ('HD-003', 'Imunisasi', 100000, '2026-01-10'),
    ('HD-004', 'AnteNatal - Tanpa USG', 150000, '2026-01-10'),
    ('HD-005', 'AnteNatal - USG 2D', 250000, '2026-01-10'),
    ('HD-006', 'AnteNatal - USG 4D', 450000, '2026-01-10'),
    ('HD-007', 'Persalinan', 2500000, '2026-01-10'),
    ('HD-008', 'Post Natal - KF', 100000, '2026-01-10'),
    ('HD-009', 'Post Natal - KN', 100000, '2026-01-10'),
    ('HD-010', 'Post Natal - Akhir Nifas', 100000, '2026-01-10'),
    ('HD-011', 'Mom & Baby Care', 300000, '2026-01-10')
ON CONFLICT (id) DO NOTHING;
