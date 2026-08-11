# Modul Master Data KB

## Deskripsi
Modul ini digunakan untuk mengelola data master Keluarga Berencana (KB) yang mencakup jenis KB dan konfigurasi tier kunjungan ulang.

## Fitur Utama
1. **Daftar Master KB**: Menampilkan tabel data KB yang sudah terdaftar.
2. **Tambah Master KB**: Form untuk menambahkan jenis KB baru beserta durasi per tier.
3. **Edit Master KB**: Mengubah data KB yang sudah ada.
4. **Hapus Master KB**: Menghapus data master KB dengan konfirmasi keamanan (SweetAlert2).
5. **Manajemen Tier**: Setiap jenis KB dapat memiliki beberapa tier kunjungan ulang dengan durasi hari yang berbeda-beda.

## Struktur Data
- **Nama / Jenis KB**: Nama layanan KB (misal: Suntik 3 Bulan, Implan).
- **Tier Kunjungan Ulang**: Daftar tingkatan kunjungan (Tier 1, Tier 2, dst) beserta durasi dalam satuan hari.

## Komponen Teknis
- `MasterKbModule.tsx`: Kontainer utama modul.
- `components/KbTable.tsx`: Komponen tabel menggunakan `TableModule`.
- `components/KbForm.tsx`: Komponen form input data.
- `types.ts`: Definisi interface data KB.
- `data/dummy.ts`: Data awal untuk keperluan pengembangan.
