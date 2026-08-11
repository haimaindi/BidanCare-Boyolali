-- =============================================================================
-- DATABASE SCHEMA: MANAJEMEN BHP (Bahan Habis Pakai)
-- Path: /database/manajemen_bhp.sql
-- Description: Tabel stok berjalan BHP, jurnal BHP, BHP masuk, dan BHP keluar
-- =============================================================================

-- Tabel Stok Berjalan BHP
CREATE TABLE IF NOT EXISTS bhp_stok_berjalan (
    sku VARCHAR(50) PRIMARY KEY,
    kategori VARCHAR(100) NOT NULL,
    nama_bhp VARCHAR(255) NOT NULL,
    satuan VARCHAR(50) NOT NULL,
    sisa_qty INT NOT NULL DEFAULT 0 CHECK (sisa_qty >= 0),
    harga_beli_terakhir NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (harga_beli_terakhir >= 0),
    harga_jual NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (harga_jual >= 0),
    margin NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bhp_stok_nama ON bhp_stok_berjalan(nama_bhp);

-- Tabel Jurnal Stok BHP
CREATE TABLE IF NOT EXISTS bhp_jurnal (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL REFERENCES bhp_stok_berjalan(sku) ON DELETE CASCADE,
    tanggal TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    jenis VARCHAR(50) NOT NULL, -- Masuk, Keluar, Terjual, Perbaikan Stok
    perubahan_qty INT NOT NULL,
    sisa_qty INT NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bhp_jurnal_sku ON bhp_jurnal(sku);

-- Tabel BHP Masuk
CREATE TABLE IF NOT EXISTS bhp_masuk (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    nama_bhp VARCHAR(255) NOT NULL,
    satuan VARCHAR(50) NOT NULL,
    qty_masuk INT NOT NULL CHECK (qty_masuk > 0),
    harga_beli NUMERIC(12, 2) NOT NULL CHECK (harga_beli >= 0),
    tanggal TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bhp_masuk_sku ON bhp_masuk(sku);

-- Tabel BHP Keluar
CREATE TABLE IF NOT EXISTS bhp_keluar (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    nama_bhp VARCHAR(255) NOT NULL,
    satuan VARCHAR(50) NOT NULL,
    qty_keluar INT NOT NULL CHECK (qty_keluar > 0),
    keterangan TEXT,
    tanggal TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bhp_keluar_sku ON bhp_keluar(sku);

-- Data Seed Initial
INSERT INTO bhp_stok_berjalan (sku, kategori, nama_bhp, satuan, sisa_qty, harga_beli_terakhir, harga_jual, margin) VALUES
    ('BHP-001', 'Alat Medis', 'Spuit 3cc', 'Pcs', 100, 1500, 2500, 1000),
    ('BHP-002', 'Laboratorium', 'Alkohol Swab', 'Box', 50, 25000, 35000, 10000)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO bhp_jurnal (id, sku, tanggal, jenis, perubahan_qty, sisa_qty, keterangan) VALUES
    ('J1', 'BHP-001', '2024-03-20 10:00:00+00', 'Masuk', 100, 100, 'Stok Awal'),
    ('J2', 'BHP-002', '2024-03-20 11:00:00+00', 'Masuk', 50, 50, 'Stok Awal')
ON CONFLICT (id) DO NOTHING;

INSERT INTO bhp_masuk (id, sku, kategori, nama_bhp, satuan, qty_masuk, harga_beli, tanggal) VALUES
    ('BM-1', 'BHP-001', 'Alat Medis', 'Spuit 3cc', 'Pcs', 100, 1500, '2024-03-20 10:00:00+00')
ON CONFLICT (id) DO NOTHING;
