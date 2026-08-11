/**
 * Hook Logic: useManajemenBhp
 * Path: /src/logic/hooks/useManajemenBhp.ts
 * Integrates modular state management, searching, adding, and updating for Manajemen BHP.
 */

import { useState, useCallback, useEffect, SetStateAction } from 'react';
import { StokBerjalanBhp, BhpMasuk, BhpKeluar } from '../../modules/bhp/data/dummy.js';
import {
  fetchBhpStokBerjalanList,
  fetchBhpMasukList,
  fetchBhpKeluarList,
  addBhpMasukEntry,
  addBhpKeluarEntry,
  updateBhpStokList,
  deleteBhpStokEntry,
} from '../services/manajemenBhpService.js';

export function useManajemenBhp() {
  const [stokBerjalan, setStokBerjalan] = useState<StokBerjalanBhp[]>([]);
  const [bhpMasuk, setBhpMasuk] = useState<BhpMasuk[]>([]);
  const [bhpKeluar, setBhpKeluar] = useState<BhpKeluar[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stokRes, masukRes, keluarRes] = await Promise.all([
        fetchBhpStokBerjalanList({ search }),
        fetchBhpMasukList({ search }),
        fetchBhpKeluarList({ search }),
      ]);
      setStokBerjalan(stokRes.items);
      setBhpMasuk(masukRes.items);
      setBhpKeluar(keluarRes.items);
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleSetStokBerjalan = useCallback((actionOrValue: SetStateAction<StokBerjalanBhp[]>) => {
    setStokBerjalan((prev) => {
      const next = typeof actionOrValue === 'function' ? actionOrValue(prev) : actionOrValue;
      updateBhpStokList(next);
      return next;
    });
  }, []);

  const handleAddBhpMasuk = useCallback(
    async (entry: Omit<BhpMasuk, 'id' | 'tanggal'>) => {
      const result = await addBhpMasukEntry(entry);
      setBhpMasuk((prev) => [result.masuk, ...prev]);
      setStokBerjalan(result.updatedStok);
    },
    []
  );

  const handleAddBhpKeluar = useCallback(
    async (entry: Omit<BhpKeluar, 'id' | 'tanggal'>) => {
      const result = await addBhpKeluarEntry(entry);
      setBhpKeluar((prev) => [result.keluar, ...prev]);
      setStokBerjalan(result.updatedStok);
    },
    []
  );

  const handleDeleteBhp = useCallback(async (sku: string) => {
    const result = await deleteBhpStokEntry(sku);
    setStokBerjalan(result.updatedStok);
    setBhpMasuk(result.updatedMasuk);
    setBhpKeluar(result.updatedKeluar);
  }, []);

  return {
    stokBerjalan,
    setStokBerjalan: handleSetStokBerjalan,
    bhpMasuk,
    setBhpMasuk,
    bhpKeluar,
    setBhpKeluar,
    isLoading,
    search,
    setSearch,
    refreshAll,
    addBhpMasuk: handleAddBhpMasuk,
    addBhpKeluar: handleAddBhpKeluar,
    deleteBhp: handleDeleteBhp,
  };
}
