-- =============================================================================
-- DATABASE SCHEMA: MASTER KB (KELUARGA BERENCANA)
-- Path: /database/master_kb.sql
-- Description: Tabel master data KB dan tier durasi kunjungan ulang
-- =============================================================================

-- 1. Tabel Utama Master KB
CREATE TABLE IF NOT EXISTS master_kb (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Detail Tier Kunjungan Ulang Master KB
CREATE TABLE IF NOT EXISTS master_kb_tier (
    id SERIAL PRIMARY KEY,
    master_kb_id VARCHAR(36) NOT NULL REFERENCES master_kb(id) ON DELETE CASCADE,
    tier INT NOT NULL CHECK (tier > 0),
    duration_days INT NOT NULL CHECK (duration_days > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_master_kb_tier UNIQUE (master_kb_id, tier)
);

-- 3. Indexing untuk Optimalisasi Query
CREATE INDEX IF NOT EXISTS idx_master_kb_status ON master_kb(status);
CREATE INDEX IF NOT EXISTS idx_master_kb_tier_kb_id ON master_kb_tier(master_kb_id);

-- 4. Trigger & Fungsi untuk Otomatisasi Timestamp updated_at
CREATE OR REPLACE FUNCTION update_master_kb_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_master_kb_modtime ON master_kb;
CREATE TRIGGER trigger_update_master_kb_modtime
    BEFORE UPDATE ON master_kb
    FOR EACH ROW
    EXECUTE FUNCTION update_master_kb_timestamp();

-- 5. Data Seed / Initial Inserter
INSERT INTO master_kb (id, name, status) VALUES
    ('kb-1', 'Suntik 3 Bulan', 'aktif'),
    ('kb-2', 'Suntik 1 Bulan', 'aktif'),
    ('kb-3', 'Implan', 'aktif'),
    ('kb-4', 'Pil KB', 'aktif')
ON CONFLICT (id) DO NOTHING;

INSERT INTO master_kb_tier (master_kb_id, tier, duration_days) VALUES
    ('kb-1', 1, 90),
    ('kb-1', 2, 90),
    ('kb-1', 3, 90),
    ('kb-2', 1, 30),
    ('kb-2', 2, 30),
    ('kb-3', 1, 1095),
    ('kb-4', 1, 28)
ON CONFLICT (master_kb_id, tier) DO NOTHING;
