-- =============================================================================
-- DATABASE SCHEMA: MASTER BROADCAST
-- Path: /database/master_broadcast.sql
-- Description: Tabel master konfigurasi jadwal & template broadcast per kategori layanan
-- =============================================================================

CREATE TABLE IF NOT EXISTS master_broadcast (
    id VARCHAR(36) PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    follow_up_days INT,
    reminder_days INT,
    follow_up_template TEXT,
    reminder_template TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_master_broadcast_category ON master_broadcast(category);

-- Trigger & Fungsi untuk Otomatisasi Timestamp updated_at
CREATE OR REPLACE FUNCTION update_master_broadcast_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_master_broadcast_modtime ON master_broadcast;
CREATE TRIGGER trigger_update_master_broadcast_modtime
    BEFORE UPDATE ON master_broadcast
    FOR EACH ROW
    EXECUTE FUNCTION update_master_broadcast_timestamp();

-- Data Seed Initial
INSERT INTO master_broadcast (id, category, follow_up_days, reminder_days, follow_up_template, reminder_template) VALUES
    ('1', 'Umum', 1, NULL, 'Halo {{A}}, bagaimana kabar Anda setelah kunjungan ke Puskesmas kemarin? Semoga lekas sembuh.', NULL),
    ('2', 'KB', 3, 3, 'Halo {{A}}, bagaimana kondisi Anda setelah pemasangan/kunjungan KB 3 hari yang lalu?', 'Halo {{A}}, ini pengingat untuk jadwal kunjungan ulang KB Anda pada tanggal {{B}}. Harap datang tepat waktu.'),
    ('3', 'Imunisasi', 3, 3, 'Halo {{A}}, bagaimana kondisi si kecil setelah imunisasi 3 hari yang lalu?', NULL),
    ('4', 'AnteNatal', 2, 3, NULL, NULL),
    ('5', 'Persalinan', 7, NULL, NULL, NULL),
    ('6', 'Post Natal KF', 3, 3, NULL, NULL),
    ('7', 'Post Natal KN', 3, 3, NULL, NULL),
    ('8', 'Post Natal AKHIR NIFAS', 3, 3, NULL, NULL),
    ('9', 'Mom & Baby Care', 1, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;
