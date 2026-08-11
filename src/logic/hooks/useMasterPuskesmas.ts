/**
 * Hook Logic: useMasterPuskesmas
 * Path: /src/logic/hooks/useMasterPuskesmas.ts
 * Integrates modular fetching, searching, and CRUD operations for Master Puskesmas.
 */

import { useState, useCallback } from 'react';
import { useDataFetching, FetchingStrategy } from './useDataFetching.js';
import {
  fetchMasterPuskesmasList,
  createMasterPuskesmasItem,
  updateMasterPuskesmasItem,
  deleteMasterPuskesmasItem,
} from '../services/masterPuskesmasService.js';
import { PuskesmasData } from '../../modules/master-puskesmas/types.js';

export interface UseMasterPuskesmasOptions {
  strategy?: FetchingStrategy;
  autoFetch?: boolean;
}

export function useMasterPuskesmas(options: UseMasterPuskesmasOptions = {}) {
  const { strategy = 'full', autoFetch = true } = options;
  const [search, setSearch] = useState<string>('');

  const fetcher = useCallback(
    async (params: {
      strategy: FetchingStrategy;
      page: number;
      limit: number;
      offset: number;
    }) => {
      const res = await fetchMasterPuskesmasList({
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
  } = useDataFetching<PuskesmasData>(fetcher, {
    strategy,
    pageKey: 'MasterPuskesmas',
    autoFetch,
  });

  const handleCreate = useCallback(
    async (formData: Omit<PuskesmasData, 'id'>) => {
      await createMasterPuskesmasItem(formData);
      await refresh();
    },
    [refresh]
  );

  const handleUpdate = useCallback(
    async (id: string, formData: Partial<Omit<PuskesmasData, 'id'>>) => {
      await updateMasterPuskesmasItem(id, formData);
      await refresh();
    },
    [refresh]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMasterPuskesmasItem(id);
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
