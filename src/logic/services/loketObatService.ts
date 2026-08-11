/**
 * Service Logic: Loket Obat (Prescription Dispensing)
 * Path: /src/logic/services/loketObatService.ts
 */

import { LoketObatEntry, PrescriptionItem } from '../../modules/loket-obat/types.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';
import { realtimeService } from './realtimeService.js';
import { fetchPemeriksaanByPendaftaranId, savePemeriksaan } from './pemeriksaanService.js';
import { addObatKeluarEntry, fetchObatStokBerjalanList } from './manajemenObatService.js';
import { addBhpKeluarEntry, fetchBhpStokBerjalanList } from './manajemenBhpService.js';

const STORAGE_KEY = 'loket_obat_items';

let cache: LoketObatEntry[] = [];

function initCache(): LoketObatEntry[] {
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

  // Load initial dummy list if no storage exists yet
  cache = [];
  return cache;
}

function saveCache(data: LoketObatEntry[]): void {
  cache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage write error
    }
  }
}

function mapRowToEntry(row: any): LoketObatEntry {
  return {
    id: row.id,
    noRm: row.no_rm,
    namaPasien: row.nama_pasien,
    jenisKelamin: row.jenis_kelamin,
    tanggalLahir: row.tanggal_lahir,
    usia: row.usia || '',
    waktuPesan: row.waktu_pesan || row.created_at,
    sumber: row.sumber,
    status: row.status,
    items: Array.isArray(row.items) ? row.items : [],
    pemeriksaanId: row.pemeriksaan_id || undefined,
  };
}

function mapEntryToRow(entry: Partial<LoketObatEntry>) {
  const row: Record<string, any> = {};
  if (entry.id !== undefined) row.id = entry.id;
  if (entry.noRm !== undefined) row.no_rm = entry.noRm;
  if (entry.namaPasien !== undefined) row.nama_pasien = entry.namaPasien;
  if (entry.jenisKelamin !== undefined) row.jenis_kelamin = entry.jenisKelamin;
  if (entry.tanggalLahir !== undefined) row.tanggal_lahir = entry.tanggalLahir;
  if (entry.usia !== undefined) row.usia = entry.usia;
  if (entry.waktuPesan !== undefined) row.waktu_pesan = entry.waktuPesan;
  if (entry.sumber !== undefined) row.sumber = entry.sumber;
  if (entry.status !== undefined) row.status = entry.status;
  if (entry.items !== undefined) row.items = entry.items;
  if (entry.pemeriksaanId !== undefined) row.pemeriksaan_id = entry.pemeriksaanId;
  return row;
}

export async function fetchLoketObatList(params: {
  search?: string;
  statusFilter?: string;
}): Promise<LoketObatEntry[]> {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase.from('loket_obat').select('*').order('waktu_pesan', { ascending: false });

      if (params.search) {
        query = query.or(`nama_pasien.ilike.%${params.search}%,no_rm.ilike.%${params.search}%`);
      }

      if (params.statusFilter && params.statusFilter !== 'All') {
        query = query.eq('status', params.statusFilter);
      }

      const { data, error } = await query;

      if (!error && data) {
        const items = data.map(mapRowToEntry);
        saveCache(items);
        return items;
      }
    } catch {
      // Local fallback
    }
  }

  // Local storage logic
  let filtered = initCache();

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.namaPasien.toLowerCase().includes(searchLower) ||
        item.noRm.toLowerCase().includes(searchLower)
    );
  }

  if (params.statusFilter && params.statusFilter !== 'All') {
    filtered = filtered.filter((item) => item.status === params.statusFilter);
  }

  return filtered;
}

export async function saveLoketObat(
  entry: Partial<LoketObatEntry> & { id: string }
): Promise<LoketObatEntry> {
  const supabase = getSupabaseClient();
  const localCache = initCache();
  const existing = localCache.find((item) => item.id === entry.id);

  const prevStatus = existing?.status || 'Menunggu';
  const newStatus = entry.status || prevStatus;

  const nowIso = new Date().toISOString();
  const finalEntry: LoketObatEntry = {
    ...existing,
    ...entry,
    id: entry.id,
    waktuPesan: entry.waktuPesan || existing?.waktuPesan || nowIso,
    status: newStatus,
    items: entry.items || existing?.items || [],
  } as LoketObatEntry;

  const dbRow = mapEntryToRow(finalEntry);

  if (supabase && isSupabaseConfigured()) {
    try {
      if (existing) {
        await supabase
          .from('loket_obat')
          .update({ ...dbRow, updated_at: nowIso })
          .eq('id', entry.id);
      } else {
        await supabase
          .from('loket_obat')
          .insert({ ...dbRow, created_at: nowIso, updated_at: nowIso });
      }
    } catch {
      // Fallback
    }
  }

  // Update local cache
  let updatedCache: LoketObatEntry[];
  if (existing) {
    updatedCache = localCache.map((c) => (c.id === entry.id ? finalEntry : c));
  } else {
    updatedCache = [finalEntry, ...localCache];
  }
  saveCache(updatedCache);

  // Sync to Pemeriksaan if drug lists are edited and source is Pemeriksaan
  if (finalEntry.sumber === 'Pemeriksaan' && finalEntry.pemeriksaanId) {
    try {
      const pemeriksaan = await fetchPemeriksaanByPendaftaranId(finalEntry.pemeriksaanId);
      if (pemeriksaan) {
        const updatedTerapi = finalEntry.items.map((item) => ({
          sku: item.sku,
          namaObat: item.namaObat,
          dosis: item.dosis,
          aturanPakai: item.aturanPakai,
          jumlah: item.jumlah,
        }));

        await savePemeriksaan(finalEntry.pemeriksaanId, {
          ...pemeriksaan,
          plan: {
            ...pemeriksaan.plan,
            terapiFarmakologi: updatedTerapi,
          },
        });
      }
    } catch (e) {
      console.error('Failed to sync prescription back to Pemeriksaan:', e);
    }
  }

  // Subtract stocks if status changed from something else to "Selesai"
  if (newStatus === 'Selesai' && prevStatus !== 'Selesai') {
    await deductStocksForPrescription(finalEntry);
    
    // Auto-generate Kasir Tagihan when Loket Obat is Selesai
    if (finalEntry.pemeriksaanId) {
      try {
        const { generateTagihan } = await import('./kasirService.js');
        await generateTagihan(finalEntry.pemeriksaanId);
      } catch (e) {
        console.error('Failed to generate Kasir Tagihan from Loket Obat:', e);
      }
    }
  }

  // Broadcast realtime event
  realtimeService.emitEvent('loket_obat', existing ? 'UPDATE' : 'INSERT', finalEntry);

  return finalEntry;
}

export async function updateLoketObatStatus(
  id: string,
  newStatus: 'Menunggu' | 'Disiapkan' | 'Selesai'
): Promise<LoketObatEntry> {
  return saveLoketObat({ id, status: newStatus });
}

export async function deleteLoketObat(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('loket_obat').delete().eq('id', id);
    } catch {
      // Fallback
    }
  }

  const localCache = initCache();
  const updated = localCache.filter((c) => c.id !== id);
  saveCache(updated);

  realtimeService.emitEvent('loket_obat', 'DELETE', { id });

  return true;
}

/**
 * Deduct stocks of prescribed medicines and BHPs when prescription state is set to "Selesai"
 */
async function deductStocksForPrescription(entry: LoketObatEntry) {
  // 1. Deduct Obat Stocks
  try {
    const activeObatList = await fetchObatStokBerjalanList({ strategy: 'full' });
    for (const item of entry.items) {
      const match = activeObatList.items.find((o) => o.sku === item.sku);
      if (match) {
        await addObatKeluarEntry({
          sku: match.sku,
          namaObat: match.namaObat,
          namaMerk: match.namaMerk,
          bentukSediaan: match.bentukSediaan,
          dosisSediaan: match.dosisSediaan,
          qtyKeluar: item.jumlah,
          keterangan: `Resep Loket Obat (${entry.namaPasien} - RM ${entry.noRm})`,
        });
      } else {
        // If not in stock list, still record outbound movement
        await addObatKeluarEntry({
          sku: item.sku,
          namaObat: item.namaObat,
          namaMerk: '-',
          bentukSediaan: '-',
          dosisSediaan: item.dosis,
          qtyKeluar: item.jumlah,
          keterangan: `Resep Loket Obat (${entry.namaPasien} - RM ${entry.noRm})`,
        });
      }
    }
  } catch (e) {
    console.error('Failed to deduct medicine stocks:', e);
  }

  // 2. Deduct BHP Stocks from the examination linked to this prescription
  if (entry.pemeriksaanId) {
    try {
      const pemeriksaan = await fetchPemeriksaanByPendaftaranId(entry.pemeriksaanId);
      if (pemeriksaan && Array.isArray(pemeriksaan.bhp)) {
        const activeBhpList = await fetchBhpStokBerjalanList({ strategy: 'full' });
        for (const bhpItem of pemeriksaan.bhp) {
          const match = activeBhpList.items.find((b) => b.sku === bhpItem.sku);
          if (match) {
            await addBhpKeluarEntry({
              sku: match.sku,
              kategori: match.kategori,
              namaBhp: match.namaBhp,
              satuan: match.satuan,
              qtyKeluar: bhpItem.jumlah,
              keterangan: `Penggunaan BHP Rekam Medis (${entry.namaPasien} - RM ${entry.noRm})`,
            });
          } else {
            await addBhpKeluarEntry({
              sku: bhpItem.sku,
              kategori: 'Umum',
              namaBhp: bhpItem.namaBhp,
              satuan: bhpItem.satuan || 'Pcs',
              qtyKeluar: bhpItem.jumlah,
              keterangan: `Penggunaan BHP Rekam Medis (${entry.namaPasien} - RM ${entry.noRm})`,
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to deduct BHP stocks:', e);
    }
  }
}
