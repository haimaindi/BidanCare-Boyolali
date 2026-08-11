import { User } from "../types";

export const dummyUsers: User[] = [
  {
    id: "1",
    nama: "dr. Andi Wijaya",
    jenisUser: "dokter",
    str: "STR-123456",
    sip: "SIP-789012",
    noWhatsapp: "081 234 567 890",
    accessId: "andi.wijaya",
    permissions: ["Master Data", "Pendaftaran", "Pemeriksaan"],
    createdAt: "2024-01-01T10:00:00Z"
  },
  {
    id: "2",
    nama: "Siti Aminah, S.Kep",
    jenisUser: "perawat",
    noWhatsapp: "082 345 678 901",
    accessId: "siti.aminah",
    permissions: ["Pendaftaran", "Pemeriksaan"],
    createdAt: "2024-01-02T11:30:00Z"
  },
  {
    id: "3",
    nama: "Budi Santoso, Apt",
    jenisUser: "farmasi",
    noWhatsapp: "083 456 789 012",
    accessId: "budi.farmasi",
    permissions: ["Farmasi"],
    createdAt: "2024-01-03T09:15:00Z"
  }
];
