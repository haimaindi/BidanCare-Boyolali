/**
 * Service Logic: Manajemen Obat
 * Path: /src/logic/services/manajemenObatService.ts
 * Manages fetching, adding, and updating for Obat Stok Berjalan, Obat Masuk, and Obat Keluar.
 * Integrates with Supabase PostgreSQL when API Keys are configured, with localStorage fallback.
 */

import { StokBerjalan, ObatMasuk, ObatKeluar } from '../../modules/obat/data/dummy.js';
import { DUMMY_STOK_BERJALAN, DUMMY_OBAT_MASUK, DUMMY_OBAT_KELUAR } from '../../modules/obat/data/dummy.js';
import { getLimitForPage } from './fetchingCenter.js';
import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';

const STORAGE_STOK_KEY = 'manajemen_obat_stok_berjalan';
const STORAGE_MASUK_KEY = 'manajemen_obat_masuk';
const STORAGE_KELUAR_KEY = 'manajemen_obat_keluar';

let stokCache: StokBerjalan[] = [];
let masukCache: ObatMasuk[] = [];
let keluarCache: ObatKeluar[] = [];

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
      stokCache = [...DUMMY_STOK_BERJALAN];
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
      masukCache = [...DUMMY_OBAT_MASUK];
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
      keluarCache = [...DUMMY_OBAT_KELUAR];
      saveKeluarCache(keluarCache);
    }
  }
}

function saveStokCache(data: StokBerjalan[]): void {
  stokCache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_STOK_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }
}

function saveMasukCache(data: ObatMasuk[]): void {
  masukCache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_MASUK_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }
}

function saveKeluarCache(data: ObatKeluar[]): void {
  keluarCache = data;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KELUAR_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }
}

export interface FetchObatParams {
  strategy?: 'full' | 'lazy';
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

export async function fetchObatStokBerjalanList(
  params: FetchObatParams = {}
): Promise<{ items: StokBerjalan[]; totalCount: number }> {
  initCaches();
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase.from('obat_stok_berjalan').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`sku.ilike.%${search}%,nama_obat.ilike.%${search}%,nama_merk.ilike.%${search}%`);
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
        const items: StokBerjalan[] = data.map((row: any) => ({
          sku: row.sku,
          namaObat: row.nama_obat || row.namaObat || '',
          namaMerk: row.nama_merk || row.namaMerk || '',
          bentukSediaan: row.bentuk_sediaan || row.bentukSediaan || '',
          dosisSediaan: row.dosis_sediaan || row.dosisSediaan || '',
          sisaQty: Number(row.sisa_qty ?? row.sisaQty ?? 0),
          hargaBeliTerakhir: Number(row.harga_beli_terakhir ?? row.hargaBeliTerakhir ?? 0),
          hargaJual: Number(row.harga_jual ?? row.hargaJual ?? 0),
          margin: Number(row.margin ?? 0),
          jurnal: Array.isArray(row.obat_jurnal)
            ? row.obat_jurnal.map((j: any) => ({
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
      // Fallback to local
    }
  }

  let filtered = stokCache;
  if (search) {
    filtered = stokCache.filter(
      (item) =>
        item.sku.toLowerCase().includes(search) ||
        item.namaObat.toLowerCase().includes(search) ||
        item.namaMerk.toLowerCase().includes(search)
    );
  }

  return { items: filtered, totalCount: filtered.length };
}

export async function fetchObatJurnalBySku(
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
        .from('obat_jurnal')
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

export async function fetchObatMasukList(
  params: FetchObatParams = {}
): Promise<{ items: ObatMasuk[]; totalCount: number }> {
  initCaches();
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase.from('obat_masuk').select('*', { count: 'exact' }).order('tanggal', { ascending: false });

      if (search) {
        query = query.or(`sku.ilike.%${search}%,nama_obat.ilike.%${search}%`);
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
        const items: ObatMasuk[] = data.map((row: any) => ({
          id: row.id,
          sku: row.sku,
          namaObat: row.nama_obat || row.namaObat || '',
          namaMerk: row.nama_merk || row.namaMerk || '',
          bentukSediaan: row.bentuk_sediaan || row.bentukSediaan || '',
          dosisSediaan: row.dosis_sediaan || row.dosisSediaan || '',
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
        item.namaObat.toLowerCase().includes(search)
    );
  }

  return { items: filtered, totalCount: filtered.length };
}

export async function fetchObatKeluarList(
  params: FetchObatParams = {}
): Promise<{ items: ObatKeluar[]; totalCount: number }> {
  initCaches();
  const supabase = getSupabaseClient();
  const search = (params.search || '').trim().toLowerCase();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase.from('obat_keluar').select('*', { count: 'exact' }).order('tanggal', { ascending: false });

      if (search) {
        query = query.or(`sku.ilike.%${search}%,nama_obat.ilike.%${search}%`);
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
        const items: ObatKeluar[] = data.map((row: any) => ({
          id: row.id,
          sku: row.sku,
          namaObat: row.nama_obat || row.namaObat || '',
          namaMerk: row.nama_merk || row.namaMerk || '',
          bentukSediaan: row.bentuk_sediaan || row.bentukSediaan || '',
          dosisSediaan: row.dosis_sediaan || row.dosisSediaan || '',
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
        item.namaObat.toLowerCase().includes(search)
    );
  }

  return { items: filtered, totalCount: filtered.length };
}

export async function addObatMasukEntry(
  entry: Omit<ObatMasuk, 'id' | 'tanggal'>
): Promise<{ masuk: ObatMasuk; updatedStok: StokBerjalan[] }> {
  initCaches();
  const supabase = getSupabaseClient();
  const timestamp = new Date().toISOString();
  const newId = `OM-${Date.now()}`;

  const newMasuk: ObatMasuk = {
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
        keterangan: 'Obat Masuk (Manual)',
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
      namaObat: entry.namaObat,
      namaMerk: entry.namaMerk,
      bentukSediaan: entry.bentukSediaan,
      dosisSediaan: entry.dosisSediaan,
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
          keterangan: 'Stok Awal (Obat Masuk Baru)',
        },
      ],
    });
  }

  saveStokCache(updatedStokList);

  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.from('obat_masuk').insert({
        id: newMasuk.id,
        sku: newMasuk.sku,
        nama_obat: newMasuk.namaObat,
        nama_merk: newMasuk.namaMerk,
        bentuk_sediaan: newMasuk.bentukSediaan,
        dosis_sediaan: newMasuk.dosisSediaan,
        qty_masuk: newMasuk.qtyMasuk,
        harga_beli: newMasuk.hargaBeli,
        tanggal: newMasuk.tanggal,
      });

      const updatedItem = updatedStokList.find((s) => s.sku === entry.sku);
      if (updatedItem) {
        await supabase.from('obat_stok_berjalan').upsert({
          sku: updatedItem.sku,
          nama_obat: updatedItem.namaObat,
          nama_merk: updatedItem.namaMerk,
          bentuk_sediaan: updatedItem.bentukSediaan,
          dosis_sediaan: updatedItem.dosisSediaan,
          sisa_qty: updatedItem.sisaQty,
          harga_beli_terakhir: updatedItem.hargaBeliTerakhir,
          harga_jual: updatedItem.hargaJual,
          margin: updatedItem.margin,
        });

        const latestJurnal = updatedItem.jurnal[0];
        if (latestJurnal) {
          await supabase.from('obat_jurnal').insert({
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

export async function addObatKeluarEntry(
  entry: Omit<ObatKeluar, 'id' | 'tanggal'>
): Promise<{ keluar: ObatKeluar; updatedStok: StokBerjalan[] }> {
  initCaches();
  const supabase = getSupabaseClient();
  const timestamp = new Date().toISOString();
  const newId = `OK-${Date.now()}`;

  const newKeluar: ObatKeluar = {
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
        keterangan: entry.keterangan || 'Obat Keluar (Manual)',
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
        await supabase.from('obat_keluar').insert({
          id: newKeluar.id,
          sku: newKeluar.sku,
          nama_obat: newKeluar.namaObat,
          nama_merk: newKeluar.namaMerk,
          bentuk_sediaan: newKeluar.bentukSediaan,
          dosis_sediaan: newKeluar.dosisSediaan,
          qty_keluar: newKeluar.qtyKeluar,
          keterangan: newKeluar.keterangan,
          tanggal: newKeluar.tanggal,
        });

        await supabase.from('obat_stok_berjalan').upsert({
          sku: item.sku,
          nama_obat: item.namaObat,
          nama_merk: item.namaMerk,
          bentuk_sediaan: item.bentukSediaan,
          dosis_sediaan: item.dosisSediaan,
          sisa_qty: newSisa,
          harga_beli_terakhir: item.hargaBeliTerakhir,
          harga_jual: item.hargaJual,
          margin: item.margin,
        });

        const latestJurnal = newJurnal[0];
        if (latestJurnal) {
          await supabase.from('obat_jurnal').insert({
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

export async function updateObatStokList(
  newStokList: StokBerjalan[]
): Promise<StokBerjalan[]> {
  initCaches();
  const supabase = getSupabaseClient();
  saveStokCache(newStokList);

  if (supabase && isSupabaseConfigured()) {
    try {
      for (const item of newStokList) {
        await supabase.from('obat_stok_berjalan').upsert({
          sku: item.sku,
          nama_obat: item.namaObat,
          nama_merk: item.namaMerk,
          bentuk_sediaan: item.bentukSediaan,
          dosis_sediaan: item.dosisSediaan,
          sisa_qty: item.sisaQty,
          harga_beli_terakhir: item.hargaBeliTerakhir,
          harga_jual: item.hargaJual,
          margin: item.margin,
        });

        if (Array.isArray(item.jurnal)) {
          for (const j of item.jurnal) {
            await supabase.from('obat_jurnal').upsert({
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

export async function deleteObatStokEntry(
  sku: string
): Promise<{ updatedStok: StokBerjalan[]; updatedMasuk: ObatMasuk[]; updatedKeluar: ObatKeluar[] }> {
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
        supabase.from('obat_stok_berjalan').delete().eq('sku', sku),
        supabase.from('obat_masuk').delete().eq('sku', sku),
        supabase.from('obat_keluar').delete().eq('sku', sku),
        supabase.from('obat_jurnal').delete().eq('sku', sku),
      ]);
    } catch {
      // Fallback
    }
  }

  return { updatedStok, updatedMasuk, updatedKeluar };
}
