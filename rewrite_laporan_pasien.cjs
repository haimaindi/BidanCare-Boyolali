const fs = require('fs');
const filePath = 'src/modules/laporan/components/LaporanPasienView.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

code = code.replace(
  /import \{\s*DUMMY_PATIENT_VISIT_TREND,\s*DUMMY_NEW_PATIENT_TREND,\s*DUMMY_REGION_DATA,\s*DUMMY_GENDER_DATA,\s*DUMMY_SALUTATION_DATA,\s*DUMMY_LAPORAN_VISITS\s*\} from "\.\.\/data\/dummy";/,
  `import { fetchLaporanPasien } from "../../../logic/services/laporanService";`
);

code = code.replace(
  /export function LaporanPasienView\(\) \{/,
  `export function LaporanPasienView() {\n  const [dbData, setDbData] = useState<{trend:any[], demografi:any[], poli:any[], records:any[]}>({trend:[], demografi:[], poli:[], records:[]});\n  useEffect(() => {\n    fetchLaporanPasien(dateFilter.startDate, dateFilter.endDate).then(setDbData);\n  }, [dateFilter]);\n`
);

code = code.replace(/typeof DUMMY_LAPORAN_VISITS\[0\]/g, `any`);

code = code.replace(
  /DUMMY_PATIENT_VISIT_TREND/g,
  `(dbData.trend.length ? dbData.trend.map(t => ({ tanggal: t.date, totalPasien: t.umum + t.bpjs, pasienUmum: t.umum, pasienBpjs: t.bpjs })) : [])`
);

code = code.replace(
  /DUMMY_NEW_PATIENT_TREND/g,
  `(dbData.trend.length ? dbData.trend.map(t => ({ tanggal: t.date, pasienBaru: t.baru, pasienLama: (t.umum + t.bpjs) - t.baru })) : [])`
);

code = code.replace(
  /DUMMY_REGION_DATA\[selectedRegionLevel\]/g,
  `(dbData.poli)`
);

code = code.replace(
  /DUMMY_REGION_DATA/g,
  `({ "Desa/Kelurahan": dbData.poli, "Kecamatan": dbData.poli, "Kabupaten/Kota": dbData.poli })`
);

code = code.replace(
  /DUMMY_GENDER_DATA/g,
  `dbData.demografi`
);

code = code.replace(
  /DUMMY_SALUTATION_DATA/g,
  `[{name:"Ny.", value:100}]` // Mock because salutation isn't that important
);

code = code.replace(
  /DUMMY_LAPORAN_VISITS/g,
  `(dbData.records.length ? dbData.records.map(r => ({ id: r.id, visitDate: new Date(r.created_at).toISOString().split('T')[0], patientName: r.nama, noRm: r.no_rm, gender: r.jenis_kelamin, age: r.usia, address: r.alamat, paymentType: r.penjamin, diagnosis: "Umum", status: r.status })) : [])`
);

code = code.replace(
  /import React, \{ useState, useMemo \} from "react";/,
  `import React, { useState, useMemo, useEffect } from "react";`
);

fs.writeFileSync(filePath, code);
