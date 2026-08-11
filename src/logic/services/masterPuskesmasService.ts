/**
 * Service Logic: Master Puskesmas
 * Path: /src/logic/services/masterPuskesmasService.ts
 * Manages fetching, pagination, and persistence for Master Puskesmas modules.
 * Integrates with Supabase PostgreSQL when API Keys are configured.
 */

import { PuskesmasData } from '../../modules/master-puskesmas/types.js';
import { dummyPuskesmasData } from '../../modules/master-puskesmas/data/dummy.js';
import { getLimitForPage } from './fetchingCenter.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';

const STORAGE_KEY = 'master_puskesmas_items';

let cache: PuskesmasData[] = [];

function initCache(): PuskesmasData[] {
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

  cache = [...dummyPuskesmasData];
  saveCache(cache);
  return cache;
}

function saveCache(data: PuskesmasData[]): void {
  cache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage write error
    }
  }
}

export interface FetchMasterPuskesmasParams {
  strategy?: 'full' | 'lazy';
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface FetchMasterPuskesmasResult {
  items: PuskesmasData[];
  totalCount: number;
}

export async function fetchMasterPuskesmasList(
  params: FetchMasterPuskesmasParams = {}
): Promise<FetchMasterPuskesmasResult> {
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('master_puskesmas')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('nama', `%${search}%`);
      }

      const strategy = params.strategy || 'full';
      if (strategy === 'lazy') {
        const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterPuskesmas');
        const offset = params.offset !== undefined ? params.offset : 0;
        query = query.range(offset, offset + pageLimit - 1);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const items: PuskesmasData[] = data.map((row: any) => ({
          id: row.id,
          nama: row.nama,
          alamat: row.alamat || '',
          noTelepon: row.no_telepon || row.noTelepon || '',
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
      (item.alamat && item.alamat.toLowerCase().includes(search))
    );
  }

  const totalCount = filtered.length;
  const strategy = params.strategy || 'full';

  if (strategy === 'full') {
    return { items: filtered, totalCount };
  }

  const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterPuskesmas');
  const offset = params.offset !== undefined ? params.offset : 0;
  const items = filtered.slice(offset, offset + pageLimit);

  return { items, totalCount };
}

export async function createMasterPuskesmasItem(
  newItemData: Omit<PuskesmasData, 'id'>
): Promise<PuskesmasData> {
  const supabase = getSupabaseClient();
  const newItem: PuskesmasData = {
    ...newItemData,
    id: `pusk-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('master_puskesmas').insert({
        id: newItem.id,
        nama: newItem.nama,
        alamat: newItem.alamat || null,
        no_telepon: newItem.noTelepon || null,
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

export async function updateMasterPuskesmasItem(
  id: string,
  updatedData: Partial<Omit<PuskesmasData, 'id'>>
): Promise<PuskesmasData> {
  const supabase = getSupabaseClient();
  const localCache = initCache();
  let updatedItem: PuskesmasData | null = null;

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
    throw new Error(`Master Puskesmas dengan ID "${id}" tidak ditemukan.`);
  }

  if (supabase && isSupabaseConfigured()) {
    try {
      const payload: Record<string, any> = {};
      if (updatedData.nama !== undefined) payload.nama = updatedData.nama;
      if (updatedData.alamat !== undefined) payload.alamat = updatedData.alamat;
      if (updatedData.noTelepon !== undefined) payload.no_telepon = updatedData.noTelepon;

      if (Object.keys(payload).length > 0) {
        await supabase.from('master_puskesmas').update(payload).eq('id', id);
      }
    } catch {
      // Local fallback
    }
  }

  saveCache(updated);
  return updatedItem;
}

export async function deleteMasterPuskesmasItem(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('master_puskesmas').delete().eq('id', id);
    } catch {
      // Local fallback
    }
  }

  const localCache = initCache();
  const updated = localCache.filter((item) => item.id !== id);
  saveCache(updated);
  return true;
}
