/**
 * Service Logic: Master Layanan Lain
 * Path: /src/logic/services/masterLayananLainService.ts
 * Manages fetching, pagination, and persistence for Master Layanan Lain modules.
 * Integrates with Supabase PostgreSQL when API Keys are configured.
 */

import { LayananLainData } from '../../modules/master-layanan-lain/types.js';
import { dummyLayananLainData } from '../../modules/master-layanan-lain/data/dummy.js';
import { getLimitForPage } from './fetchingCenter.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';

const STORAGE_KEY = 'master_layanan_lain_items';

let cache: LayananLainData[] = [];

function initCache(): LayananLainData[] {
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

  cache = [...dummyLayananLainData];
  saveCache(cache);
  return cache;
}

function saveCache(data: LayananLainData[]): void {
  cache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage write error
    }
  }
}

export interface FetchMasterLayananLainParams {
  strategy?: 'full' | 'lazy';
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface FetchMasterLayananLainResult {
  items: LayananLainData[];
  totalCount: number;
}

export async function fetchMasterLayananLainList(
  params: FetchMasterLayananLainParams = {}
): Promise<FetchMasterLayananLainResult> {
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('master_layanan_lain')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('nama', `%${search}%`);
      }

      const strategy = params.strategy || 'full';
      if (strategy === 'lazy') {
        const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterLayananLain');
        const offset = params.offset !== undefined ? params.offset : 0;
        query = query.range(offset, offset + pageLimit - 1);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const items: LayananLainData[] = data.map((row: any) => ({
          id: row.id,
          nama: row.nama,
          keterangan: row.keterangan || '',
          harga: Number(row.harga || 0),
          created_at: row.created_at,
          updated_at: row.updated_at,
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
      item.nama.toLowerCase().includes(search) ||
      (item.keterangan && item.keterangan.toLowerCase().includes(search))
    );
  }

  const totalCount = filtered.length;
  const strategy = params.strategy || 'full';

  if (strategy === 'full') {
    return { items: filtered, totalCount };
  }

  const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterLayananLain');
  const offset = params.offset !== undefined ? params.offset : 0;
  const items = filtered.slice(offset, offset + pageLimit);

  return { items, totalCount };
}

export async function createMasterLayananLainItem(
  newItemData: Omit<LayananLainData, 'id'>
): Promise<LayananLainData> {
  const supabase = getSupabaseClient();
  const newItem: LayananLainData = {
    ...newItemData,
    id: `serv-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('master_layanan_lain').insert({
        id: newItem.id,
        nama: newItem.nama,
        keterangan: newItem.keterangan || null,
        harga: newItem.harga,
      });
    } catch {
      // Local fallback
    }
  }

  const localCache = initCache();
  const updated = [newItem, ...localCache];
  saveCache(updated);
  return newItem;
}

export async function updateMasterLayananLainItem(
  id: string,
  updatedData: Partial<Omit<LayananLainData, 'id'>>
): Promise<LayananLainData> {
  const supabase = getSupabaseClient();
  const localCache = initCache();
  let updatedItem: LayananLainData | null = null;

  const updated = localCache.map((item) => {
    if (item.id === id) {
      updatedItem = {
        ...item,
        ...updatedData,
        updated_at: new Date().toISOString(),
      };
      return updatedItem;
    }
    return item;
  });

  if (!updatedItem) {
    throw new Error(`Master Layanan Lain dengan ID "${id}" tidak ditemukan.`);
  }

  if (supabase && isSupabaseConfigured()) {
    try {
      const payload: Record<string, any> = {};
      if (updatedData.nama !== undefined) payload.nama = updatedData.nama;
      if (updatedData.keterangan !== undefined) payload.keterangan = updatedData.keterangan;
      if (updatedData.harga !== undefined) payload.harga = updatedData.harga;

      if (Object.keys(payload).length > 0) {
        await supabase.from('master_layanan_lain').update(payload).eq('id', id);
      }
    } catch {
      // Local fallback
    }
  }

  saveCache(updated);
  return updatedItem;
}

export async function deleteMasterLayananLainItem(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('master_layanan_lain').delete().eq('id', id);
    } catch {
      // Local fallback
    }
  }

  const localCache = initCache();
  const updated = localCache.filter((item) => item.id !== id);
  saveCache(updated);
  return true;
}
