const fs = require('fs');
let code = fs.readFileSync('src/modules/laporan/components/LaporanPasienView.tsx', 'utf-8');
code = code.replace(/typeof \(dbData\.records\.length \? dbData\.records\.map\(r => \(\{ id: r\.id, visitDate: new Date\(r\.created_at\)\.toISOString\(\)\.split\('T'\)\[0\], patientName: r\.nama, noRm: r\.no_rm, gender: r\.jenis_kelamin, age: r\.usia, address: r\.alamat, paymentType: r\.penjamin, diagnosis: "Umum", status: r\.status \}\)\) : \[\]\)\[0\]/g, `any`);
fs.writeFileSync('src/modules/laporan/components/LaporanPasienView.tsx', code);

code = fs.readFileSync('src/modules/laporan/components/LaporanObatBhpView.tsx', 'utf-8');
code = code.replace(/typeof \(dbData\.records\.length \? dbData\.records\.map\(\(r, i\) => \(\{ id: r\.id \|\| String\(i\), sku: r\.sku \|\| "SKU", itemName: r\.master_obat\?\.nama \|\| "Obat", category: "Obat", unit: "Pcs", stokAwal: 0, trxMasuk: r\.tipe === "Masuk" \? r\.jumlah : 0, trxKeluar: r\.tipe === "Keluar" \? r\.jumlah : 0, sisaQty: r\.tipe === "Masuk" \? r\.jumlah : -r\.jumlah, nilaiAset: 0 \}\)\) : \[\]\)\[0\]/g, `any`);
fs.writeFileSync('src/modules/laporan/components/LaporanObatBhpView.tsx', code);
