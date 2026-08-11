import { useState, useEffect } from "react";
import { Card } from "../../ui/components/common/Card";
import { TableModule, Column } from "../../ui/components/common/TableModule";
import { Button } from "../../ui/components/elements/Button";
import { FollowUpItem } from "./types";
import { tokens } from "../../ui/styles/tokens";
import { Download, MessageSquare, Filter, Calendar } from "lucide-react";
import { Badge } from "../../ui/components/elements/Badge";
import { cn } from "../../logic/utils/cn";
import { fetchFollowUpList } from "../../logic/services/followUpService";
import * as XLSX from 'xlsx';

export function FollowUpModule() {
  const [data, setData] = useState<FollowUpItem[]>([]);
  const [currentDate] = useState(() => {
    const d = new Date();
    return `${("0" + d.getDate()).slice(-2)}-${("0" + (d.getMonth() + 1)).slice(-2)}-${d.getFullYear()}`;
  });

  useEffect(() => {
    fetchFollowUpList().then(setData);
  }, []);

  const handleDownloadExcel = () => {
    if (data.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }
    const exportData = data.map(item => ({
      "No. Whatsapp": item.whatsapp,
      "Jenis Panggilan": item.panggilanType,
      "Nama Pasien": item.patientName,
      "Jenis Kunjungan": item.visitType,
      "Template Pesan": item.templateMessage
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FollowUp");
    XLSX.writeFile(workbook, `FollowUp_Reminder_${currentDate}.xlsx`);
  };

  const columns: Column<FollowUpItem>[] = [
    { header: "No. Whatsapp", accessor: "whatsapp", className: "font-mono" },
    { 
      header: "Jenis Panggilan", 
      accessor: (item) => (
        <Badge variant={item.panggilanType === "Follow Up" ? "primary" : "warning"}>
          {item.panggilanType}
        </Badge>
      ) 
    },
    { header: "Nama Pasien", accessor: "patientName", className: "font-semibold" },
    { header: "Jenis Kunjungan", accessor: "visitType" },
    { 
      header: "Template Pesan", 
      accessor: (item) => (
        <p className="text-sm text-gray-500 line-clamp-2 max-w-[400px] leading-relaxed">
          {item.templateMessage}
        </p>
      ) 
    }
  ];

  return (
    <div className="space-y-[1.5rem]">
      <div className="flex flex-col gap-[0.5rem]">
        <h2 className={tokens.typography.h2}>Follow Up & Reminder</h2>
        <p className={tokens.colors.text.muted}>Daftar pasien yang perlu dihubungi hari ini berdasarkan jadwal master broadcast.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-[1rem]">
        <Card className="p-[1rem] flex flex-col items-center justify-center bg-purple-50 border-purple-100">
          <Calendar className="h-[2rem] w-[2rem] text-purple-600 mb-[0.5rem]" />
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">Tanggal Hari Ini</p>
          <p className="text-xl font-black text-purple-700">{currentDate}</p>
        </Card>
        
        <div className="md:col-span-3 flex items-end justify-between bg-white p-[1.25rem] rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-[1.5rem]">
            <div className="text-center">
              <p className="text-[0.625rem] font-bold text-gray-400 uppercase mb-[0.25rem]">Total Broadcast</p>
              <p className="text-2xl font-black text-gray-800">{data.length}</p>
            </div>
            <div className="h-[2rem] w-[1px] bg-gray-100"></div>
            <div className="text-center">
              <p className="text-[0.625rem] font-bold text-blue-400 uppercase mb-[0.25rem]">Follow Up</p>
              <p className="text-2xl font-black text-blue-600">{data.filter(i => i.panggilanType === "Follow Up").length}</p>
            </div>
            <div className="h-[2rem] w-[1px] bg-gray-100"></div>
            <div className="text-center">
              <p className="text-[0.625rem] font-bold text-amber-400 uppercase mb-[0.25rem]">Reminder</p>
              <p className="text-2xl font-black text-amber-600">{data.filter(i => i.panggilanType === "Reminder").length}</p>
            </div>
          </div>

          <div className="flex gap-[0.75rem]">
            <Button 
              variant="primary" 
              className="flex items-center gap-[0.5rem] bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
              onClick={handleDownloadExcel}
            >
              <Download className="h-[1.25rem] w-[1.25rem]" />
              Download Excel (KirimPesan)
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-neutral-100 shadow-sm">
        <TableModule
          columns={columns}
          data={data}
          keyExtractor={(item) => item.id}
          emptyMessage="Tidak ada daftar follow up untuk hari ini."
        />
      </Card>

      <div className="p-[1.25rem] bg-blue-50 border border-blue-100 rounded-xl flex gap-[1rem] items-start">
        <div className="p-[0.5rem] bg-blue-100 rounded-lg">
          <MessageSquare className="h-[1.25rem] w-[1.25rem] text-blue-600" />
        </div>
        <div>
          <h4 className="font-bold text-blue-800 text-sm">Petunjuk Penggunaan</h4>
          <p className="text-xs text-blue-700 mt-[0.25rem] leading-relaxed">
            Daftar ini dihasilkan secara otomatis merujuk pada <b>Master Broadcast</b>. 
            Klik <b>Download Excel</b> untuk mengunduh data yang siap diimpor ke layanan <b>kirimpesan.net</b>. 
            Pastikan kolom template pesan sudah sesuai dengan kebutuhan broadcast Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
