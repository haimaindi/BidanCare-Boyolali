/**
 * Hook Logic: useMasterBroadcast
 * Path: /src/logic/hooks/useMasterBroadcast.ts
 * Integrates modular fetching, searching, and edit/update operations for Master Broadcast.
 * Note: Create and Delete operations are intentionally excluded.
 */

import { useState, useCallback } from 'react';
import { useDataFetching, FetchingStrategy } from './useDataFetching.js';
import {
  fetchMasterBroadcastList,
  updateMasterBroadcastItem,
} from '../services/masterBroadcastService.js';
import { BroadcastConfig } from '../../modules/master-broadcast/types.js';

export interface UseMasterBroadcastOptions {
  strategy?: FetchingStrategy;
  autoFetch?: boolean;
}

export function useMasterBroadcast(options: UseMasterBroadcastOptions = {}) {
  const { strategy = 'full', autoFetch = true } = options;
  const [search, setSearch] = useState<string>('');

  const fetcher = useCallback(
    async (params: {
      strategy: FetchingStrategy;
      page: number;
      limit: number;
      offset: number;
    }) => {
      const res = await fetchMasterBroadcastList({
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
  } = useDataFetching<BroadcastConfig>(fetcher, {
    strategy,
    pageKey: 'MasterBroadcast',
    autoFetch,
  });

  const handleUpdate = useCallback(
    async (id: string, formData: Partial<Omit<BroadcastConfig, 'id'>>) => {
      await updateMasterBroadcastItem(id, formData);
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
