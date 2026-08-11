const fs = require('fs');

// LaporanKeuanganView.tsx
let f1 = 'src/modules/laporan/components/LaporanKeuanganView.tsx';
let c1 = fs.readFileSync(f1, 'utf-8');
c1 = c1.replace(
`  const [dbData, setDbData] = useState<{trend:any[], piutang:any[], paymentTypes:any[], paymentStatus:any[], records:any[]}>({trend:[], piutang:[], paymentTypes:[], paymentStatus:[], records:[]});
  useEffect(() => {
    fetchLaporanKeuangan(dateFilter.startDate, dateFilter.endDate).then(setDbData);
  }, [dateFilter]);\n`, ''
);
c1 = c1.replace(
`  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({
    startDate: "2026-08-01",
    endDate: "2026-08-10",
  });`,
`  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({
    startDate: "2026-08-01",
    endDate: "2026-08-10",
  });

  const [dbData, setDbData] = useState<{trend:any[], piutang:any[], paymentTypes:any[], paymentStatus:any[], records:any[]}>({trend:[], piutang:[], paymentTypes:[], paymentStatus:[], records:[]});
  useEffect(() => {
    fetchLaporanKeuangan(dateFilter.startDate, dateFilter.endDate).then(setDbData);
  }, [dateFilter]);
`
);
fs.writeFileSync(f1, c1);


// LaporanPasienView.tsx
let f2 = 'src/modules/laporan/components/LaporanPasienView.tsx';
let c2 = fs.readFileSync(f2, 'utf-8');
c2 = c2.replace(
`  const [dbData, setDbData] = useState<{trend:any[], demografi:any[], poli:any[], records:any[]}>({trend:[], demografi:[], poli:[], records:[]});
  useEffect(() => {
    fetchLaporanPasien(dateFilter.startDate, dateFilter.endDate).then(setDbData);
  }, [dateFilter]);\n`, ''
);
c2 = c2.replace(
`  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({
    startDate: "2026-08-01",
    endDate: "2026-08-10",
  });`,
`  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({
    startDate: "2026-08-01",
    endDate: "2026-08-10",
  });

  const [dbData, setDbData] = useState<{trend:any[], demografi:any[], poli:any[], records:any[]}>({trend:[], demografi:[], poli:[], records:[]});
  useEffect(() => {
    fetchLaporanPasien(dateFilter.startDate, dateFilter.endDate).then(setDbData);
  }, [dateFilter]);
`
);
fs.writeFileSync(f2, c2);


// LaporanObatBhpView.tsx
let f3 = 'src/modules/laporan/components/LaporanObatBhpView.tsx';
let c3 = fs.readFileSync(f3, 'utf-8');
c3 = c3.replace(
`  const [dbData, setDbData] = useState<{trend:any[], margin:any[], records:any[]}>({trend:[], margin:[], records:[]});
  useEffect(() => {
    fetchLaporanObatBhp(dateFilter.startDate, dateFilter.endDate).then(setDbData);
  }, [dateFilter]);`,
`  const [dateFilter] = useState({
    startDate: "2026-08-01",
    endDate: "2026-08-31",
  });
  const [dbData, setDbData] = useState<{trend:any[], margin:any[], records:any[]}>({trend:[], margin:[], records:[]});
  useEffect(() => {
    fetchLaporanObatBhp(dateFilter.startDate, dateFilter.endDate).then(setDbData);
  }, [dateFilter]);`
);
fs.writeFileSync(f3, c3);

