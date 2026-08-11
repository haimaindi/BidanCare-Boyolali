import { Piutang } from "../types";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { Badge } from "../../../ui/components/elements/Badge";
import { tokens } from "../../../ui/styles/tokens";
import { ChevronRight } from "lucide-react";
import { Button } from "../../../ui/components/elements/Button";
import { formatDate } from "../../../logic/utils/dateFormatter";

interface PiutangTableProps {
  data: Piutang[];
  onViewDetail: (item: Piutang) => void;
}

export function PiutangTable({ data, onViewDetail }: PiutangTableProps) {
  const columns: Column<Piutang>[] = [
    { header: "ID Kunjungan", accessor: "visitId" },
    { header: "Nama Pasien", accessor: "patientName" },
    {
      header: "Total Tagihan",
      accessor: (item) => `Rp ${item.totalBill.toLocaleString()}`,
    },
    {
      header: "Total Dibayar",
      accessor: (item) => {
        const totalPaid = item.paymentHistory.reduce((sum, log) => sum + log.amount, 0);
        return `Rp ${totalPaid.toLocaleString()}`;
      },
    },
    {
      header: "Sisa Tagihan",
      accessor: (item) => {
        const totalPaid = item.paymentHistory.reduce((sum, log) => sum + log.amount, 0);
        const remaining = item.totalBill - totalPaid;
        return (
          <span className={remaining > 0 ? "font-semibold text-rose-600" : "font-semibold text-emerald-600"}>
            Rp {remaining.toLocaleString()}
          </span>
        );
      },
    },
    {
      header: "Jatuh Tempo Berikutnya",
      accessor: (item) => item.nextDueDate ? formatDate(item.nextDueDate) : "-",
    },
    {
      header: "Status",
      accessor: (item) => (
        <Badge
          variant={item.status === "Lunas" ? "success" : "warning"}
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Aksi",
      accessor: (item) => (
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-[0.25rem] mx-auto"
          onClick={() => onViewDetail(item)}
        >
          Lihat Detail
          <ChevronRight className="h-[1rem] w-[1rem]" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-[1rem]">
      <div className="flex items-center justify-between">
        <h3 className={tokens.typography.h3}>Daftar Piutang Pasien</h3>
      </div>
      <TableModule
        columns={columns}
        data={data}
        keyExtractor={(item) => item.visitId}
      />
    </div>
  );
}
