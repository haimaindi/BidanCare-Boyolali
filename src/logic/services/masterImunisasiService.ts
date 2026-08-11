/**
 * Service Logic: Master Imunisasi
 * Path: /src/logic/services/masterImunisasiService.ts
 * Manages fetching, pagination, and persistence for Master Imunisasi modules.
 * Integrates with Supabase PostgreSQL when API Keys are configured.
 */

import { ImunisasiData } from '../../modules/master-imunisasi/types.js';
import { dummyImunisasiData } from '../../modules/master-imunisasi/data/dummy.js';
import { getLimitForPage } from './fetchingCenter.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';

const STORAGE_KEY = 'master_imunisasi_items';

let cache: ImunisasiData[] = [];

function initCache(): ImunisasiData[] {
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

  cache = [...dummyImunisasiData];
  saveCache(cache);
  return cache;
}

function saveCache(data: ImunisasiData[]): void {
  cache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage write error
    }
  }
}

export interface FetchMasterImunisasiParams {
  strategy?: 'full' | 'lazy';
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface FetchMasterImunisasiResult {
  items: ImunisasiData[];
  totalCount: number;
}

export async function fetchMasterImunisasiList(
  params: FetchMasterImunisasiParams = {}
): Promise<FetchMasterImunisasiResult> {
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('master_imunisasi')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('nama', `%${search}%`);
      }

      const strategy = params.strategy || 'full';
      if (strategy === 'lazy') {
        const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterImunisasi');
        const offset = params.offset !== undefined ? params.offset : 0;
        query = query.range(offset, offset + pageLimit - 1);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const items: ImunisasiData[] = data.map((row: any) => ({
          id: row.id,
          nama: row.nama,
          keterangan: row.keterangan || '',
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

  const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterImunisasi');
  const offset = params.offset !== undefined ? params.offset : 0;
  const items = filtered.slice(offset, offset + pageLimit);

  return { items, totalCount };
}

export async function createMasterImunisasiItem(
  newItemData: Omit<ImunisasiData, 'id'>
): Promise<ImunisasiData> {
  const supabase = getSupabaseClient();
  const newItem: ImunisasiData = {
    ...newItemData,
    id: `imun-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('master_imunisasi').insert({
        id: newItem.id,
        nama: newItem.nama,
        keterangan: newItem.keterangan || null,
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

export async function updateMasterImunisasiItem(
  id: string,
  updatedData: Partial<Omit<ImunisasiData, 'id'>>
): Promise<ImunisasiData> {
  const supabase = getSupabaseClient();
  const localCache = initCache();
  let updatedItem: ImunisasiData | null = null;

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
    throw new Error(`Master Imunisasi dengan ID "${id}" tidak ditemukan.`);
  }

  if (supabase && isSupabaseConfigured()) {
    try {
      const payload: Record<string, any> = {};
      if (updatedData.nama !== undefined) payload.nama = updatedData.nama;
      if (updatedData.keterangan !== undefined) payload.keterangan = updatedData.keterangan;

      if (Object.keys(payload).length > 0) {
        await supabase.from('master_imunisasi').update(payload).eq('id', id);
      }
    } catch {
      // Local fallback
    }
  }

  saveCache(updated);
  return updatedItem;
}

export async function deleteMasterImunisasiItem(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('master_imunisasi').delete().eq('id', id);
    } catch {
      // Local fallback
    }
  }

  const localCache = initCache();
  const updated = localCache.filter((item) => item.id !== id);
  saveCache(updated);
  return true;
}
