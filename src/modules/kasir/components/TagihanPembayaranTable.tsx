import { Billing } from "../types";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { Button } from "../../../ui/components/elements/Button";
import { Badge } from "../../../ui/components/elements/Badge";
import { DollarSign, Printer } from "lucide-react";
import { tokens } from "../../../ui/styles/tokens";
import { formatDate } from "../../../logic/utils/dateFormatter";
import { cn } from "../../../logic/utils/cn";

interface TagihanPembayaranTableProps {
  data: Billing[];
  onProcessPayment: (billing: Billing) => void;
  onPrintInvoice: (billing: Billing) => void;
}

export function TagihanPembayaranTable({ data, onProcessPayment, onPrintInvoice }: TagihanPembayaranTableProps) {
  const getLayananBadgeClasses = (layanan: string) => {
    const l = layanan.toLowerCase();
    if (l.includes("antenatal")) return "bg-pink-100 text-pink-700";
    if (l.includes("post natal") || l.includes("postnatal")) return "bg-purple-100 text-purple-700";
    if (l.includes("umum")) return "bg-blue-100 text-blue-700";
    if (l.includes("kb")) return "bg-emerald-100 text-emerald-700";
    if (l.includes("imunisasi")) return "bg-amber-100 text-amber-700";
    if (l.includes("persalinan")) return "bg-rose-100 text-rose-700";
    return "bg-gray-100 text-gray-700";
  };

  const getLayananText = (layanan: string) => {
    const l = layanan.toLowerCase();
    if (l.includes("antenatal")) return "AnteNatal";
    if (l.includes("post natal") || l.includes("postnatal")) return "Post Natal";
    return layanan.split("-")[0].trim();
  };

  const getLayananSubText = (layanan: string) => {
    if (layanan.includes("-")) {
      return layanan.split("-")[1].trim();
    }
    return null;
  };

  const columns: Column<Billing>[] = [
    { header: "Tanggal", accessor: (item) => formatDate(item.createdAt) },
    { header: "ID Kunjungan", accessor: "visitId" },
    { header: "Nama Pasien", accessor: "patientName" },
    {
      header: "Jenis Layanan",
      accessor: (item) => {
        const subText = getLayananSubText(item.serviceType);
        return (
          <div className="flex flex-col gap-[0.25rem] items-center">
            <span className={cn(
              "inline-flex items-center justify-center rounded-full px-[0.625rem] py-[0.125rem] text-[0.75rem] font-bold uppercase tracking-tight w-fit",
              getLayananBadgeClasses(item.serviceType)
            )}>
              {getLayananText(item.serviceType)}
            </span>
            {subText && (
              <span className="text-[0.625rem] font-bold text-neutral-500 bg-neutral-50 px-[0.375rem] py-[0.0625rem] border border-neutral-100 rounded uppercase w-fit">
                {subText}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Total Tagihan",
      accessor: (item) => (
        <span className="font-bold text-purple-700">
          Rp {item.totalBill.toLocaleString()}
        </span>
      ),
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
        <div className="flex items-center justify-center gap-[0.5rem]">
          <Button
            size="sm"
            variant="primary"
            className="flex items-center gap-[0.25rem]"
            onClick={() => onProcessPayment(item)}
          >
            <DollarSign className="h-[1rem] w-[1rem]" />
            Bayar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-[0.25rem]"
            onClick={() => onPrintInvoice(item)}
          >
            <Printer className="h-[1rem] w-[1rem]" />
            Cetak
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-[1rem]">
      <div className="flex items-center justify-between">
        <h3 className={tokens.typography.h3}>Daftar Kunjungan Pasien</h3>
      </div>
      <TableModule
        columns={columns}
        data={data}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
