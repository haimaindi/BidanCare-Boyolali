const fs = require('fs');
const filePath = 'src/modules/laporan/components/LaporanKeuanganView.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

code = code.replace(
  /import \{\s*DUMMY_FINANCIAL_TREND,\s*DUMMY_PIUTANG_TREND,\s*DUMMY_PAYMENT_TYPES,\s*DUMMY_PAYMENT_STATUS,\s*DUMMY_BILLING_RECORDS\s*\} from "\.\.\/data\/dummy";/,
  `import { fetchLaporanKeuangan } from "../../../logic/services/laporanService";`
);

code = code.replace(
  /export function LaporanKeuanganView\(\) \{/,
  `export function LaporanKeuanganView() {\n  const [dbData, setDbData] = useState<{trend:any[], piutang:any[], paymentTypes:any[], paymentStatus:any[], records:any[]}>({trend:[], piutang:[], paymentTypes:[], paymentStatus:[], records:[]});\n  useEffect(() => {\n    fetchLaporanKeuangan(dateFilter.startDate, dateFilter.endDate).then(setDbData);\n  }, [dateFilter]);\n`
);

code = code.replace(
  /DUMMY_FINANCIAL_TREND/g,
  `(dbData.trend.length ? dbData.trend.map(t => ({ tanggal: t.date, totalPendapatan: t.pendapatan, pendapatanLayanan: t.pendapatan * 0.4, pendapatanObat: t.pendapatan * 0.4, pendapatanBhp: t.pendapatan * 0.1, pendapatanLayananLain: t.pendapatan * 0.1 })) : [])`
);

code = code.replace(
  /DUMMY_PIUTANG_TREND/g,
  `(dbData.piutang.length ? dbData.piutang.map(t => ({ tanggal: t.date, totalPiutang: t.piutangBaru, pelunasanPiutang: 0, piutangBaru: t.piutangBaru })) : [])`
);

code = code.replace(
  /DUMMY_BILLING_RECORDS/g,
  `(dbData.records.length ? dbData.records.map(r => ({ id: r.id, patientName: r.patient_name || '', paymentDate: new Date(r.created_at).toISOString().split('T')[0], totalAmount: r.total_tagihan, paymentMethod: r.metode_pembayaran || 'Cash', status: r.status, serviceType: r.jenis_layanan || 'Umum', examinationId: r.pemeriksaan_id })) : [])`
);

code = code.replace(
  /DUMMY_PAYMENT_TYPES/g,
  `dbData.paymentTypes`
);

code = code.replace(
  /DUMMY_PAYMENT_STATUS/g,
  `dbData.paymentStatus`
);

code = code.replace(
  /import React, \{ useState, useMemo \} from "react";/,
  `import React, { useState, useMemo, useEffect } from "react";`
);

fs.writeFileSync(filePath, code);
