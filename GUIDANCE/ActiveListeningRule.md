# GUIDANCE: Active Listening Realtime Rule (ActiveListeningRule)

Dokumen ini merupakan panduan dan prinsip standar arsitektur **Active Listening Realtime** untuk aplikasi ini, khususnya dalam mengintegrasikan event-driven real-time database (seperti Supabase Realtime / WebSocket / Server-Sent Events) dengan antarmuka UI/UX.

---

## 1. Konsep Utama Active Listening Realtime

Active Listening Realtime adalah pendekatan di mana antarmuka pengguna (UI/UX) secara aktif "mendengarkan" (*listens*) perubahan data pada tingkat database atau server secara otomatis tanpa memerlukan refresh manual atau polling berulang.

### Core Architecture Flow
```
[Database / Supabase] 
       │ (Postgres Changes / WAL CDC / WebSockets)
       ▼
[Supabase Client / Realtime Channel]
       │
       ▼
[Realtime Service Layer (src/logic/services/realtimeService.ts)]
       │
       ▼
[React Hook Layer (src/logic/hooks/useActiveListening.ts)]
       │
       ▼
[Module State / Store / Context]
       │
       ▼
[UI Components & Feedback Indicators (Badges, Toasts, Tables)]
```

---

## 2. Integrasi Supabase Realtime & Engine Flow

Ketika menggunakan **Supabase**, mekanisme Realtime bekerja melalui fitur **Postgres Changes** (Logical Replication / Write-Ahead Log) dan **Realtime Channels** (`postgres_changes`, `broadcast`, `presence`).

### A. Postgres Changes Listener Pattern
Untuk mendengarkan perubahan baris (`INSERT`, `UPDATE`, `DELETE`) pada tabel tertentu:
1. **Filter Scope**: Selalu gunakan filter spesifik (misal `schema: 'public'`, `table: 'pendaftaran'`, `filter: 'puskesmas_id=eq.1'`) agar client hanya menerima payload yang relevan.
2. **Event Payload**:
   - `INSERT`: Mengembalikan `new` record.
   - `UPDATE`: Mengembalikan `old` dan `new` record.
   - `DELETE`: Mengembalikan `old` record.

### B. Broadcast & Presence Pattern
1. **Broadcast**: Untuk event ephemeris antar client tanpa disimpan ke database (contoh: pemanggilan nomor antrean di layar TV monitor).
2. **Presence**: Untuk melacak status aktif user (contoh: kasir sedang melayani pasien X, dokter sedang online).

---

## 3. Aturan Arsitektur & Penempatan Kode (Modular Monolith)

Sesuai dengan ketentuan `AGENTS.md`:

1. **Service Layer (`src/logic/services/realtimeService.ts`)**:
   - Berfungsi sebagai abstraksi utama penyedia koneksi realtime/listening.
   - Menyediakan handler event generik, pembuat channel, serta fallback jika koneksi terputus.

2. **Hook Layer (`src/logic/hooks/useActiveListening.ts`)**:
   - Custom hook TypeScript yang membungkus siklus hidup (*lifecycle*) subscription (`subscribe` saat mount, `unsubscribe` saat unmount).
   - Mengelola status koneksi (`connecting`, `connected`, `disconnected`, `error`).

3. **Module Layer (`src/modules/<nama-modul>/`)**:
   - Setiap modul yang membutuhkan active listening hanya memanggil custom hook dari `src/logic/hooks/`.
   - Modul mengubah local state secara rekonsiliatif dan reaktif.

---

## 4. Strategi Pengelolaan State & UX/UI Responsiveness

### A. Rekonsiliasi State Lokal
- **Handling INSERT**: Sisipkan data baru di urutan teratas list/tabel tanpa memuat ulang seluruh list.
- **Handling UPDATE**: Perbarui data pada index terkait berdasarkan ID unik.
- **Handling DELETE**: Filter keluar item yang terhapus dari state lokal.

### B. Indikator Status & Visual Feedback
- **Active Listening Badge**: Tampilkan indikator status koneksi realtime pada header/tabel (contoh: *Pulsing Green Dot* saat terhubung, *Yellow* saat menyambung ulang, *Red* jika terputus).
- **Toast / Notification**: Tampilkan notifikasi halus saat ada data masuk dari pengguna/loket lain (misal: "Pasien baru terdaftar di Loket 1").
- **Highlight Effect**: Berikan efek sorotan sementara (*flash/highlight animation*) pada baris tabel yang baru bertambah atau berubah.

---

## 5. Resiliensi, Error Handling & Fallback Strategy

1. **Auto Reconnection**: Jika koneksi WebSocket terputus, service harus mencoba menghubungkan kembali (*backoff strategy*).
2. **Periodic Health Check / Ping**: Manfaatkan `pingService.ts` untuk memverifikasi konektivitas server secara berkala.
3. **Fallback Polling / Re-fetch**: Jika koneksi realtime terputus total selama waktu tertentu (> 30 detik), sistem secara otomatis melakukan re-fetch snapshot data via API/database agar state tidak basi (*stale data*).
4. **Clean Unsubscribe**: Wajib membersihkan (*cleanup*) channel listener pada `useEffect` unmount untuk mencegah *memory leak* dan *duplicate listener*.

---

## 6. Checklist Implementasi Modul

Setiap modul yang diaktifkan fitur Active Listening harus memenuhi kriteria berikut:
- [ ] Menggunakan `useActiveListening` atau `useRealtimeTable` dari `src/logic/hooks/`.
- [ ] Memiliki penanganan unik untuk event `INSERT`, `UPDATE`, dan `DELETE`.
- [ ] Menyediakan indikator status koneksi (Active / Reconnecting / Offline).
- [ ] Lolos verifikasi `lint_applet` dan `compile_applet`.
