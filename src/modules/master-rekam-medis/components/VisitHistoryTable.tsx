import { VisitLog } from "../types";
import { TableModule } from "../../../ui/components/common/TableModule";

interface VisitHistoryTableProps {
  logs: VisitLog[];
}

export function VisitHistoryTable({ logs }: VisitHistoryTableProps) {
  const columns = [
    { header: "Tanggal", accessor: "tanggalKunjungan" as keyof VisitLog },
    { header: "Layanan", accessor: "layanan" as keyof VisitLog },
    { header: "Keluhan", accessor: "keluhan" as keyof VisitLog },
    { header: "Diagnosa", accessor: "diagnosa" as keyof VisitLog },
    { header: "Petugas", accessor: "petugas" as keyof VisitLog },
  ];

  return (
    <div className="space-y-[1rem]">
      <h3 className="text-lg font-medium">Riwayat Kunjungan</h3>
      <TableModule columns={columns} data={logs} keyExtractor={(l) => l.id} />
    </div>
  );
}
