import { FollowUpItem } from "../types";

export const dummyFollowUpList: FollowUpItem[] = [
  {
    id: "FU-001",
    whatsapp: "081234567890",
    panggilanType: "Follow Up",
    patientName: "Tn. Budi Santoso",
    visitType: "Imunisasi",
    templateMessage: "Halo Tn. Budi Santoso, bagaimana kabar Anda setelah kunjungan Imunisasi 3 hari yang lalu? Semoga sehat selalu.",
    status: "Pending",
  },
  {
    id: "FU-002",
    whatsapp: "089876543210",
    panggilanType: "Reminder",
    patientName: "Ny. Siti Aminah",
    visitType: "KB",
    templateMessage: "Halo Ny. Siti Aminah, ini pengingat untuk jadwal kunjungan ulang KB Anda 3 hari lagi pada tanggal 13-08-2026.",
    status: "Pending",
  },
  {
    id: "FU-003",
    whatsapp: "085544332211",
    panggilanType: "Follow Up",
    patientName: "Tn. Rudi Hermawan",
    visitType: "Umum",
    templateMessage: "Halo Tn. Rudi Hermawan, bagaimana kondisi kesehatan Anda hari ini? Kami ingin menanyakan kabar setelah kunjungan tempo hari.",
    status: "Pending",
  },
];
