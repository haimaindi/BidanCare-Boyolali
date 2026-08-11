import { BroadcastConfig, BroadcastTemplate } from "../types";

export const dummyBroadcastConfigs: BroadcastConfig[] = [
  { 
    id: "1", 
    category: "Umum", 
    followUpDays: 1, 
    reminderDays: null,
    followUpTemplate: "Halo {{A}}, bagaimana kabar Anda setelah kunjungan ke Puskesmas kemarin? Semoga lekas sembuh."
  },
  { 
    id: "2", 
    category: "KB", 
    followUpDays: 3, 
    reminderDays: 3,
    followUpTemplate: "Halo {{A}}, bagaimana kondisi Anda setelah pemasangan/kunjungan KB 3 hari yang lalu?",
    reminderTemplate: "Halo {{A}}, ini pengingat untuk jadwal kunjungan ulang KB Anda pada tanggal {{B}}. Harap datang tepat waktu."
  },
  { id: "3", category: "Imunisasi", followUpDays: 3, reminderDays: 3, followUpTemplate: "Halo {{A}}, bagaimana kondisi si kecil setelah imunisasi 3 hari yang lalu?" },
  { id: "4", category: "AnteNatal", followUpDays: 2, reminderDays: 3 },
  { id: "5", category: "Persalinan", followUpDays: 7, reminderDays: null },
  { id: "6", category: "Post Natal KF", followUpDays: 3, reminderDays: 3 },
  { id: "7", category: "Post Natal KN", followUpDays: 3, reminderDays: 3 },
  { id: "8", category: "Post Natal AKHIR NIFAS", followUpDays: 3, reminderDays: 3 },
  { id: "9", category: "Mom & Baby Care", followUpDays: 1, reminderDays: null },
];

export const dummyTemplates: BroadcastTemplate[] = [
  {
    id: "T1",
    name: "Follow Up Umum",
    type: "Follow Up",
    content: "Halo {{A}}, bagaimana kabar Anda setelah kunjungan ke Puskesmas kemarin? Semoga lekas sembuh.",
  },
  {
    id: "T2",
    name: "Reminder KB",
    type: "Reminder",
    content: "Halo {{A}}, ini pengingat untuk jadwal kunjungan ulang KB Anda pada tanggal {{B}}. Harap datang tepat waktu.",
  },
];
