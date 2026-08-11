/**
 * Service Logic: Master Harga Dasar
 * Path: /src/logic/services/masterHargaDasarService.ts
 * Manages fetching and updating for Master Harga Dasar.
 * Note: Create and Delete operations are intentionally disabled/restricted.
 * Integrates with Supabase PostgreSQL when API Keys are configured.
 */

import { HargaDasar } from '../../modules/master-harga-dasar/types.js';
import { dummyHargaDasar } from '../../modules/master-harga-dasar/data/dummy.js';
import { getLimitForPage } from './fetchingCenter.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';

const STORAGE_KEY = 'master_harga_dasar_items';

let cache: HargaDasar[] = [];

function initCache(): HargaDasar[] {
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

  cache = [...dummyHargaDasar];
  saveCache(cache);
  return cache;
}

function saveCache(data: HargaDasar[]): void {
  cache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage write error
    }
  }
}

export interface FetchMasterHargaDasarParams {
  strategy?: 'full' | 'lazy';
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface FetchMasterHargaDasarResult {
  items: HargaDasar[];
  totalCount: number;
}

export async function fetchMasterHargaDasarList(
  params: FetchMasterHargaDasarParams = {}
): Promise<FetchMasterHargaDasarResult> {
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('master_harga_dasar')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('nama_layanan', `%${search}%`);
      }

      const strategy = params.strategy || 'full';
      if (strategy === 'lazy') {
        const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterHargaDasar');
        const offset = params.offset !== undefined ? params.offset : 0;
        query = query.range(offset, offset + pageLimit - 1);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const items: HargaDasar[] = data.map((row: any) => ({
          id: row.id,
          namaLayanan: row.nama_layanan || row.namaLayanan || '',
          hargaDasar: Number(row.harga_dasar || row.hargaDasar || 0),
          lastUpdated: row.last_updated || row.lastUpdated || new Date().toISOString().split('T')[0],
        }));

        saveCache(items);
        return {
          items,
          totalCount: count ?? items.length,
        };
      }
    } catch {
      // Supabase fallback
    }
  }

  const localCache = initCache();
  let filtered = localCache;
  if (search) {
    filtered = localCache.filter((item) =>
      item.namaLayanan.toLowerCase().includes(search)
    );
  }

  const totalCount = filtered.length;
  const strategy = params.strategy || 'full';

  if (strategy === 'full') {
    return { items: filtered, totalCount };
  }

  const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterHargaDasar');
  const offset = params.offset !== undefined ? params.offset : 0;
  const items = filtered.slice(offset, offset + pageLimit);

  return { items, totalCount };
}

export async function updateMasterHargaDasarItem(
  id: string,
  updatedData: Partial<Omit<HargaDasar, 'id'>>
): Promise<HargaDasar> {
  const supabase = getSupabaseClient();
  const localCache = initCache();
  let updatedItem: HargaDasar | null = null;
  const todayStr = new Date().toISOString().split('T')[0];

  const updated = localCache.map((item) => {
    if (item.id === id) {
      updatedItem = {
        ...item,
        ...updatedData,
        lastUpdated: todayStr,
      };
      return updatedItem;
    }
    return item;
  });

  if (!updatedItem) {
    throw new Error(`Master Harga Dasar dengan ID "${id}" tidak ditemukan.`);
  }

  if (supabase && isSupabaseConfigured()) {
    try {
      const payload: Record<string, any> = {
        last_updated: todayStr,
      };
      if (updatedData.namaLayanan !== undefined) payload.nama_layanan = updatedData.namaLayanan;
      if (updatedData.hargaDasar !== undefined) payload.harga_dasar = updatedData.hargaDasar;

      await supabase.from('master_harga_dasar').update(payload).eq('id', id);
    } catch {
      // Local fallback
    }
  }

  saveCache(updated);
  return updatedItem;
}
