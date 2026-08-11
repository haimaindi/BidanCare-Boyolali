export interface Patient {
  id: string;
  noRm: string;
  nik: string;
  kk?: string;
  noBpjs?: string;
  panggilan?: string;
  nama: string;
  provinsiLahir?: string;
  tempatLahir?: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  golDarah?: string;
  pekerjaan?: string;
  noWhatsapp?: string;
  noHp?: string; // Legacy field if needed, but we'll use noWhatsapp
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
  alamat?: string;
  puskesmas?: string;
  namaSuamiIstri?: string;
  nikSuami?: string;
  noTelpSuami?: string;
  namaOrangTua?: string;
  nikOrangTua?: string;
  noTelpOrangTua?: string;
  catatanKhusus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisitLog {
  id: string;
  patientId: string; // Linked by internal ID
  tanggalKunjungan: string;
  keluhan: string;
  diagnosa: string;
  layanan: string; // Poli Umum, KIA, etc
  petugas: string;
}
