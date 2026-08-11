/**
 * Service Logic: Master User
 * Path: /src/logic/services/masterUserService.ts
 * Manages fetching, pagination, and persistence for Master User modules.
 * Integrates with Supabase PostgreSQL when API Keys are configured.
 */

import { User } from '../../modules/master-user/types.js';
import { dummyUsers } from '../../modules/master-user/data/dummy.js';
import { getLimitForPage } from './fetchingCenter.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';

const STORAGE_KEY = 'master_user_items';

let cache: User[] = [];

function initCache(): User[] {
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

  cache = [...dummyUsers];
  saveCache(cache);
  return cache;
}

function saveCache(data: User[]): void {
  cache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage write error
    }
  }
}

export interface FetchMasterUserParams {
  strategy?: 'full' | 'lazy';
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface FetchMasterUserResult {
  items: User[];
  totalCount: number;
}

export async function fetchMasterUserList(
  params: FetchMasterUserParams = {}
): Promise<FetchMasterUserResult> {
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('master_user')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`nama.ilike.%${search}%,access_id.ilike.%${search}%`);
      }

      const strategy = params.strategy || 'full';
      if (strategy === 'lazy') {
        const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterUser');
        const offset = params.offset !== undefined ? params.offset : 0;
        query = query.range(offset, offset + pageLimit - 1);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const items: User[] = data.map((row: any) => ({
          id: row.id,
          nama: row.nama,
          jenisUser: row.jenis_user || row.jenisUser || '',
          str: row.str || '',
          sip: row.sip || '',
          noWhatsapp: row.no_whatsapp || row.noWhatsapp || '',
          accessId: row.access_id || row.accessId || '',
          accessPassword: row.access_password || row.accessPassword || null,
          permissions: Array.isArray(row.permissions) ? row.permissions : [],
          createdAt: row.created_at || row.createdAt || new Date().toISOString(),
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
      item.accessId.toLowerCase().includes(search) ||
      item.jenisUser.toLowerCase().includes(search)
    );
  }

  const totalCount = filtered.length;
  const strategy = params.strategy || 'full';

  if (strategy === 'full') {
    return { items: filtered, totalCount };
  }

  const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterUser');
  const offset = params.offset !== undefined ? params.offset : 0;
  const items = filtered.slice(offset, offset + pageLimit);

  return { items, totalCount };
}

export async function createMasterUserItem(
  newItemData: Omit<User, 'id' | 'createdAt'>
): Promise<User> {
  const supabase = getSupabaseClient();
  const newItem: User = {
    ...newItemData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('master_user').insert({
        id: newItem.id,
        nama: newItem.nama,
        jenis_user: newItem.jenisUser,
        str: newItem.str || null,
        sip: newItem.sip || null,
        no_whatsapp: newItem.noWhatsapp,
        access_id: newItem.accessId,
        access_password: newItem.accessPassword || null,
        permissions: newItem.permissions,
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

export async function updateMasterUserItem(
  id: string,
  updatedData: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<User> {
  const supabase = getSupabaseClient();
  const localCache = initCache();
  let updatedItem: User | null = null;

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
    throw new Error(`Master User dengan ID "${id}" tidak ditemukan.`);
  }

  if (supabase && isSupabaseConfigured()) {
    try {
      const payload: Record<string, any> = {};
      if (updatedData.nama !== undefined) payload.nama = updatedData.nama;
      if (updatedData.jenisUser !== undefined) payload.jenis_user = updatedData.jenisUser;
      if (updatedData.str !== undefined) payload.str = updatedData.str;
      if (updatedData.sip !== undefined) payload.sip = updatedData.sip;
      if (updatedData.noWhatsapp !== undefined) payload.no_whatsapp = updatedData.noWhatsapp;
      if (updatedData.accessId !== undefined) payload.access_id = updatedData.accessId;
      if (updatedData.accessPassword !== undefined) payload.access_password = updatedData.accessPassword;
      if (updatedData.permissions !== undefined) payload.permissions = updatedData.permissions;

      if (Object.keys(payload).length > 0) {
        await supabase.from('master_user').update(payload).eq('id', id);
      }
    } catch {
      // Local fallback
    }
  }

  saveCache(updated);
  return updatedItem;
}

export async function deleteMasterUserItem(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('master_user').delete().eq('id', id);
    } catch {
      // Local fallback
    }
  }

  const localCache = initCache();
  const updated = localCache.filter((item) => item.id !== id);
  saveCache(updated);
  return true;
}
