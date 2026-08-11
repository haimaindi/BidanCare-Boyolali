/**
 * Hook Logic: useMasterImunisasi
 * Path: /src/logic/hooks/useMasterImunisasi.ts
 * Integrates modular fetching, searching, and CRUD operations for Master Imunisasi.
 */

import { useState, useCallback } from 'react';
import { useDataFetching, FetchingStrategy } from './useDataFetching.js';
import {
  fetchMasterImunisasiList,
  createMasterImunisasiItem,
  updateMasterImunisasiItem,
  deleteMasterImunisasiItem,
} from '../services/masterImunisasiService.js';
import { ImunisasiData } from '../../modules/master-imunisasi/types.js';

export interface UseMasterImunisasiOptions {
  strategy?: FetchingStrategy;
  autoFetch?: boolean;
}

export function useMasterImunisasi(options: UseMasterImunisasiOptions = {}) {
  const { strategy = 'full', autoFetch = true } = options;
  const [search, setSearch] = useState<string>('');

  const fetcher = useCallback(
    async (params: {
      strategy: FetchingStrategy;
      page: number;
      limit: number;
      offset: number;
    }) => {
      const res = await fetchMasterImunisasiList({
        strategy: params.strategy,
        page: params.page,
        limit: params.limit,
        offset: params.offset,
        search,
      });

      return {
        items: res.items,
        totalCount: res.totalCount,
      };
    },
    [search]
  );

  const {
    data,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    page,
    limit,
    totalCount,
    loadMore,
    refresh,
  } = useDataFetching<ImunisasiData>(fetcher, {
    strategy,
    pageKey: 'MasterImunisasi',
    autoFetch,
  });

  const handleCreate = useCallback(
    async (formData: Omit<ImunisasiData, 'id'>) => {
      await createMasterImunisasiItem(formData);
      await refresh();
    },
    [refresh]
  );

  const handleUpdate = useCallback(
    async (id: string, formData: Partial<Omit<ImunisasiData, 'id'>>) => {
      await updateMasterImunisasiItem(id, formData);
      await refresh();
    },
    [refresh]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMasterImunisasiItem(id);
      await refresh();
    },
    [refresh]
  );

  return {
    data,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    page,
    limit,
    totalCount,
    search,
    setSearch,
    loadMore,
    refresh,
    addItem: handleCreate,
    updateItem: handleUpdate,
    deleteItem: handleDelete,
  };
}
