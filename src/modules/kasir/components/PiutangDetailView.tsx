import { useState } from "react";
import { Piutang, PaymentLog, PaymentType } from "../types";
import { TableModule, Column } from "../../../ui/components/common/TableModule";
import { Button } from "../../../ui/components/elements/Button";
import { Badge } from "../../../ui/components/elements/Badge";
import { tokens } from "../../../ui/styles/tokens";
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { PopUpModal } from "../../../ui/components/common/PopUpModal";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { PriceInput } from "../../../ui/components/elements/PriceInput";
import { Input } from "../../../ui/components/elements/Input";
import { formatDate } from "../../../logic/utils/dateFormatter";
import { cn } from "../../../logic/utils/cn";

interface PiutangDetailViewProps {
  piutang: Piutang;
  onBack: () => void;
  onUpdatePiutang: (updatedPiutang: Piutang) => void;
}

export function PiutangDetailView({ piutang, onBack, onUpdatePiutang }: PiutangDetailViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<PaymentLog | null>(null);
  
  // Form State
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<PaymentType>("Cash");
  const [nextDueDate, setNextDueDate] = useState("");

  const totalPaid = piutang.paymentHistory.reduce((sum, log) => sum + log.amount, 0);
  const remaining = piutang.totalBill - totalPaid;

  const handleOpenAddModal = () => {
    setEditingLog(null);
    setAmount(remaining);
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentType("Cash");
    setNextDueDate("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (log: PaymentLog) => {
    setEditingLog(log);
    setAmount(log.amount);
    setDate(log.date.split('T')[0]);
    setPaymentType(log.paymentType);
    setNextDueDate(log.nextDueDate || "");
    setIsModalOpen(true);
  };

  const handleDeleteLog = (logId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus log pembayaran ini?")) {
      const updatedHistory = piutang.paymentHistory.filter(log => log.id !== logId);
      const newTotalPaid = updatedHistory.reduce((sum, log) => sum + log.amount, 0);
      onUpdatePiutang({
        ...piutang,
        paymentHistory: updatedHistory,
        status: newTotalPaid >= piutang.totalBill ? "Lunas" : "Belum Lunas",
        nextDueDate: updatedHistory[updatedHistory.length - 1]?.nextDueDate || piutang.nextDueDate
      });
    }
  };

  const handleSavePayment = () => {
    let updatedHistory;
    if (editingLog) {
      updatedHistory = piutang.paymentHistory.map(log => 
        log.id === editingLog.id 
          ? { ...log, amount, date, paymentType, nextDueDate } 
          : log
      );
    } else {
      const newLog: PaymentLog = {
        id: `LOG-${Math.random().toString(36).substr(2, 9)}`,
        amount,
        date,
        paymentType,
        nextDueDate
      };
      updatedHistory = [...piutang.paymentHistory, newLog];
    }

    const newTotalPaid = updatedHistory.reduce((sum, log) => sum + log.amount, 0);
    onUpdatePiutang({
      ...piutang,
      paymentHistory: updatedHistory,
      status: newTotalPaid >= piutang.totalBill ? "Lunas" : "Belum Lunas",
      nextDueDate: nextDueDate || piutang.nextDueDate
    });
    
    setIsModalOpen(false);
  };

  const columns: Column<PaymentLog>[] = [
    { 
      header: "Tanggal", 
      accessor: (item) => formatDate(item.date) 
    },
    { 
      header: "Nominal", 
      accessor: (item) => `Rp ${item.amount.toLocaleString()}` 
    },
    { header: "Jenis", accessor: "paymentType" },
    { 
      header: "Jatuh Tempo Berikutnya", 
      accessor: (item) => item.nextDueDate ? formatDate(item.nextDueDate) : "-" 
    },
    {
      header: "Aksi",
      accessor: (item) => (
        <div className="flex items-center justify-center gap-[0.5rem]">
          <button 
            onClick={() => handleOpenEditModal(item)}
            className="p-[0.4rem] text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit2 className="h-[1rem] w-[1rem]" />
          </button>
          <button 
            onClick={() => handleDeleteLog(item.id)}
            className="p-[0.4rem] text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <Trash2 className="h-[1rem] w-[1rem]" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-[1.5rem] animate-in fade-in duration-300">
      <div className="flex items-center gap-[1rem]">
        <button 
          onClick={onBack}
          className="p-[0.5rem] hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-[1.25rem] w-[1.25rem]" />
        </button>
        <div>
          <h2 className={tokens.typography.h2}>Detail Piutang</h2>
          <p className="text-sm text-gray-500">ID Kunjungan: {piutang.visitId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1rem]">
        <div className="p-[1.25rem] bg-white border border-gray-200 rounded-xl space-y-[0.5rem]">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pasien</p>
          <p className="text-xl font-bold text-gray-800">{piutang.patientName}</p>
        </div>
        <div className="p-[1.25rem] bg-purple-50 border border-purple-100 rounded-xl space-y-[0.5rem]">
          <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Total Tagihan</p>
          <p className="text-xl font-bold text-purple-700">Rp {piutang.totalBill.toLocaleString()}</p>
        </div>
        <div className="p-[1.25rem] bg-rose-50 border border-rose-100 rounded-xl space-y-[0.5rem]">
          <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">Sisa Tagihan</p>
          <p className="text-xl font-bold text-rose-700">Rp {remaining.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-[1.25rem] border border-gray-200 rounded-xl">
        <div className="flex items-center gap-[2rem]">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-[0.25rem]">Status</p>
            <Badge variant={piutang.status === "Lunas" ? "success" : "warning"}>{piutang.status}</Badge>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-[0.25rem]">Jatuh Tempo Berikutnya</p>
            <p className="font-semibold text-gray-700">{piutang.nextDueDate ? formatDate(piutang.nextDueDate) : "-"}</p>
          </div>
        </div>
        <Button 
          variant="primary" 
          className="flex items-center gap-[0.5rem]"
          onClick={handleOpenAddModal}
        >
          <Plus className="h-[1.25rem] w-[1.25rem]" />
          Tambah Pembayaran Cicilan
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-[1.5rem] py-[1rem] border-b border-gray-200 bg-gray-50/50">
          <h3 className="font-bold text-gray-700">Log Riwayat Pembayaran</h3>
        </div>
        <div className="p-[1rem]">
          <TableModule<PaymentLog>
            columns={columns}
            data={piutang.paymentHistory}
            keyExtractor={(item) => item.id}
          />
        </div>
      </div>

      <PopUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLog ? "Edit Pembayaran" : "Tambah Pembayaran Cicilan"}
        maxWidth="max-w-md"
      >
        <div className="space-y-[1.25rem] p-[0.5rem]">
          <FormGroup id="amount" label="Nominal Pembayaran">
            <PriceInput
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </FormGroup>

          <FormGroup id="date" label="Tanggal Pembayaran">
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup id="paymentType" label="Jenis Pembayaran">
            <div className="flex gap-[0.5rem]">
              {(["Cash", "Transfer", "QRIS"] as PaymentType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPaymentType(type)}
                  className={cn(
                    "flex-1 py-[0.6rem] px-[0.5rem] rounded-lg border-2 text-sm font-medium transition-all",
                    paymentType === type
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  )}
                >
                  {type === "Cash" ? "Tunai" : type}
                </button>
              ))}
            </div>
          </FormGroup>

          <FormGroup id="nextDueDate" label="Tanggal Jatuh Tempo Berikutnya">
            <Input
              id="nextDueDate"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              placeholder="Kosongkan jika lunas"
            />
          </FormGroup>

          <div className="flex justify-end gap-[0.75rem] pt-[1rem]">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSavePayment}>
              {editingLog ? "Simpan Perubahan" : "Simpan Pembayaran"}
            </Button>
          </div>
        </div>
      </PopUpModal>
    </div>
  );
}
