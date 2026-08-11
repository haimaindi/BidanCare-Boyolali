const fs = require('fs');
const filePath = 'src/modules/laporan/components/LaporanObatBhpView.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

code = code.replace(
  /import \{ DUMMY_STOK_OBAT_MIRROR, DUMMY_STOK_BHP_MIRROR \} from "\.\.\/data\/dummy";/,
  `import { fetchLaporanObatBhp } from "../../../logic/services/laporanService";`
);

code = code.replace(
  /export function LaporanObatBhpView\(\) \{/,
  `export function LaporanObatBhpView() {\n  const [dbData, setDbData] = useState<{trend:any[], margin:any[], records:any[]}>({trend:[], margin:[], records:[]});\n  useEffect(() => {\n    fetchLaporanObatBhp(dateFilter.startDate, dateFilter.endDate).then(setDbData);\n  }, [dateFilter]);\n`
);

// We replace DUMMY_STOK_OBAT_MIRROR and DUMMY_STOK_BHP_MIRROR
code = code.replace(
  /DUMMY_STOK_OBAT_MIRROR/g,
  `(dbData.records.length ? dbData.records.map((r, i) => ({ id: r.id || String(i), sku: r.sku || "SKU", itemName: r.master_obat?.nama || "Obat", category: "Obat", unit: "Pcs", stokAwal: 0, trxMasuk: r.tipe === "Masuk" ? r.jumlah : 0, trxKeluar: r.tipe === "Keluar" ? r.jumlah : 0, sisaQty: r.tipe === "Masuk" ? r.jumlah : -r.jumlah, nilaiAset: 0 })) : [])`
);

code = code.replace(
  /DUMMY_STOK_BHP_MIRROR/g,
  `[]` // Just empty for now to satisfy TS if no BHP records
);

code = code.replace(
  /import React, \{ useState, useMemo \} from "react";/,
  `import React, { useState, useMemo, useEffect } from "react";`
);

fs.writeFileSync(filePath, code);
