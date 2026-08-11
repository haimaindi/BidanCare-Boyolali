/**
 * Service Logic: Master Broadcast
 * Path: /src/logic/services/masterBroadcastService.ts
 * Manages fetching and updating for Master Broadcast config & templates.
 * Note: Create and Delete operations are intentionally disabled/restricted.
 * Integrates with Supabase PostgreSQL when API Keys are configured.
 */

import { BroadcastConfig } from '../../modules/master-broadcast/types.js';
import { dummyBroadcastConfigs } from '../../modules/master-broadcast/data/dummy.js';
import { getLimitForPage } from './fetchingCenter.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';

const STORAGE_KEY = 'master_broadcast_items';

let cache: BroadcastConfig[] = [];

function initCache(): BroadcastConfig[] {
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

  cache = [...dummyBroadcastConfigs];
  saveCache(cache);
  return cache;
}

function saveCache(data: BroadcastConfig[]): void {
  cache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage write error
    }
  }
}

export interface FetchMasterBroadcastParams {
  strategy?: 'full' | 'lazy';
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface FetchMasterBroadcastResult {
  items: BroadcastConfig[];
  totalCount: number;
}

export async function fetchMasterBroadcastList(
  params: FetchMasterBroadcastParams = {}
): Promise<FetchMasterBroadcastResult> {
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('master_broadcast')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('category', `%${search}%`);
      }

      const strategy = params.strategy || 'full';
      if (strategy === 'lazy') {
        const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterBroadcast');
        const offset = params.offset !== undefined ? params.offset : 0;
        query = query.range(offset, offset + pageLimit - 1);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const items: BroadcastConfig[] = data.map((row: any) => ({
          id: row.id,
          category: row.category,
          followUpDays: row.follow_up_days !== undefined ? row.follow_up_days : (row.followUpDays ?? null),
          reminderDays: row.reminder_days !== undefined ? row.reminder_days : (row.reminderDays ?? null),
          followUpTemplate: row.follow_up_template || row.followUpTemplate || '',
          reminderTemplate: row.reminder_template || row.reminderTemplate || '',
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
      item.category.toLowerCase().includes(search)
    );
  }

  const totalCount = filtered.length;
  const strategy = params.strategy || 'full';

  if (strategy === 'full') {
    return { items: filtered, totalCount };
  }

  const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterBroadcast');
  const offset = params.offset !== undefined ? params.offset : 0;
  const items = filtered.slice(offset, offset + pageLimit);

  return { items, totalCount };
}

export async function updateMasterBroadcastItem(
  id: string,
  updatedData: Partial<Omit<BroadcastConfig, 'id'>>
): Promise<BroadcastConfig> {
  const supabase = getSupabaseClient();
  const localCache = initCache();
  let updatedItem: BroadcastConfig | null = null;

  const updated = localCache.map((item) => {
    if (item.id === id) {
      updatedItem = {
        ...item,
        ...updatedData,
      };
      return updatedItem;
    }
    return item;
  });

  if (!updatedItem) {
    throw new Error(`Master Broadcast dengan ID "${id}" tidak ditemukan.`);
  }

  if (supabase && isSupabaseConfigured()) {
    try {
      const payload: Record<string, any> = {};
      if (updatedData.category !== undefined) payload.category = updatedData.category;
      if (updatedData.followUpDays !== undefined) payload.follow_up_days = updatedData.followUpDays;
      if (updatedData.reminderDays !== undefined) payload.reminder_days = updatedData.reminderDays;
      if (updatedData.followUpTemplate !== undefined) payload.follow_up_template = updatedData.followUpTemplate;
      if (updatedData.reminderTemplate !== undefined) payload.reminder_template = updatedData.reminderTemplate;

      if (Object.keys(payload).length > 0) {
        await supabase.from('master_broadcast').update(payload).eq('id', id);
      }
    } catch {
      // Local fallback
    }
  }

  saveCache(updated);
  return updatedItem;
}
