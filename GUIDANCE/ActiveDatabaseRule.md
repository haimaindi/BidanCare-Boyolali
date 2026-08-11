# Active Database Rule Guidance (Keep-Alive & Ping Monitoring)

Dokumen ini mendefinisikan standar dan mekanisme pencegahan pembekuan database (*auto-pause*) pada Supabase (PostgreSQL) melalui skema **Cron Ping Monitoring** harian pada pukul **02:00 AM**.

---

## 1. Masalah & Tujuan (Problem & Objective)

1. **Problem:** Proyek Supabase pada tier gratis atau developer memiliki fitur *auto-pause* jika tidak ada aktivitas query/koneksi database dalam jangka waktu beberapa hari berturut-turut.
2. **Objective:** Memastikan instance database selalu aktif (*always active*) dengan mengirimkan aktivitas query terjadwal secara otomatis setiap hari pada pukul **02:00 AM** melalui mekanisme **UPSERT 1-baris** pada tabel `ping_monitoring`.

---

## 2. Skema Tabel `ping_monitoring` (Single-Row Enforced)

Tabel `ping_monitoring` dirancang secara efisien untuk hanya menampung **tepat 1 baris data** agar tidak menambah beban kuota storage.

### Struktur Kolom:
- `id` (UUID, Primary Key): ID konstan tunggal, misal `'00000000-0000-0000-0000-000000000001'`.
- `last_ping_at` (TIMESTAMPTZ): Tanggal dan waktu ping terakhir dieksekusi.
- `status` (VARCHAR): Indikator status kesehatan koneksi (misal `'OK'`, `'ACTIVE'`).
- `ping_count` (BIGINT): Counter kumulatif jumlah ping yang berhasil.
- `created_at` & `updated_at` (TIMESTAMPTZ): Audit trail timestamp sistem.

---

## 3. Strategi Operasi: UPSERT (Update/Insert)

Pengisian atau pembaruan data **DILARANG** menambahkan baris baru (`INSERT` bertambah). Pengisian wajib menggunakan klausa `UPSERT` (`INSERT ... ON CONFLICT (id) DO UPDATE`):

```sql
INSERT INTO ping_monitoring (id, last_ping_at, status, ping_count, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    NOW(),
    'ACTIVE',
    1,
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    last_ping_at = EXCLUDED.last_ping_at,
    status = EXCLUDED.status,
    ping_count = ping_monitoring.ping_count + 1,
    updated_at = EXCLUDED.updated_at;
```

---

## 4. Skema Terjadwal (CRON Schedule at 02:00 AM)

### A. Opsi Native Supabase (`pg_cron`)
Mengaktifkan ekstensi `pg_cron` di Supabase SQL Editor untuk menjalankan ping setiap jam 2 pagi (`0 2 * * *` UTC / WIB disesuaikan):

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'daily-database-keep-alive-ping',
    '0 2 * * *',
    $$
    INSERT INTO ping_monitoring (id, last_ping_at, status, ping_count, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000001', NOW(), 'ACTIVE', 1, NOW())
    ON CONFLICT (id) DO UPDATE SET
        last_ping_at = EXCLUDED.last_ping_at,
        status = EXCLUDED.status,
        ping_count = ping_monitoring.ping_count + 1,
        updated_at = EXCLUDED.updated_at;
    $$
);
```

### B. Opsi Application / External Service Trigger
Jika menggunakan service external (seperti GitHub Actions, Vercel Cron, atau Express Server background runner):
- Memanggil helper `pingDatabase()` yang berada di `src/logic/services/pingService.ts`.

---

## 5. Ringkasan Implementasi File
1. `/database/ping_monitoring.sql`: DDL & DML script siap pakai untuk Supabase SQL Editor.
2. `/src/logic/services/pingService.ts`: TypeScript service handler untuk mengeksekusi ping dari sisi aplikasi secara modular.
3. `/GUIDANCE/ActiveDatabaseRule.md`: Dokumen acuan standar ini.
