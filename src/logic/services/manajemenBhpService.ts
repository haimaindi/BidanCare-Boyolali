/**
 * Service Logic: Manajemen BHP (Bahan Habis Pakai)
 * Path: /src/logic/services/manajemenBhpService.ts
 * Manages fetching, adding, and updating for BHP Stok Berjalan, BHP Masuk, and BHP Keluar.
 * Integrates with Supabase PostgreSQL when API Keys are configured, with localStorage fallback.
 */

import { StokBerjalanBhp, BhpMasuk, BhpKeluar } from '../../modules/bhp/data/dummy.js';
import { DUMMY_STOK_BERJALAN_BHP, DUMMY_BHP_MASUK, DUMMY_BHP_KELUAR } from '../../modules/bhp/data/dummy.js';
import { getLimitForPage } from './fetchingCenter.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';

const STORAGE_STOK_KEY = 'manajemen_bhp_stok_berjalan';
const STORAGE_MASUK_KEY = 'manajemen_bhp_masuk';
const STORAGE_KELUAR_KEY = 'manajemen_bhp_keluar';

let stokCache: StokBerjalanBhp[] = [];
let masukCache: BhpMasuk[] = [];
let keluarCache: BhpKeluar[] = [];

function initCaches() {
  if (stokCache.length === 0) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(STORAGE_STOK_KEY);
        if (stored) {
          stokCache = JSON.parse(stored);
        }
      } catch {
        // Fallback
      }
    }
    if (stokCache.length === 0) {
      stokCache = [...DUMMY_STOK_BERJALAN_BHP];
      saveStokCache(stokCache);
    }
  }

  if (masukCache.length === 0) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(STORAGE_MASUK_KEY);
        if (stored) {
          masukCache = JSON.parse(stored);
        }
      } catch {
        // Fallback
      }
    }
    if (masukCache.length === 0) {
      masukCache = [...DUMMY_BHP_MASUK];
      saveMasukCache(masukCache);
    }
  }

  if (keluarCache.length === 0) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KELUAR_KEY);
        if (stored) {
          keluarCache = JSON.parse(stored);
        }
      } catch {
        // Fallback
      }
    }
    if (keluarCache.length === 0) {
      keluarCache = [...DUMMY_BHP_KELUAR];
      saveKeluarCache(keluarCache);
    }
  }
}

function saveStokCache(data: StokBerjalanBhp[]): void {
  stokCache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_STOK_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }
}

function saveMasukCache(data: BhpMasuk[]): void {
  masukCache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_MASUK_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }
}

function saveKeluarCache(data: BhpKeluar[]): void {
  keluarCache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KELUAR_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }
}

export interface FetchBhpParams {
  strategy?: 'full' | 'lazy';
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

export async function fetchBhpStokBerjalanList(
  params: FetchBhpParams = {}
): Promise<{ items: StokBerjalanBhp[]; totalCount: number }> {
  initCaches();
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase.from('bhp_stok_berjalan').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`sku.ilike.%${search}%,nama_bhp.ilike.%${search}%,kategori.ilike.%${search}%`);
      }

      if (params.page && params.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      } else if (params.offset !== undefined && params.limit) {
        query = query.range(params.offset, params.offset + params.limit - 1);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const items: StokBerjalanBhp[] = data.map((row: any) => ({
          sku: row.sku,
          kategori: row.kategori || '',
          namaBhp: row.nama_bhp || row.namaBhp || '',
          satuan: row.satuan || '',
          sisaQty: Number(row.sisa_qty ?? row.sisaQty ?? 0),
          hargaBeliTerakhir: Number(row.harga_beli_terakhir ?? row.hargaBeliTerakhir ?? 0),
          hargaJual: Number(row.harga_jual ?? row.hargaJual ?? 0),
          margin: Number(row.margin ?? 0),
          jurnal: Array.isArray(row.bhp_jurnal)
            ? row.bhp_jurnal.map((j: any) => ({
                id: j.id,
                tanggal: j.tanggal,
                jenis: j.jenis,
                perubahanQty: Number(j.perubahan_qty ?? j.perubahanQty ?? 0),
                sisaQty: Number(j.sisa_qty ?? j.sisaQty ?? 0),
                keterangan: j.keterangan || '',
              }))
            : [],
        }));

        saveStokCache(items);
        return { items, totalCount: count ?? items.length };
      }
    } catch {
      // Fallback
    }
  }

  let filtered = stokCache;
  if (search) {
    filtered = stokCache.filter(
      (item) =>
        item.sku.toLowerCase().includes(search) ||
        item.namaBhp.toLowerCase().includes(search) ||
        item.kategori.toLowerCase().includes(search)
    );
  }

  return { items: filtered, totalCount: filtered.length };
}

export async function fetchBhpJurnalBySku(
  sku: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ items: any[]; totalCount: number }> {
  initCaches();
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await supabase
        .from('bhp_jurnal')
        .select('*', { count: 'exact' })
        .eq('sku', sku)
        .order('tanggal', { ascending: false })
        .range(from, to);

      if (!error && data) {
        const items = data.map((j: any) => ({
          id: j.id,
          tanggal: j.tanggal,
          jenis: j.jenis,
          perubahanQty: Number(j.perubahan_qty ?? j.perubahanQty ?? 0),
          sisaQty: Number(j.sisa_qty ?? j.sisaQty ?? 0),
          keterangan: j.keterangan || '',
        }));
        return { items, totalCount: count ?? items.length };
      }
    } catch {
      // Fallback
    }
  }

  const item = stokCache.find((s) => s.sku === sku);
  const jurnal = item?.jurnal || [];
  const from = (page - 1) * pageSize;
  const items = jurnal.slice(from, from + pageSize);
  return { items, totalCount: jurnal.length };
}

export async function fetchBhpMasukList(
  params: FetchBhpParams = {}
): Promise<{ items: BhpMasuk[]; totalCount: number }> {
  initCaches();
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase.from('bhp_masuk').select('*', { count: 'exact' }).order('tanggal', { ascending: false });

      if (search) {
        query = query.or(`sku.ilike.%${search}%,nama_bhp.ilike.%${search}%`);
      }

      if (params.page && params.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      } else if (params.offset !== undefined && params.limit) {
        query = query.range(params.offset, params.offset + params.limit - 1);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const items: BhpMasuk[] = data.map((row: any) => ({
          id: row.id,
          sku: row.sku,
          kategori: row.kategori || '',
          namaBhp: row.nama_bhp || row.namaBhp || '',
          satuan: row.satuan || '',
          qtyMasuk: Number(row.qty_masuk ?? row.qtyMasuk ?? 0),
          hargaBeli: Number(row.harga_beli ?? row.hargaBeli ?? 0),
          tanggal: row.tanggal,
        }));

        saveMasukCache(items);
        return { items, totalCount: count ?? items.length };
      }
    } catch {
      // Fallback
    }
  }

  let filtered = masukCache;
  if (search) {
    filtered = masukCache.filter(
      (item) =>
        item.sku.toLowerCase().includes(search) ||
        item.namaBhp.toLowerCase().includes(search)
    );
  }

  return { items: filtered, totalCount: filtered.length };
}

export async function fetchBhpKeluarList(
  params: FetchBhpParams = {}
): Promise<{ items: BhpKeluar[]; totalCount: number }> {
  initCaches();
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase.from('bhp_keluar').select('*', { count: 'exact' }).order('tanggal', { ascending: false });

      if (search) {
        query = query.or(`sku.ilike.%${search}%,nama_bhp.ilike.%${search}%`);
      }

      if (params.page && params.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      } else if (params.offset !== undefined && params.limit) {
        query = query.range(params.offset, params.offset + params.limit - 1);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const items: BhpKeluar[] = data.map((row: any) => ({
          id: row.id,
          sku: row.sku,
          kategori: row.kategori || '',
          namaBhp: row.nama_bhp || row.namaBhp || '',
          satuan: row.satuan || '',
          qtyKeluar: Number(row.qty_keluar ?? row.qtyKeluar ?? 0),
          keterangan: row.keterangan || '',
          tanggal: row.tanggal,
        }));

        saveKeluarCache(items);
        return { items, totalCount: count ?? items.length };
      }
    } catch {
      // Fallback
    }
  }

  let filtered = keluarCache;
  if (search) {
    filtered = keluarCache.filter(
      (item) =>
        item.sku.toLowerCase().includes(search) ||
        item.namaBhp.toLowerCase().includes(search)
    );
  }

  return { items: filtered, totalCount: filtered.length };
}

export async function addBhpMasukEntry(
  entry: Omit<BhpMasuk, 'id' | 'tanggal'>
): Promise<{ masuk: BhpMasuk; updatedStok: StokBerjalanBhp[] }> {
  initCaches();
  const supabase = getSupabaseClient();
  const timestamp = new Date().toISOString();
  const newId = `BM-${Date.now()}`;

  const newMasuk: BhpMasuk = {
    ...entry,
    id: newId,
    tanggal: timestamp,
  };

  const updatedMasukList = [newMasuk, ...masukCache];
  saveMasukCache(updatedMasukList);

  const existingIndex = stokCache.findIndex((s) => s.sku === entry.sku);
  let updatedStokList = [...stokCache];

  if (existingIndex > -1) {
    const item = updatedStokList[existingIndex];
    const newSisa = item.sisaQty + entry.qtyMasuk;
    const newMargin = item.hargaJual - entry.hargaBeli;
    const newJurnal = [
      {
        id: `J-${Date.now()}`,
        tanggal: timestamp,
        jenis: 'Masuk' as const,
        perubahanQty: entry.qtyMasuk,
        sisaQty: newSisa,
        keterangan: 'BHP Masuk (Manual)',
      },
      ...item.jurnal,
    ];

    updatedStokList[existingIndex] = {
      ...item,
      sisaQty: newSisa,
      hargaBeliTerakhir: entry.hargaBeli,
      margin: newMargin,
      jurnal: newJurnal,
    };
  } else {
    const hargaJualDefault = entry.hargaBeli * 1.3;
    updatedStokList.push({
      sku: entry.sku,
      kategori: entry.kategori,
      namaBhp: entry.namaBhp,
      satuan: entry.satuan,
      sisaQty: entry.qtyMasuk,
      hargaBeliTerakhir: entry.hargaBeli,
      hargaJual: hargaJualDefault,
      margin: hargaJualDefault - entry.hargaBeli,
      jurnal: [
        {
          id: `J-${Date.now()}`,
          tanggal: timestamp,
          jenis: 'Masuk' as const,
          perubahanQty: entry.qtyMasuk,
          sisaQty: entry.qtyMasuk,
          keterangan: 'Stok Awal (BHP Masuk Baru)',
        },
      ],
    });
  }

  saveStokCache(updatedStokList);

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('bhp_masuk').insert({
        id: newMasuk.id,
        sku: newMasuk.sku,
        kategori: newMasuk.kategori,
        nama_bhp: newMasuk.namaBhp,
        satuan: newMasuk.satuan,
        qty_masuk: newMasuk.qtyMasuk,
        harga_beli: newMasuk.hargaBeli,
        tanggal: newMasuk.tanggal,
      });

      const updatedItem = updatedStokList.find((s) => s.sku === entry.sku);
      if (updatedItem) {
        await supabase.from('bhp_stok_berjalan').upsert({
          sku: updatedItem.sku,
          kategori: updatedItem.kategori,
          nama_bhp: updatedItem.namaBhp,
          satuan: updatedItem.satuan,
          sisa_qty: updatedItem.sisaQty,
          harga_beli_terakhir: updatedItem.hargaBeliTerakhir,
          harga_jual: updatedItem.hargaJual,
          margin: updatedItem.margin,
        });

        const latestJurnal = updatedItem.jurnal[0];
        if (latestJurnal) {
          await supabase.from('bhp_jurnal').insert({
            id: latestJurnal.id,
            sku: updatedItem.sku,
            tanggal: latestJurnal.tanggal,
            jenis: latestJurnal.jenis,
            perubahan_qty: latestJurnal.perubahanQty,
            sisa_qty: latestJurnal.sisaQty,
            keterangan: latestJurnal.keterangan,
          });
        }
      }
    } catch {
      // Local fallback
    }
  }

  return { masuk: newMasuk, updatedStok: updatedStokList };
}

export async function addBhpKeluarEntry(
  entry: Omit<BhpKeluar, 'id' | 'tanggal'>
): Promise<{ keluar: BhpKeluar; updatedStok: StokBerjalanBhp[] }> {
  initCaches();
  const supabase = getSupabaseClient();
  const timestamp = new Date().toISOString();
  const newId = `BK-${Date.now()}`;

  const newKeluar: BhpKeluar = {
    ...entry,
    id: newId,
    tanggal: timestamp,
  };

  const updatedKeluarList = [newKeluar, ...keluarCache];
  saveKeluarCache(updatedKeluarList);

  const existingIndex = stokCache.findIndex((s) => s.sku === entry.sku);
  let updatedStokList = [...stokCache];

  if (existingIndex > -1) {
    const item = updatedStokList[existingIndex];
    const newSisa = Math.max(0, item.sisaQty - entry.qtyKeluar);
    const newJurnal = [
      {
        id: `J-${Date.now()}`,
        tanggal: timestamp,
        jenis: 'Keluar' as const,
        perubahanQty: -entry.qtyKeluar,
        sisaQty: newSisa,
        keterangan: entry.keterangan || 'BHP Keluar (Manual)',
      },
      ...item.jurnal,
    ];

    updatedStokList[existingIndex] = {
      ...item,
      sisaQty: newSisa,
      jurnal: newJurnal,
    };

    saveStokCache(updatedStokList);

    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('bhp_keluar').insert({
          id: newKeluar.id,
          sku: newKeluar.sku,
          kategori: newKeluar.kategori,
          nama_bhp: newKeluar.namaBhp,
          satuan: newKeluar.satuan,
          qty_keluar: newKeluar.qtyKeluar,
          keterangan: newKeluar.keterangan,
          tanggal: newKeluar.tanggal,
        });

        await supabase.from('bhp_stok_berjalan').upsert({
          sku: item.sku,
          kategori: item.kategori,
          nama_bhp: item.namaBhp,
          satuan: item.satuan,
          sisa_qty: newSisa,
          harga_beli_terakhir: item.hargaBeliTerakhir,
          harga_jual: item.hargaJual,
          margin: item.margin,
        });

        const latestJurnal = newJurnal[0];
        if (latestJurnal) {
          await supabase.from('bhp_jurnal').insert({
            id: latestJurnal.id,
            sku: entry.sku,
            tanggal: latestJurnal.tanggal,
            jenis: latestJurnal.jenis,
            perubahan_qty: latestJurnal.perubahanQty,
            sisa_qty: latestJurnal.sisaQty,
            keterangan: latestJurnal.keterangan,
          });
        }
      } catch {
        // Fallback
      }
    }
  }

  return { keluar: newKeluar, updatedStok: updatedStokList };
}

export async function updateBhpStokList(
  newStokList: StokBerjalanBhp[]
): Promise<StokBerjalanBhp[]> {
  initCaches();
  const supabase = getSupabaseClient();
  saveStokCache(newStokList);

  if (supabase && isSupabaseConfigured()) {
    try {
      for (const item of newStokList) {
        await supabase.from('bhp_stok_berjalan').upsert({
          sku: item.sku,
          kategori: item.kategori,
          nama_bhp: item.namaBhp,
          satuan: item.satuan,
          sisa_qty: item.sisaQty,
          harga_beli_terakhir: item.hargaBeliTerakhir,
          harga_jual: item.hargaJual,
          margin: item.margin,
        });

        if (Array.isArray(item.jurnal)) {
          for (const j of item.jurnal) {
            await supabase.from('bhp_jurnal').upsert({
              id: j.id,
              sku: item.sku,
              tanggal: j.tanggal,
              jenis: j.jenis,
              perubahan_qty: j.perubahanQty,
              sisa_qty: j.sisaQty,
              keterangan: j.keterangan,
            });
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  return newStokList;
}

export async function deleteBhpStokEntry(
  sku: string
): Promise<{ updatedStok: StokBerjalanBhp[]; updatedMasuk: BhpMasuk[]; updatedKeluar: BhpKeluar[] }> {
  initCaches();
  const supabase = getSupabaseClient();

  const updatedStok = stokCache.filter((s) => s.sku !== sku);
  const updatedMasuk = masukCache.filter((m) => m.sku !== sku);
  const updatedKeluar = keluarCache.filter((k) => k.sku !== sku);

  saveStokCache(updatedStok);
  saveMasukCache(updatedMasuk);
  saveKeluarCache(updatedKeluar);

  if (supabase && isSupabaseConfigured()) {
    try {
      await Promise.all([
        supabase.from('bhp_stok_berjalan').delete().eq('sku', sku),
        supabase.from('bhp_masuk').delete().eq('sku', sku),
        supabase.from('bhp_keluar').delete().eq('sku', sku),
        supabase.from('bhp_jurnal').delete().eq('sku', sku),
      ]);
    } catch {
      // Fallback
    }
  }

  return { updatedStok, updatedMasuk, updatedKeluar };
}
