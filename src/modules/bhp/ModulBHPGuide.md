# Panduan Modul Manajemen BHP (Bahan Habis Pakai)

Modul ini mengelola siklus hidup stok bahan habis pakai (BHP) di klinik, mencakup pengadaan, penggunaan internal, hingga penyesuaian stok fisik.

## Alur Kerja (Workflow)

1.  **Stok Berjalan BHP**: 
    - Menampilkan ringkasan stok aktual berdasarkan SKU.
    - **Perbaikan Stok**: Memungkinkan penyesuaian jumlah stok secara langsung melalui kolom Qty (Stock Opname). Setiap perubahan akan tercatat otomatis dalam Jurnal Stok BHP.
    - **Margin & Harga**: Menghitung selisih antara Harga Jual dan Harga Beli Terakhir untuk memantau nilai aset.
    - **Detail Jurnal**: Klik pada baris untuk membuka halaman riwayat transaksi (Masuk, Keluar, Terjual, Perbaikan).

2.  **BHP Masuk**:
    - Mencatat penambahan stok dari supplier.
    - **Tambah BHP Masuk**:
        - **Existing SKU**: Memilih dari data yang sudah ada (otomatis mengisi kategori, nama, dan satuan).
        - **SKU Baru**: Mendaftarkan item BHP baru ke sistem (otomatis menambah baris baru di Stok Berjalan).
    - Memperbarui `sisaQty`, `hargaBeliTerakhir`, dan menghitung ulang `margin` pada master data.

3.  **BHP Keluar**:
    - Mencatat pengurangan stok untuk keperluan internal atau karena barang rusak/hilang.
    - **Tambah BHP Keluar**:
        - Hanya dapat dilakukan pada SKU yang sudah tersedia di Stok Berjalan.
    - Memperbarui saldo `sisaQty` di master data.

## Kebutuhan Skema Data

### Dataset Utama (Stok Berjalan BHP)
- `sku`: String (ID Unik, misal: BHP-001)
- `kategori`: String (Dropdown: Alat Medis, Laboratorium, ATK, dll)
- `namaBhp`: String (Nama barang)
- `satuan`: String (Dropdown: Pcs, Box, Roll, Botol)
- `sisaQty`: Number (Agregat saldo saat ini)
- `hargaBeliTerakhir`: Number (Nilai pengadaan terakhir)
- `hargaJual`: Number (Nilai jual/tarif ke pasien)
- `margin`: Number (Nilai keuntungan kotor)

### Dataset Jurnal BHP
- `tanggal`: ISO Date String
- `jenis`: Enum (Masuk, Keluar, Terjual, Perbaikan Stok)
- `perubahanQty`: Number (Kuantitas masuk [+] atau keluar [-])
- `sisaQty`: Number (Saldo akhir setelah perubahan)
- `keterangan`: String (Alasan transaksi)

## Komponen Terintegrasi
- `StokBerjalanBhpTable`: Manajemen master data dan akses jurnal.
- `BhpMasukTable`: Form input pengadaan dengan dukungan SKU baru.
- `BhpKeluarTable`: Form input pengurangan stok non-penjualan.
- `PriceInput`: Input field dengan format mata uang Rupiah otomatis.
