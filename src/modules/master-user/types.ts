export type UserPermission = 
  | "Master Data"
  | "Cashier"
  | "Report"
  | "Pendaftaran"
  | "Pemeriksaan"
  | "Farmasi"
  | "Dokumen";

export interface User {
  id: string;
  nama: string;
  jenisUser: string;
  str?: string;
  sip?: string;
  noWhatsapp: string;
  accessId: string;
  accessPassword?: string;
  permissions: UserPermission[];
  createdAt: string;
  updated_at?: string;
}
