/**
 * Service Logic: Pemeriksaan Pasien (Medical Examinations across all modules)
 * Path: /src/logic/services/pemeriksaanService.ts
 * Supports full DB integration (Supabase), realtime subscription events,
 * and localStorage fallbacks for offline reliability.
 */

import { PemeriksaanData } from '../../modules/pemeriksaan/types.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';
import { realtimeService } from './realtimeService.js';

const STORAGE_KEY = 'pemeriksaan_pasien_items';

let cache: PemeriksaanData[] = [];

function initCache(): PemeriksaanData[] {
  if (cache.length > 0) {
    return cache;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        cache = JSON.parse(stored);
        return cache;
      }
    } catch {
      // Storage fallback
    }
  }

  cache = [];
  return cache;
}

function saveCache(data: PemeriksaanData[]): void {
  cache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage write error
    }
  }
}

function mapRowToData(row: any): PemeriksaanData {
  return {
    id: row.id,
    patientId: row.pendaftaran_id,
    subjektif: row.subjektif || { keluhan: "", riwAlergi: "", riwPenyakit: "", riwKeluarga: "" },
    objektifPrimary: row.objektif_primary || { beratBadan: "", tinggiBadan: "", tekananDarah: "", heartRate: "", suhu: "", respirationRate: "", spo2: "" },
    objektifFisik: row.objektif_fisik || { pxKepalaLeher: "", pxDada: "", pxAbdomen: "", pxEkstremitasAtas: "", pxEkstremitasBawah: "", pxGenitalUrinaria: "", pxFisikLain: "" },
    penunjang: row.penunjang || [],
    diagnosa: row.diagnosa || { utama: "", sekunder: "" },
    plan: row.plan || { terapiFarmakologi: [], layananLain: [] },
    bhp: row.bhp || [],
    kb: row.kb || undefined,
    imunisasi: row.imunisasi || undefined,
    anc: row.anc || undefined,
    persalinan: row.persalinan || undefined,
    pnc: row.pnc || undefined,
    momCare: row.mom_care || undefined,
    catatan: row.catatan || "",
    petugas: row.petugas || "",
    timestamp: row.created_at || new Date().toISOString()
  };
}

function mapDataToRow(data: Partial<PemeriksaanData>) {
  const row: Record<string, any> = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.patientId !== undefined) row.pendaftaran_id = data.patientId;
  if (data.subjektif !== undefined) row.subjektif = data.subjektif;
  if (data.objektifPrimary !== undefined) row.objektif_primary = data.objektifPrimary;
  if (data.objektifFisik !== undefined) row.objektif_fisik = data.objektifFisik;
  if (data.penunjang !== undefined) row.penunjang = data.penunjang;
  if (data.diagnosa !== undefined) row.diagnosa = data.diagnosa;
  if (data.plan !== undefined) row.plan = data.plan;
  if (data.bhp !== undefined) row.bhp = data.bhp;
  if (data.kb !== undefined) row.kb = data.kb;
  if (data.imunisasi !== undefined) row.imunisasi = data.imunisasi;
  if (data.anc !== undefined) row.anc = data.anc;
  if (data.persalinan !== undefined) row.persalinan = data.persalinan;
  if (data.pnc !== undefined) row.pnc = data.pnc;
  if (data.momCare !== undefined) row.mom_care = data.momCare;
  if (data.catatan !== undefined) row.catatan = data.catatan;
  if (data.petugas !== undefined) row.petugas = data.petugas;
  return row;
}

export async function fetchPemeriksaanByPendaftaranId(
  pendaftaranId: string
): Promise<PemeriksaanData | null> {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('pemeriksaan_pasien')
        .select('*')
        .eq('pendaftaran_id', pendaftaranId)
        .maybeSingle();

      if (!error && data) {
        const item = mapRowToData(data);
        // Sync local cache
        const localCache = initCache();
        const exists = localCache.some((c) => c.patientId === pendaftaranId);
        if (exists) {
          saveCache(localCache.map((c) => (c.patientId === pendaftaranId ? item : c)));
        } else {
          saveCache([item, ...localCache]);
        }
        return item;
      }
    } catch {
      // Local fallback
    }
  }

  const localCache = initCache();
  const found = localCache.find((item) => item.patientId === pendaftaranId);
  return found || null;
}

export async function savePemeriksaan(
  pendaftaranId: string,
  data: Omit<PemeriksaanData, 'id' | 'patientId'>
): Promise<PemeriksaanData> {
  const supabase = getSupabaseClient();
  const localCache = initCache();
  const existing = localCache.find((item) => item.patientId === pendaftaranId);

  const nowIso = new Date().toISOString();
  const item: PemeriksaanData = {
    ...data,
    id: existing ? existing.id : `pem-${Date.now()}`,
    patientId: pendaftaranId,
    timestamp: nowIso
  };

  const dbRow = mapDataToRow(item);

  if (supabase && isSupabaseConfigured()) {
    try {
      if (existing) {
        await supabase
          .from('pemeriksaan_pasien')
          .update({ ...dbRow, updated_at: nowIso })
          .eq('pendaftaran_id', pendaftaranId);
      } else {
        await supabase
          .from('pemeriksaan_pasien')
          .insert({ ...dbRow, created_at: nowIso, updated_at: nowIso });
      }
    } catch {
      // Fallback
    }
  }

  // Update local cache
  let updatedCache: PemeriksaanData[];
  if (existing) {
    updatedCache = localCache.map((c) => (c.patientId === pendaftaranId ? item : c));
  } else {
    updatedCache = [item, ...localCache];
  }
  saveCache(updatedCache);

  // Broadcast realtime events
  realtimeService.emitEvent('pemeriksaan_pasien', existing ? 'UPDATE' : 'INSERT', item);

  return item;
}

export async function deletePemeriksaanByPendaftaranId(
  pendaftaranId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase
        .from('pemeriksaan_pasien')
        .delete()
        .eq('pendaftaran_id', pendaftaranId);
    } catch {
      // Fallback
    }
  }

  const localCache = initCache();
  const updated = localCache.filter((c) => c.patientId !== pendaftaranId);
  saveCache(updated);

  realtimeService.emitEvent('pemeriksaan_pasien', 'DELETE', { patientId: pendaftaranId });

  return true;
}
