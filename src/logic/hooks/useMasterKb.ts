/**
 * Hook Logic: useMasterKb
 * Path: /src/logic/hooks/useMasterKb.ts
 * Integrates modular fetching (Strategy 1 / Strategy 2), searching, and CRUD operations for Master KB.
 */

import { useState, useCallback } from 'react';
import { useDataFetching, FetchingStrategy } from './useDataFetching.js';
import {
  fetchMasterKbList,
  createMasterKbItem,
  updateMasterKbItem,
  deleteMasterKbItem,
} from '../services/masterKbService.js';
import { KbMasterData } from '../../modules/master-kb/types.js';

export interface UseMasterKbOptions {
  strategy?: FetchingStrategy;
  autoFetch?: boolean;
}

export function useMasterKb(options: UseMasterKbOptions = {}) {
  const { strategy = 'full', autoFetch = true } = options;
  const [search, setSearch] = useState<string>('');

  const fetcher = useCallback(
    async (params: {
      strategy: FetchingStrategy;
      page: number;
      limit: number;
      offset: number;
    }) => {
      const res = await fetchMasterKbList({
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
  } = useDataFetching<KbMasterData>(fetcher, {
    strategy,
    pageKey: 'MasterKB',
    autoFetch,
  });

  const handleCreate = useCallback(
    async (formData: Omit<KbMasterData, 'id'>) => {
      await createMasterKbItem(formData);
      await refresh();
    },
    [refresh]
  );

  const handleUpdate = useCallback(
    async (id: string, formData: Partial<Omit<KbMasterData, 'id'>>) => {
      await updateMasterKbItem(id, formData);
      await refresh();
    },
    [refresh]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMasterKbItem(id);
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
