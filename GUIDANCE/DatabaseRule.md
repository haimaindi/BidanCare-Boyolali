# Database Rule & Architecture Guidance (Supabase PostgreSQL)

Dokumen ini merupakan panduan standar dan prinsip aturan baku pengelolaan skema database pada aplikasi, dirancang khusus untuk mengoptimalkan performa, skalabilitas, integritas data, serta audit trail yang ketat pada **Supabase (PostgreSQL)**.

---

## 1. Core Stack & Architecture Standard

1. **Database Engine:** Supabase (PostgreSQL).
2. **Primary Key Standard:**
   - Setiap tabel WAJIB menggunakan tipe data `UUID` sebagai Primary Key.
   - Default value menggunakan fungsi bawaan Postgres `gen_random_uuid()` (atau `uuid_generate_v4()`).
   - Contoh DDL:
     ```sql
     id UUID PRIMARY KEY DEFAULT gen_random_uuid()
     ```

---

## 2. Datetime & Audit Trail Standard (Anti-Manipulasi)

Setiap entitas data/tabel wajib memiliki dua lapis pencatatan waktu:

### A. Manual Datetime Modul (Application Level / Operational)
Digunakan untuk pencatatan tanggal transaksi operasional yang dapat diinput atau disesuaikan (*backdate*) oleh pengguna:
- `created_datetime TIMESTAMPTZ NOT NULL`: Waktu entri operasional manual.
- `updated_datetime TIMESTAMPTZ NOT NULL`: Waktu perubahan operasional manual.

### B. Database Audit Trail (System Level / Unalterable)
Dicatat secara otomatis di tingkat sistem/database untuk keperluan audit dan keamanan:
- `created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`: Timestamp pembuatan otomatis dari server database (`NOW()`).
- `created_by UUID NULL`: Identifier user/aktor pembuat data (merujuk ke `auth.users(id)` atau tabel user).
- `created_timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta'`: Standard IANA Timezone Identifier (misal: `'Asia/Jakarta'`, `'America/New_York'`) yang dideteksi dari lokasi client saat *request*.
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`: Timestamp pembaruan otomatis dari server database.
- `updated_by UUID NULL`: Identifier user/aktor pengubah data.
- `updated_timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta'`: Standard IANA Timezone Identifier pengubah data.

---

## 3. Database Integrity & Foreign Key Dependencies

1. **Foreign Key Constraint:**
   - Semua relasi antar tabel (Parent-Child) WAJIB didefinisikan secara eksplisit menggunakan Foreign Key.
2. **Cascading Behavior:**
   - Untuk menjaga konsistensi data dan menghindari data terisolasi (*orphan records*), gunakan aturan `ON DELETE CASCADE` atau `ON UPDATE CASCADE` langsung pada level DDL tabel anak (*child table*).
   - Contoh DDL:
     ```sql
     CONSTRAINT fk_pasien_kunjungan 
       FOREIGN KEY (pasien_id) 
       REFERENCES rekam_medis_pasien(id) 
       ON DELETE CASCADE 
       ON UPDATE CASCADE
     ```

---

## 4. Performance Optimization (Anti-Table Scan & Kuota Hemat)

### A. Standard B-Tree Indexing
Untuk mencegah *Full Table Scan* yang lambat dan menghemat kuota query, B-Tree Index WAJIB dibuat pada:
- Semua kolom Foreign Key (e.g., `pasien_id`, `user_id`, `puskesmas_id`).
- Kolom status atau indikator (e.g., `status`, `tipe`, `kategori`).
- Kolom flagging soft-delete (e.g., `is_deleted`).
- Kolom yang sering masuk dalam klausa `WHERE`, `JOIN`, atau `ORDER BY`.

**Aturan Penamaan Index:** `idx_[nama_tabel]_[nama_kolom]`
```sql
CREATE INDEX IF NOT EXISTS idx_pendaftaran_pasien_id ON pendaftaran(pasien_id);
CREATE INDEX IF NOT EXISTS idx_pendaftaran_status ON pendaftaran(status);
CREATE INDEX IF NOT EXISTS idx_pendaftaran_is_deleted ON pendaftaran(is_deleted);
```

### B. Full-Text Search (FTS) Optimization
- DILARANG KERAS menggunakan `LIKE '%keyword%'` atau `ILIKE '%keyword%'` pada pencarian teks bebas (seperti nama obat, nomor rekam medis, judul dokumen) karena memicu *Full Table Scan*.
- **PostgreSQL Full-Text Search Standard:**
  Gunakan **GIN Index** berpasangan dengan fungsi `to_tsvector('indonesian', ...)` atau `to_tsvector('english', ...)`.
```sql
-- Membuat GIN Index untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_master_obat_fts 
ON master_obat 
USING GIN (to_tsvector('indonesian', nama_obat || ' ' || kode_obat));

-- Contoh Query Pencarian Efisien:
SELECT * FROM master_obat 
WHERE to_tsvector('indonesian', nama_obat || ' ' || kode_obat) @@ to_tsquery('indonesian', 'paracetamol');
```

---

## 5. SQL Execution Schema Standards

1. **Idempotent DDL Execution:**
   - Pembuatan tabel dan indeks wajib menggunakan klausa `IF NOT EXISTS`.
   ```sql
   CREATE TABLE IF NOT EXISTS rekam_medis_pasien ( ... );
   CREATE INDEX IF NOT EXISTS idx_rekam_medis_nik ON rekam_medis_pasien(nik);
   ```
2. **Schema Mutation:**
   - Untuk skema yang sudah berjalan, gunakan skrip `ALTER TABLE` secara eksplisit dan aman.
3. **Database Trigger untuk `updated_at`:**
   - Disediakan trigger universal di PostgreSQL untuk memperbarui `updated_at` secara otomatis saat record di-update:
   ```sql
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
   END;
   $$ language 'plpgsql';
   ```

---

## 6. Ringkasan Rekomendasi Penyesuaian Logic

1. **Inisialisasi Database:** Skrip DDL/Migration lengkap ditempatkan di folder `/database/schema.sql`.
2. **Auditing Middleware / Service Layer:** Pastikan layer API/Service menangkap IANA Timezone browser client (`Intl.DateTimeFormat().resolvedOptions().timeZone`) dan `user_id` aktif untuk dikirim ke kolom `created_timezone`, `created_by`, `updated_timezone`, dan `updated_by`.
3. **Pencarian Data (FTS):** Sesuaikan modul pencarian (Master Obat, Rekam Medis, Loket Obat) dari filter `LIKE`/`includes` sederhana ke query FTS berbasis Postgres GIN index saat integrasi database aktif.
