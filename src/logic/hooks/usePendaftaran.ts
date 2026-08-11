/**
 * Custom Hook: Pendaftaran Pasien (Offline & Online Queue)
 * Path: /src/logic/hooks/usePendaftaran.ts
 */

import { useState, useEffect, useCallback } from 'react';
import {
  RegistrationRecord,
  FetchPendaftaranParams,
  fetchPendaftaranList,
  createRegistration,
  updateRegistrationStatus,
  deleteRegistration,
  RegisterPatientInput,
} from '../services/pendaftaranService.js';
import { realtimeService } from '../services/realtimeService.js';

export function usePendaftaran(initialParams: FetchPendaftaranParams = {}) {
  const { search: initSearch = '', statusFilter: initStatusFilter = 'All', sumberFilter: initSumberFilter = 'All' } = initialParams;
  const [items, setItems] = useState<RegistrationRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(initSearch);
  const [statusFilter, setStatusFilter] = useState<string>(initStatusFilter);
  const [sumberFilter, setSumberFilter] = useState<'Online' | 'Offline' | 'All'>(initSumberFilter);

  useEffect(() => {
    setSearchQuery(initSearch);
  }, [initSearch]);

  useEffect(() => {
    setStatusFilter(initStatusFilter);
  }, [initStatusFilter]);

  useEffect(() => {
    setSumberFilter(initSumberFilter);
  }, [initSumberFilter]);

  const loadData = useCallback(async (customParams?: FetchPendaftaranParams, silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const mergedParams: FetchPendaftaranParams = {
        search: searchQuery,
        statusFilter,
        sumberFilter,
        ...customParams,
      };
      const res = await fetchPendaftaranList(mergedParams);
      setItems(res.items);
      setTotalCount(res.totalCount);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data pendaftaran.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, sumberFilter]);

  useEffect(() => {
    loadData();
    const unsubscribe = realtimeService.subscribeTable(
      { table: 'pendaftaran_pasien' },
      () => {
        loadData(undefined, true);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [loadData]);

  const registerNewPatient = useCallback(
    async (input: RegisterPatientInput) => {
      const created = await createRegistration(input);
      await loadData();
      return created;
    },
    [loadData]
  );

  const changeStatus = useCallback(
    async (id: string, newStatus: 'Menunggu' | 'Menunggu Check-In' | 'Diperiksa' | 'Selesai' | 'Batal') => {
      const updated = await updateRegistrationStatus(id, newStatus);
      await loadData();
      return updated;
    },
    [loadData]
  );

  const removeRegistration = useCallback(
    async (id: string) => {
      const success = await deleteRegistration(id);
      await loadData();
      return success;
    },
    [loadData]
  );

  return {
    items,
    totalCount,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sumberFilter,
    setSumberFilter,
    reload: loadData,
    registerNewPatient,
    changeStatus,
    removeRegistration,
  };
}
