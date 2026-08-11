import React, { useState } from "react";
import { Billing, PaymentType } from "../types";
import { tokens } from "../../../ui/styles/tokens";
import { Input } from "../../../ui/components/elements/Input";
import { PriceInput } from "../../../ui/components/elements/PriceInput";
import { Button } from "../../../ui/components/elements/Button";
import { Textarea } from "../../../ui/components/elements/Textarea";
import { FormGroup } from "../../../ui/components/common/FormGroup";
import { cn } from "../../../logic/utils/cn";
import { Wallet, CreditCard, Banknote } from "lucide-react";

interface PaymentFormProps {
  billing: Billing;
  onSave: (paymentData: any) => void;
  onCancel: () => void;
}

export function PaymentForm({ billing, onSave, onCancel }: PaymentFormProps) {
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(billing.totalBill);
  const [paymentType, setPaymentType] = useState<PaymentType>("Cash");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const totalAfterDiscount = billing.totalBill - discount;
  const remaining = totalAfterDiscount - amountPaid;
  const status = remaining <= 0 ? "Lunas" : "Belum Lunas";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      billingId: billing.id,
      visitId: billing.visitId,
      discount,
      totalBill: billing.totalBill,
      amountPaid,
      remainingBalance: Math.max(0, remaining),
      dueDate,
      paymentType,
      notes,
      status,
      paymentDate: new Date().toISOString(),
    });
  };

  const paymentTypes: { value: PaymentType; label: string; icon: any }[] = [
    { value: "Cash", label: "Tunai", icon: Banknote },
    { value: "Transfer", label: "Transfer", icon: CreditCard },
    { value: "QRIS", label: "QRIS", icon: Wallet },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-[1.5rem]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
        <div className="space-y-[1rem] p-[1rem] bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-[0.5rem]">Rincian Tagihan</h4>
          <div className="flex justify-between text-sm">
            <span>Biaya Dasar Layanan</span>
            <span>Rp {billing.baseServiceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Harga Obat</span>
            <span>Rp {billing.medicinePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Harga BHP</span>
            <span>Rp {billing.bhpPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Layanan Lain</span>
            <span>Rp {billing.otherServicePrice.toLocaleString()}</span>
          </div>
          <div className="border-t pt-[0.5rem] mt-[0.5rem] flex justify-between font-bold text-lg">
            <span>Total Tagihan</span>
            <span>Rp {billing.totalBill.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-[1.25rem]">
          <FormGroup id="discount" label="Diskon (Rp)">
            <PriceInput
              id="discount"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="0"
            />
          </FormGroup>

          <FormGroup id="amountPaid" label="Nominal Pembayaran (Rp)">
            <PriceInput
              id="amountPaid"
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              required
            />
          </FormGroup>

          <FormGroup id="paymentType" label="Jenis Pembayaran">
            <div className="flex gap-[0.5rem]">
              {paymentTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPaymentType(type.value)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-[0.75rem] px-[0.5rem] rounded-lg border-2 transition-all gap-[0.25rem]",
                    paymentType === type.value
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  )}
                >
                  <type.icon className={cn("h-[1.25rem] w-[1.25rem]", paymentType === type.value ? "text-purple-600" : "text-gray-400")} />
                  <span className="text-[0.75rem] font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </FormGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
        <FormGroup id="dueDate" label="Tanggal Jatuh Tempo">
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={status === "Lunas"}
          />
        </FormGroup>

        <FormGroup id="notes" label="Catatan">
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tambahkan catatan jika diperlukan..."
            rows={1}
          />
        </FormGroup>
      </div>

      <div className="p-[1rem] border-2 border-dashed border-purple-200 rounded-lg bg-purple-50 flex flex-col gap-[0.5rem]">
        <div className="flex justify-between font-medium">
          <span>Sisa Tagihan:</span>
          <span className={cn(remaining > 0 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold")}>
            Rp {Math.max(0, remaining).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Status:</span>
          <span className={cn(status === "Lunas" ? "text-emerald-600" : "text-amber-600")}>
            {status}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-[1rem] pt-[0.5rem]">
        <button
          type="button"
          onClick={onCancel}
          className="px-[1.5rem] py-[0.625rem] text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Batal
        </button>
        <Button type="submit" variant="primary" className="px-[2rem]">
          Simpan Pembayaran
        </Button>
      </div>
    </form>
  );
}
