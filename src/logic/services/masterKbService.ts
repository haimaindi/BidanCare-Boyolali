/**
 * Service Logic: Master KB (Keluarga Berencana)
 * Path: /src/logic/services/masterKbService.ts
 * Manages fetching, pagination, and persistence for Master KB modules.
 * Integrates with Supabase PostgreSQL when API Keys are configured.
 */

import { KbMasterData, KbTier } from '../../modules/master-kb/types.js';
import { dummyKbData } from '../../modules/master-kb/data/dummy.js';
import { getLimitForPage } from './fetchingCenter.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';

const STORAGE_KEY = 'master_kb_items';

// Internal state storage initialized from localStorage or dummy data
let masterKbCache: KbMasterData[] = [];

function initCache(): KbMasterData[] {
  if (masterKbCache.length > 0) {
    return masterKbCache;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        masterKbCache = JSON.parse(stored);
        return masterKbCache;
      }
    } catch {
      // Fallback on error
    }
  }

  masterKbCache = [...dummyKbData];
  saveCache(masterKbCache);
  return masterKbCache;
}

function saveCache(data: KbMasterData[]): void {
  masterKbCache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage write error ignored
    }
  }
}

export interface FetchMasterKbParams {
  strategy?: 'full' | 'lazy';
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface FetchMasterKbResult {
  items: KbMasterData[];
  totalCount: number;
}

/**
 * Fetch list of Master KB items from Supabase or local cache according to strategy
 */
export async function fetchMasterKbList(
  params: FetchMasterKbParams = {}
): Promise<FetchMasterKbResult> {
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  // If Supabase is connected, attempt fetching from Supabase
  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('master_kb')
        .select(`
          id,
          name,
          status,
          created_at,
          updated_at,
          tiers:master_kb_tier(tier, duration_days)
        `, { count: 'exact' });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const strategy = params.strategy || 'full';
      if (strategy === 'lazy') {
        const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterKB');
        const offset = params.offset !== undefined ? params.offset : 0;
        query = query.range(offset, offset + pageLimit - 1);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const items: KbMasterData[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          created_at: row.created_at,
          updated_at: row.updated_at,
          tiers: Array.isArray(row.tiers)
            ? row.tiers
                .map((t: any) => ({
                  tier: Number(t.tier),
                  durationDays: Number(t.duration_days ?? t.durationDays ?? 0),
                }))
                .sort((a: KbTier, b: KbTier) => a.tier - b.tier)
            : [],
        }));

        saveCache(items);
        return {
          items,
          totalCount: count ?? items.length,
        };
      }
    } catch {
      // On Supabase query failure, fallback gracefully to local cache
    }
  }

  // Fallback / Local Cache
  const cache = initCache();
  let filtered = cache;
  if (search) {
    filtered = cache.filter((item) =>
      item.name.toLowerCase().includes(search)
    );
  }

  const totalCount = filtered.length;
  const strategy = params.strategy || 'full';

  if (strategy === 'full') {
    return {
      items: filtered,
      totalCount,
    };
  }

  const pageLimit = params.limit && params.limit > 0 ? params.limit : getLimitForPage('MasterKB');
  const offset = params.offset !== undefined ? params.offset : 0;
  const items = filtered.slice(offset, offset + pageLimit);

  return {
    items,
    totalCount,
  };
}

/**
 * Add new Master KB item to Supabase and update cache
 */
export async function createMasterKbItem(
  newItemData: Omit<KbMasterData, 'id'>
): Promise<KbMasterData> {
  const supabase = getSupabaseClient();
  const generatedId = `kb-${Date.now()}`;

  const newItem: KbMasterData = {
    ...newItemData,
    id: generatedId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase && isSupabaseConfigured()) {
    try {
      const { error: kbError } = await supabase.from('master_kb').insert({
        id: newItem.id,
        name: newItem.name,
        status: 'aktif',
      });

      if (!kbError && newItem.tiers.length > 0) {
        const tierPayload = newItem.tiers.map((t) => ({
          master_kb_id: newItem.id,
          tier: t.tier,
          duration_days: t.durationDays,
        }));
        await supabase.from('master_kb_tier').insert(tierPayload);
      }
    } catch {
      // Proceed with local cache backup on error
    }
  }

  const cache = initCache();
  const updatedCache = [newItem, ...cache];
  saveCache(updatedCache);
  return newItem;
}

/**
 * Update existing Master KB item in Supabase and update cache
 */
export async function updateMasterKbItem(
  id: string,
  updatedData: Partial<Omit<KbMasterData, 'id'>>
): Promise<KbMasterData> {
  const supabase = getSupabaseClient();
  const cache = initCache();
  let updatedItem: KbMasterData | null = null;

  const updatedCache = cache.map((item) => {
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
    throw new Error(`Master KB dengan ID "${id}" tidak ditemukan.`);
  }

  if (supabase && isSupabaseConfigured()) {
    try {
      if (updatedData.name) {
        await supabase
          .from('master_kb')
          .update({ name: updatedData.name })
          .eq('id', id);
      }

      if (updatedData.tiers) {
        // Delete old tiers and re-insert updated tiers
        await supabase.from('master_kb_tier').delete().eq('master_kb_id', id);
        const tierPayload = updatedData.tiers.map((t) => ({
          master_kb_id: id,
          tier: t.tier,
          duration_days: t.durationDays,
        }));
        await supabase.from('master_kb_tier').insert(tierPayload);
      }
    } catch {
      // Proceed with local cache backup on error
    }
  }

  saveCache(updatedCache);
  return updatedItem;
}

/**
 * Delete Master KB item from Supabase and cache
 */
export async function deleteMasterKbItem(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('master_kb').delete().eq('id', id);
    } catch {
      // Proceed with local cache deletion on error
    }
  }

  const cache = initCache();
  const updatedCache = cache.filter((item) => item.id !== id);
  saveCache(updatedCache);
  return true;
}
