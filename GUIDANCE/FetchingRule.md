# GUIDANCE: Data Fetching Rule (FetchingRule)

Dokumen ini merupakan panduan dan prinsip arsitektur standar untuk strategi **Data Fetching** pada aplikasi ini. Dokumen ini mengatur bagaimana data diambil dari backend/database secara efisien untuk mengoptimalkan performa, pengalaman pengguna (UX), serta meminimalkan penggunaan kuota egress dan bandwidth data.

---

## 1. Dua Metode Data Fetching Utama

Aplikasi ini menggunakan **2 strategi fetching data** yang disesuaikan dengan karakteristik dan volume data pada masing-masing modul/halaman:

### Strategy 1: Full Fetching (Eager Module Fetching)
- **Definisi**: Mengambil seluruh dataset sekaligus ketika modul/halaman tertentu diakses oleh pengguna.
- **Kapan Digunakan**:
  - Modul dengan jumlah data kecil hingga sedang (< 200 - 500 record).
  - Modul master data statis/semi-statis yang memerlukan pencarian, penyaringan (filtering), atau pengurutan (sorting) instan di sisi client (Client-side Search/Sort).
  - Contoh: Master User, Master Puskesmas, Master Harga Dasar, Master Imunisasi, Master KB, Master Layanan Lain, Master Broadcast.
- **Keuntungan**: Tidak ada delay/loading tambahan saat user berpindah halaman atau melakukan pencarian di tabel.

### Strategy 2: Lazy Loading Fetching (Paged / Chunked Fetching)
- **Definisi**: Mengambil data secara bertahap dalam ukuran batch/chunk tertentu (*Page Size*) berdasarkan interaksi user (misal: tombol *Load More*, *Infinite Scroll*, atau *Pagination*).
- **Kapan Digunakan**:
  - Modul/halaman dengan volume data sangat besar dan terus bertambah (transaksi, log kunjungan, histori stok obat/BHP, laporan transaksi, rekam medis).
  - Halaman berisiko tinggi terhadap penggunaan bandwidth egress berlebih jika seluruh data di-fetch sekaligus.
  - Contoh: Stok Berjalan Obat/BHP, Riwayat Kunjungan Pasien, Kasir Piutang, Log Pemeriksaan, `dummypage.tsx`.
- **Keuntungan**: Sangat hemat kuota data/egress, waktu muat awal (*Initial Load*) sangat cepat.

---

## 2. Pusat Pengaturan Lazy Loading (`fetchingCenter.ts`)

Untuk menjaga kepastian dan kejelasan strategi fetching di setiap halaman, ukuran data (*batch limit*) untuk **Strategy 2 (Lazy Loading)** tidak di-hardcode di dalam komponen UI, melainkan dikontrol secara terpusat melalui file:

```
src/logic/services/fetchingCenter.ts
```

### Konfigurasi & Fallback Rule
1. **Registry Terpusat (`PAGE_FETCHING_LIMITS`)**: Setiap halaman/modul yang menggunakan strategi Lazy Loading terdaftar dalam objek konfigurasi dengan menentukan batasan data per fetch (`limit`).
2. **Key Halaman Spasial**: Kunci nama halaman dibuat eksplisit (contoh: `'dummypage'`, `'DaftarAkun'`, `'StokBerjalanObat'`).
3. **DEFAULT Rule**: Jika suatu halaman menggunakan Lazy Loading namun belum terdaftar atau lupa dikonfigurasi di `fetchingCenter.ts`, sistem secara otomatis akan menggunakan nilai **`DEFAULT`** (misal: 20 data per request).

---

## 3. Matriks Keputusan Robust (Metode Mana yang Digunakan?)

Agar developer/sistem tidak salah memilih strategi fetching:

| Kriteria Modul / Halaman | Estimasi Total Record | Strategi Fetching Wajib | Pengaturan Terpusat |
| :--- | :--- | :--- | :--- |
| **Master Data / Reference Table** | < 200 record | **Full Fetching** | Tidak memerlukan limit di `fetchingCenter.ts` |
| **Pendaftaran / Loket Antrean** | Aktif harian (< 500 record) | **Full Fetching** | Tidak memerlukan limit di `fetchingCenter.ts` |
| **Riwayat / Log Transaksi** | > 1.000 record | **Lazy Loading** | Register key di `fetchingCenter.ts` |
| **Stok Berjalan Obat & BHP** | > 2.000 record | **Lazy Loading** | Register key di `fetchingCenter.ts` |
| **Laporan & Rekam Medis** | High Volume Data | **Lazy Loading** | Register key di `fetchingCenter.ts` |
| **Halaman Baru / Belum Ditentukan** | Variabel | **Lazy Loading** | Otomatis jatuh ke key `DEFAULT` |

---

## 4. Penempatan Kode & Arsitektur (Modular Monolith)

Sesuai dengan ketentuan `AGENTS.md`:

1. **Service Center Layer (`src/logic/services/fetchingCenter.ts`)**:
   - Menyimpan peta konfigurasi limit tiap halaman, fallback default, serta fungsi helper `getLimitForPage(pageKey)`.

2. **Hook Layer (`src/logic/hooks/useDataFetching.ts`)**:
   - Generic React hook yang menangani logika pengambil data untuk kedua strategi:
     - Full Fetching: memanggil data lengkap sekali.
     - Lazy Loading: memanggil data per halaman/chunk dengan status `hasMore`, `loadMore()`, `page`, dan `limit` otomatis dari `fetchingCenter.ts`.

3. **Module / Page Layer (`src/modules/<modul>/` atau `src/pages/`)**:
   - Menggunakan `useDataFetching` dengan menentukan `strategy: 'full'` atau `strategy: 'lazy'`, serta passing `pageKey`.

---

## 5. Checklist Implementasi Fetching

- [ ] Memastikan modul yang berukuran besar menggunakan `strategy: 'lazy'`.
- [ ] Mendaftarkan `pageKey` baru ke `PAGE_FETCHING_LIMITS` di `fetchingCenter.ts` jika menggunakan Lazy Loading.
- [ ] Memastikan fallback `DEFAULT` berfungsi jika `pageKey` tidak ditemukan.
- [ ] Memastikan antarmuka menunjukkan status loading (*skeletons/spinners*) dan indikator `hasMore` / tombol *Load More* yang informatif.
- [ ] Bebas error linting (`lint_applet`) dan dapat di-compile dengan sukses (`compile_applet`).
