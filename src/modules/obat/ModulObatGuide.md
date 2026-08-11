# Panduan Modul Manajemen Obat

Modul ini mengelola siklus hidup stok obat di klinik, mulai dari pengadaan (Obat Masuk), penggunaan/kerusakan (Obat Keluar), hingga sinkronisasi data (Stok Berjalan & Perbaikan Stok).

## Alur Kerja (Workflow)

1.  **Stok Berjalan**: 
    - Menampilkan ringkasan stok saat ini untuk setiap SKU.
    - Dilengkapi fitur "Perbaikan Stok" (Stock Opname) langsung di kolom Qty. Perubahan Qty di sini akan otomatis mencatat jurnal "Perbaikan Stok".
    - Edit Harga Jual akan otomatis memperbarui kalkulasi Margin (Harga Jual - Harga Beli Terakhir).
    - Klik baris data untuk melihat "Jurnal Stok" lengkap (History transaksi per obat).

2.  **Obat Masuk**:
    - Digunakan untuk mencatat pembelian atau penambahan stok.
    - Fitur **Tambah Obat Masuk**:
        - Bisa memilih SKU yang sudah ada (data otomatis terisi).
        - Bisa input SKU Baru (data otomatis terdaftar ke Stok Berjalan).
    - Memperbarui `sisaQty` dan `hargaBeliTerakhir` di data Stok Berjalan.

3.  **Obat Keluar**:
    - Digunakan untuk mencatat pengurangan stok selain dari penjualan (misal: Obat Rusak, Expired).
    - Fitur **Tambah Obat Keluar**:
        - Hanya bisa memilih SKU yang sudah tersedia di Stok Berjalan.
    - Memperbarui `sisaQty` di data Stok Berjalan.

## Kebutuhan Skema Data

### Dataset Utama (Stok Berjalan)
- `sku`: String (Unique ID)
- `namaObat`: String
- `namaMerk`: String
- `bentukSediaan`: String (Dropdown: Tablet, Kapsul, Sirup, dll)
- `dosisSediaan`: String (Contoh: 500mg)
- `sisaQty`: Number (Agregat terakhir)
- `hargaBeliTerakhir`: Number (Rupiah)
- `hargaJual`: Number (Rupiah)
- `margin`: Number (Kalkulasi otomatis)

### Dataset Jurnal (Transaksi)
- `tanggal`: ISO Date String
- `jenis`: Enum (Masuk, Keluar, Terjual, Perbaikan Stok)
- `perubahanQty`: Number (Positif/Negatif)
- `sisaQty`: Number (Saldo setelah transaksi)
- `keterangan`: String

## Komponen UI
- `StokBerjalanTable`: Tabel utama dengan input inline untuk perbaikan stok dan navigasi ke jurnal.
- `ObatMasukTable`: Riwayat pengadaan dan modal form input.
- `ObatKeluarTable`: Riwayat pengurangan stok dan modal form input.
- `PriceInput`: Komponen input khusus Rupiah dengan format ribuan otomatis.
