export interface KbTier {
  tier: number;
  durationDays: number;
}

export interface KbMasterData {
  id: string;
  name: string;
  tiers: KbTier[];
  created_at?: string;
  updated_at?: string;
}

export interface MasterKbItem {
  id: string;
  nama_layanan: string;
  kategori: string;
  harga: number;
  status: 'aktif' | 'nonaktif';
  created_at?: string;
  updated_at?: string;
}
