import { Billing, Piutang } from "../types";

export const dummyBillings: Billing[] = [
  {
    id: "BILL-001",
    visitId: "VST-001",
    patientName: "Budi Santoso",
    serviceType: "Umum",
    baseServiceFee: 50000,
    medicinePrice: 125000,
    bhpPrice: 15000,
    otherServicePrice: 0,
    totalBill: 190000,
    status: "Belum Lunas",
    createdAt: "2023-10-25T08:30:00Z",
  },
  {
    id: "BILL-002",
    visitId: "VST-002",
    patientName: "Siti Aminah",
    serviceType: "AnteNatal (Kehamilan) - USG 2D",
    baseServiceFee: 50000,
    medicinePrice: 75000,
    bhpPrice: 10000,
    otherServicePrice: 20000,
    totalBill: 155000,
    status: "Belum Lunas",
    createdAt: "2023-10-25T09:15:00Z",
  },
];

export const dummyPiutang: Piutang[] = [
  {
    visitId: "VST-001",
    patientName: "Budi Santoso",
    totalBill: 190000,
    paymentHistory: [
      {
        id: "LOG-001",
        amount: 50000,
        date: "2023-10-25T10:00:00Z",
        paymentType: "Cash",
        nextDueDate: "2023-11-01",
      },
    ],
    nextDueDate: "2023-11-01",
    status: "Belum Lunas",
  },
  {
    visitId: "VST-003",
    patientName: "Rudi Hermawan",
    totalBill: 250000,
    paymentHistory: [
      {
        id: "LOG-002",
        amount: 100000,
        date: "2023-10-20T14:00:00Z",
        paymentType: "Transfer",
        nextDueDate: "2023-10-27",
      },
      {
        id: "LOG-003",
        amount: 50000,
        date: "2023-10-27T11:00:00Z",
        paymentType: "Cash",
        nextDueDate: "2023-11-03",
      },
    ],
    nextDueDate: "2023-11-03",
    status: "Belum Lunas",
  },
];
