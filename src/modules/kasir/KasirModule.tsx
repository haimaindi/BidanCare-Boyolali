import { useState } from "react";
import { Card } from "../../ui/components/common/Card";
import { PopUpModal } from "../../ui/components/common/PopUpModal";
import { TagihanPembayaranTable } from "./components/TagihanPembayaranTable";
import { PiutangTable } from "./components/PiutangTable";
import { PaymentForm } from "./components/PaymentForm";
import { InvoicePrint } from "./components/InvoicePrint";
import { PiutangDetailView } from "./components/PiutangDetailView";
import { Billing, Piutang } from "./types";
import { tokens } from "../../ui/styles/tokens";
import { Receipt, Wallet, Printer } from "lucide-react";
import { cn } from "../../logic/utils/cn";
import { Button } from "../../ui/components/elements/Button";
import { useKasir } from "../../logic/hooks/useKasir.js";

export function KasirModule() {
  const [activeTab, setActiveTab] = useState<"tagihan" | "piutang">("tagihan");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [showPiutangDetail, setShowPiutangDetail] = useState(false);
  
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [selectedPiutang, setSelectedPiutang] = useState<Piutang | null>(null);

  const { billings, piutangData, loading, handleSavePayment, handleUpdatePiutang } = useKasir();

  const handleProcessPayment = (billing: Billing) => {
    setSelectedBilling(billing);
    setIsPaymentModalOpen(true);
  };

  const handlePrintInvoice = (billing: Billing) => {
    setSelectedBilling(billing);
    setIsPrintModalOpen(true);
  };

  const handleViewDetail = (piutang: Piutang) => {
    setSelectedPiutang(piutang);
    setShowPiutangDetail(true);
  };

  const onSavePaymentWrapper = async (paymentData: any) => {
    try {
      await handleSavePayment(paymentData);
      setIsPaymentModalOpen(false);
      alert("Pembayaran berhasil disimpan!");
    } catch (err) {
      console.error("Gagal memproses pembayaran:", err);
      alert("Terjadi kesalahan saat memproses pembayaran.");
    }
  };

  const onUpdatePiutangWrapper = async (updatedPiutang: Piutang) => {
    try {
      await handleUpdatePiutang(updatedPiutang);
      setSelectedPiutang(updatedPiutang);
    } catch (err) {
      console.error("Gagal update piutang:", err);
    }
  };

  if (activeTab === "piutang" && showPiutangDetail && selectedPiutang) {
    return (
      <PiutangDetailView 
        piutang={selectedPiutang}
        onBack={() => setShowPiutangDetail(false)}
        onUpdatePiutang={onUpdatePiutangWrapper}
      />
    );
  }

  return (
    <div className="space-y-[1.5rem]">
      {/* Header Section */}
      <div className="flex flex-col gap-[0.5rem]">
        <h2 className={tokens.typography.h2}>Modul Kasir</h2>
        <p className={tokens.colors.text.muted}>Kelola tagihan, pembayaran, dan piutang pasien.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("tagihan");
            setShowPiutangDetail(false);
          }}
          className={cn(
            "flex items-center gap-[0.5rem] px-[1.5rem] py-[1rem] text-sm font-medium transition-all border-b-2",
            activeTab === "tagihan"
              ? "border-purple-600 text-purple-600 bg-purple-50/30"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          )}
        >
          <Receipt className="h-[1.25rem] w-[1.25rem]" />
          Tagihan & Pembayaran
        </button>
        <button
          onClick={() => {
            setActiveTab("piutang");
          }}
          className={cn(
            "flex items-center gap-[0.5rem] px-[1.5rem] py-[1rem] text-sm font-medium transition-all border-b-2",
            activeTab === "piutang"
              ? "border-purple-600 text-purple-600 bg-purple-50/30"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          )}
        >
          <Wallet className="h-[1.25rem] w-[1.25rem]" />
          Piutang
        </button>
      </div>

      {/* Content */}
      <Card className="p-0 overflow-hidden">
        <div className="p-[1.5rem]">
          {activeTab === "tagihan" ? (
            <TagihanPembayaranTable 
              data={billings} 
              onProcessPayment={handleProcessPayment}
              onPrintInvoice={handlePrintInvoice}
            />
          ) : (
            <PiutangTable 
              data={piutangData} 
              onViewDetail={handleViewDetail}
            />
          )}
        </div>
      </Card>

      {/* Payment Modal */}
      <PopUpModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Proses Pembayaran"
        maxWidth="max-w-4xl"
      >
        {selectedBilling && (
          <PaymentForm 
            billing={selectedBilling} 
            onSave={onSavePaymentWrapper}
            onCancel={() => setIsPaymentModalOpen(false)}
          />
        )}
      </PopUpModal>

      {/* Print Modal */}
      <PopUpModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Pratinjau Invoice"
        maxWidth="max-w-5xl"
      >
        {selectedBilling && (
          <div className="space-y-[1.5rem]">
            <div className="bg-gray-100 p-[1rem] rounded-lg overflow-auto max-h-[60vh]">
              <InvoicePrint billing={selectedBilling} />
            </div>
            <div className="flex justify-end gap-[1rem]">
              <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
                Tutup
              </Button>
              <Button 
                variant="primary" 
                className="flex items-center gap-[0.5rem]"
                onClick={() => window.print()}
              >
                <Printer className="h-[1.25rem] w-[1.25rem]" />
                Cetak Sekarang
              </Button>
            </div>
          </div>
        )}
      </PopUpModal>
    </div>
  );
}
