/**
 * Hook Logic: useMasterLayananLain
 * Path: /src/logic/hooks/useMasterLayananLain.ts
 * Integrates modular fetching, searching, and CRUD operations for Master Layanan Lain.
 */

import { useState, useCallback } from 'react';
import { useDataFetching, FetchingStrategy } from './useDataFetching.js';
import {
  fetchMasterLayananLainList,
  createMasterLayananLainItem,
  updateMasterLayananLainItem,
  deleteMasterLayananLainItem,
} from '../services/masterLayananLainService.js';
import { LayananLainData } from '../../modules/master-layanan-lain/types.js';

export interface UseMasterLayananLainOptions {
  strategy?: FetchingStrategy;
  autoFetch?: boolean;
}

export function useMasterLayananLain(options: UseMasterLayananLainOptions = {}) {
  const { strategy = 'full', autoFetch = true } = options;
  const [search, setSearch] = useState<string>('');

  const fetcher = useCallback(
    async (params: {
      strategy: FetchingStrategy;
      page: number;
      limit: number;
      offset: number;
    }) => {
      const res = await fetchMasterLayananLainList({
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
  } = useDataFetching<LayananLainData>(fetcher, {
    strategy,
    pageKey: 'MasterLayananLain',
    autoFetch,
  });

  const handleCreate = useCallback(
    async (formData: Omit<LayananLainData, 'id'>) => {
      await createMasterLayananLainItem(formData);
      await refresh();
    },
    [refresh]
  );

  const handleUpdate = useCallback(
    async (id: string, formData: Partial<Omit<LayananLainData, 'id'>>) => {
      await updateMasterLayananLainItem(id, formData);
      await refresh();
    },
    [refresh]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMasterLayananLainItem(id);
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
