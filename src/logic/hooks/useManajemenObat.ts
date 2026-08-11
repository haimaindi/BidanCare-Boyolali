/**
 * Hook Logic: useManajemenObat
 * Path: /src/logic/hooks/useManajemenObat.ts
 * Integrates modular state management, searching, adding, and updating for Manajemen Obat.
 */

import { useState, useCallback, useEffect, SetStateAction } from 'react';
import { StokBerjalan, ObatMasuk, ObatKeluar } from '../../modules/obat/data/dummy.js';
import {
  fetchObatStokBerjalanList,
  fetchObatMasukList,
  fetchObatKeluarList,
  addObatMasukEntry,
  addObatKeluarEntry,
  updateObatStokList,
  deleteObatStokEntry,
} from '../services/manajemenObatService.js';

export function useManajemenObat() {
  const [stokBerjalan, setStokBerjalan] = useState<StokBerjalan[]>([]);
  const [obatMasuk, setObatMasuk] = useState<ObatMasuk[]>([]);
  const [obatKeluar, setObatKeluar] = useState<ObatKeluar[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stokRes, masukRes, keluarRes] = await Promise.all([
        fetchObatStokBerjalanList({ search }),
        fetchObatMasukList({ search }),
        fetchObatKeluarList({ search }),
      ]);
      setStokBerjalan(stokRes.items);
      setObatMasuk(masukRes.items);
      setObatKeluar(keluarRes.items);
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleSetStokBerjalan = useCallback((actionOrValue: SetStateAction<StokBerjalan[]>) => {
    setStokBerjalan((prev) => {
      const next = typeof actionOrValue === 'function' ? actionOrValue(prev) : actionOrValue;
      updateObatStokList(next);
      return next;
    });
  }, []);

  const handleAddObatMasuk = useCallback(
    async (entry: Omit<ObatMasuk, 'id' | 'tanggal'>) => {
      const result = await addObatMasukEntry(entry);
      setObatMasuk((prev) => [result.masuk, ...prev]);
      setStokBerjalan(result.updatedStok);
    },
    []
  );

  const handleAddObatKeluar = useCallback(
    async (entry: Omit<ObatKeluar, 'id' | 'tanggal'>) => {
      const result = await addObatKeluarEntry(entry);
      setObatKeluar((prev) => [result.keluar, ...prev]);
      setStokBerjalan(result.updatedStok);
    },
    []
  );

  const handleDeleteObat = useCallback(async (sku: string) => {
    const result = await deleteObatStokEntry(sku);
    setStokBerjalan(result.updatedStok);
    setObatMasuk(result.updatedMasuk);
    setObatKeluar(result.updatedKeluar);
  }, []);

  return {
    stokBerjalan,
    setStokBerjalan: handleSetStokBerjalan,
    obatMasuk,
    setObatMasuk,
    obatKeluar,
    setObatKeluar,
    isLoading,
    search,
    setSearch,
    refreshAll,
    addObatMasuk: handleAddObatMasuk,
    addObatKeluar: handleAddObatKeluar,
    deleteObat: handleDeleteObat,
  };
}
