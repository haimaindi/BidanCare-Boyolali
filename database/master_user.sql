-- =============================================================================
-- DATABASE SCHEMA: MASTER USER
-- Path: /database/master_user.sql
-- Description: Tabel master data pengguna sistem dan hak akses
-- =============================================================================

CREATE TABLE IF NOT EXISTS master_user (
    id VARCHAR(36) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    jenis_user VARCHAR(50) NOT NULL,
    str VARCHAR(100),
    sip VARCHAR(100),
    no_whatsapp VARCHAR(50),
    access_id VARCHAR(100) UNIQUE NOT NULL,
    access_password TEXT,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_master_user_access_id ON master_user(access_id);
CREATE INDEX IF NOT EXISTS idx_master_user_jenis_user ON master_user(jenis_user);

-- Trigger & Fungsi untuk Otomatisasi Timestamp updated_at
CREATE OR REPLACE FUNCTION update_master_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_master_user_modtime ON master_user;
CREATE TRIGGER trigger_update_master_user_modtime
    BEFORE UPDATE ON master_user
    FOR EACH ROW
    EXECUTE FUNCTION update_master_user_timestamp();

-- Data Seed Initial
INSERT INTO master_user (id, nama, jenis_user, str, sip, no_whatsapp, access_id, permissions) VALUES
    ('1', 'dr. Andi Wijaya', 'dokter', 'STR-123456', 'SIP-789012', '081 234 567 890', 'andi.wijaya', ARRAY['Master Data', 'Pendaftaran', 'Pemeriksaan']),
    ('2', 'Siti Aminah, S.Kep', 'perawat', NULL, NULL, '082 345 678 901', 'siti.aminah', ARRAY['Pendaftaran', 'Pemeriksaan']),
    ('3', 'Budi Santoso, Apt', 'farmasi', NULL, NULL, '083 456 789 012', 'budi.farmasi', ARRAY['Farmasi'])
ON CONFLICT (id) DO NOTHING;
