const fs = require('fs');
const filePath = 'src/modules/laporan/components/LaporanKeuanganView.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

code = code.replace(
  /typeof \(dbData\.records\.length \? dbData\.records\.map\(r => \(\{ id: r\.id, patientName: r\.patient_name \|\| '', paymentDate: new Date\(r\.created_at\)\.toISOString\(\)\.split\('T'\)\[0\], totalAmount: r\.total_tagihan, paymentMethod: r\.metode_pembayaran \|\| 'Cash', status: r\.status, serviceType: r\.jenis_layanan \|\| 'Umum', examinationId: r\.pemeriksaan_id \}\)\) : \[\]\)\[0\]/g,
  `any`
);

fs.writeFileSync(filePath, code);
