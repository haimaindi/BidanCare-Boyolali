# Modul Master Rekam Medis (Data Pasien)

Modul ini digunakan untuk mengelola data master pasien dan riwayat kunjungan rekam medis secara terpusat.

## Fitur Utama
1. **Master Pasien**: Pencatatan identitas lengkap pasien (Nama, NIK, No. RM, TTL, Alamat, Penjamin).
2. **Key Internal ID**: Menggunakan internal ID (Primary Key) untuk menghubungkan data pasien dengan log kunjungan, sehingga perubahan No. RM atau NIK tidak memutus riwayat medis.
3. **Riwayat Kunjungan**: Menampilkan log kunjungan per pasien secara kronologis.
4. **Pencarian Cepat**: Cari pasien berdasarkan Nama, No. RM, atau NIK.

## Integrasi
- Data ini akan menjadi rujukan bagi modul **Pendaftaran Offline/Online**.
- Status "Pasien Baru" pada pendaftaran akan secara otomatis memicu penambahan data ke modul ini.
