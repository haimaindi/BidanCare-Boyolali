/**
 * Hook Logic: useMasterHargaDasar
 * Path: /src/logic/hooks/useMasterHargaDasar.ts
 * Integrates modular fetching, searching, and edit/update operations for Master Harga Dasar.
 * Note: Create and Delete operations are intentionally excluded.
 */

import { useState, useCallback } from 'react';
import { useDataFetching, FetchingStrategy } from './useDataFetching.js';
import {
  fetchMasterHargaDasarList,
  updateMasterHargaDasarItem,
} from '../services/masterHargaDasarService.js';
import { HargaDasar } from '../../modules/master-harga-dasar/types.js';

export interface UseMasterHargaDasarOptions {
  strategy?: FetchingStrategy;
  autoFetch?: boolean;
}

export function useMasterHargaDasar(options: UseMasterHargaDasarOptions = {}) {
  const { strategy = 'full', autoFetch = true } = options;
  const [search, setSearch] = useState<string>('');

  const fetcher = useCallback(
    async (params: {
      strategy: FetchingStrategy;
      page: number;
      limit: number;
      offset: number;
    }) => {
      const res = await fetchMasterHargaDasarList({
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
  } = useDataFetching<HargaDasar>(fetcher, {
    strategy,
    pageKey: 'MasterHargaDasar',
    autoFetch,
  });

  const handleUpdate = useCallback(
    async (id: string, formData: Partial<Omit<HargaDasar, 'id'>>) => {
      await updateMasterHargaDasarItem(id, formData);
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
    updateItem: handleUpdate,
  };
}
