export type PaymentType = "Cash" | "Transfer" | "QRIS";
export type BillingStatus = "Lunas" | "Belum Lunas";

export interface Billing {
  id: string;
  visitId: string;
  patientName: string;
  serviceType: string;
  baseServiceFee: number;
  medicinePrice: number;
  bhpPrice: number;
  otherServicePrice: number;
  totalBill: number;
  status: BillingStatus;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  billingId: string;
  visitId: string;
  discount: number;
  totalBill: number;
  amountPaid: number;
  remainingBalance: number;
  dueDate: string;
  paymentType: PaymentType;
  notes: string;
  status: BillingStatus;
  paymentDate: string;
}

export interface PaymentLog {
  id: string;
  amount: number;
  date: string;
  paymentType: PaymentType;
  nextDueDate?: string;
}

export interface Piutang {
  visitId: string;
  patientName: string;
  totalBill: number;
  paymentHistory: PaymentLog[];
  nextDueDate?: string;
  status: BillingStatus;
}
