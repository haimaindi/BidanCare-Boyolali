-- =============================================================================
-- DATABASE SCHEMA: MANAJEMEN OBAT
-- Path: /database/manajemen_obat.sql
-- Description: Tabel stok berjalan, jurnal stok, obat masuk, dan obat keluar
-- =============================================================================

-- Tabel Stok Berjalan Obat
CREATE TABLE IF NOT EXISTS obat_stok_berjalan (
    sku VARCHAR(50) PRIMARY KEY,
    nama_obat VARCHAR(255) NOT NULL,
    nama_merk VARCHAR(255) NOT NULL,
    bentuk_sediaan VARCHAR(100) NOT NULL,
    dosis_sediaan VARCHAR(100) NOT NULL,
    sisa_qty INT NOT NULL DEFAULT 0 CHECK (sisa_qty >= 0),
    harga_beli_terakhir NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (harga_beli_terakhir >= 0),
    harga_jual NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (harga_jual >= 0),
    margin NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_obat_stok_nama ON obat_stok_berjalan(nama_obat);

-- Tabel Jurnal Stok Obat
CREATE TABLE IF NOT EXISTS obat_jurnal (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL REFERENCES obat_stok_berjalan(sku) ON DELETE CASCADE,
    tanggal TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    jenis VARCHAR(50) NOT NULL, -- Masuk, Keluar, Terjual, Perbaikan Stok
    perubahan_qty INT NOT NULL,
    sisa_qty INT NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_obat_jurnal_sku ON obat_jurnal(sku);

-- Tabel Obat Masuk
CREATE TABLE IF NOT EXISTS obat_masuk (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL,
    nama_obat VARCHAR(255) NOT NULL,
    nama_merk VARCHAR(255) NOT NULL,
    bentuk_sediaan VARCHAR(100) NOT NULL,
    dosis_sediaan VARCHAR(100) NOT NULL,
    qty_masuk INT NOT NULL CHECK (qty_masuk > 0),
    harga_beli NUMERIC(12, 2) NOT NULL CHECK (harga_beli >= 0),
    tanggal TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_obat_masuk_sku ON obat_masuk(sku);

-- Tabel Obat Keluar
CREATE TABLE IF NOT EXISTS obat_keluar (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL,
    nama_obat VARCHAR(255) NOT NULL,
    nama_merk VARCHAR(255) NOT NULL,
    bentuk_sediaan VARCHAR(100) NOT NULL,
    dosis_sediaan VARCHAR(100) NOT NULL,
    qty_keluar INT NOT NULL CHECK (qty_keluar > 0),
    keterangan TEXT,
    tanggal TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_obat_keluar_sku ON obat_keluar(sku);

-- Data Seed Initial
INSERT INTO obat_stok_berjalan (sku, nama_obat, nama_merk, bentuk_sediaan, dosis_sediaan, sisa_qty, harga_beli_terakhir, harga_jual, margin) VALUES
    ('OBT-001', 'Paracetamol', 'Panadol', 'Tablet', '500mg', 150, 8000, 12000, 4000),
    ('OBT-002', 'Amoxicillin', 'Amoxsan', 'Kapsul', '500mg', 75, 15000, 22500, 7500)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO obat_jurnal (id, sku, tanggal, jenis, perubahan_qty, sisa_qty, keterangan) VALUES
    ('J001', 'OBT-001', '2024-08-01 10:00:00+00', 'Masuk', 200, 200, 'Pembelian awal'),
    ('J002', 'OBT-001', '2024-08-05 14:30:00+00', 'Terjual', -50, 150, 'Resep pasien'),
    ('J003', 'OBT-002', '2024-08-02 11:00:00+00', 'Masuk', 100, 100, 'Pembelian rutin'),
    ('J004', 'OBT-002', '2024-08-06 09:15:00+00', 'Terjual', -20, 80, 'Resep pasien'),
    ('J005', 'OBT-002', '2024-08-08 16:00:00+00', 'Keluar', -5, 75, 'Obat rusak')
ON CONFLICT (id) DO NOTHING;

INSERT INTO obat_masuk (id, sku, nama_obat, nama_merk, bentuk_sediaan, dosis_sediaan, qty_masuk, harga_beli, tanggal) VALUES
    ('OM-001', 'OBT-001', 'Paracetamol', 'Panadol', 'Tablet', '500mg', 200, 8000, '2024-08-01 10:00:00+00'),
    ('OM-002', 'OBT-002', 'Amoxicillin', 'Amoxsan', 'Kapsul', '500mg', 100, 15000, '2024-08-02 11:00:00+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO obat_keluar (id, sku, nama_obat, nama_merk, bentuk_sediaan, dosis_sediaan, qty_keluar, keterangan, tanggal) VALUES
    ('OK-001', 'OBT-002', 'Amoxicillin', 'Amoxsan', 'Kapsul', '500mg', 5, 'Obat rusak', '2024-08-08 16:00:00+00')
ON CONFLICT (id) DO NOTHING;
