/**
 * Custom Hook: useLoketObat
 * Path: /src/logic/hooks/useLoketObat.ts
 * Coordinates loading, saving, and active listening for Loket Obat prescriptions.
 */

import { useState, useEffect, useCallback } from 'react';
import { LoketObatEntry } from '../../modules/loket-obat/types.js';
import {
  fetchLoketObatList,
  saveLoketObat,
  updateLoketObatStatus,
  deleteLoketObat,
} from '../services/loketObatService.js';
import { useActiveListening } from './useActiveListening.js';

export function useLoketObat(params: { search?: string; statusFilter?: string } = {}) {
  const [data, setData] = useState<LoketObatEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { search, statusFilter } = params;

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLoketObatList({ search, statusFilter });
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data antrean obat.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // Load list on parameters change
  useEffect(() => {
    loadList();
  }, [loadList]);

  // Realtime Active Listening to loket_obat table
  useActiveListening<LoketObatEntry>(
    { table: 'loket_obat', event: '*' },
    useCallback((payload) => {
      if (payload.eventType === 'INSERT') {
        setData((prev) => {
          const exists = prev.some((item) => item.id === payload.newRecord?.id);
          if (exists) return prev;
          return [payload.newRecord!, ...prev];
        });
      } else if (payload.eventType === 'UPDATE') {
        setData((prev) =>
          prev.map((item) =>
            item.id === payload.newRecord?.id ? { ...item, ...payload.newRecord } : item
          )
        );
      } else if (payload.eventType === 'DELETE') {
        const deletedId = (payload.oldRecord as any)?.id;
        if (deletedId) {
          setData((prev) => prev.filter((item) => item.id !== deletedId));
        }
      }
    }, [])
  );

  // Realtime Active Listening to pendaftaran_pasien changes (to trigger refresh/reactivity if patient statuses change)
  useActiveListening(
    { table: 'pendaftaran_pasien', event: '*' },
    useCallback(() => {
      loadList();
    }, [loadList])
  );

  const save = useCallback(async (entry: Partial<LoketObatEntry> & { id: string }) => {
    setLoading(true);
    setError(null);
    try {
      const saved = await saveLoketObat(entry);
      setData((prev) => {
        const exists = prev.some((item) => item.id === saved.id);
        if (exists) {
          return prev.map((item) => (item.id === saved.id ? saved : item));
        }
        return [saved, ...prev];
      });
      return saved;
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan pesanan obat.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, newStatus: 'Menunggu' | 'Disiapkan' | 'Selesai') => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateLoketObatStatus(id, newStatus);
      setData((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Gagal mengubah status pesanan obat.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteLoketObat(id);
      setData((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err: any) {
      setError(err?.message || 'Gagal menghapus pesanan obat.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    refresh: loadList,
    save,
    updateStatus,
    remove,
  };
}
