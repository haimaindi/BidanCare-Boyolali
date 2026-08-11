/**
 * Hook Logic: useMasterUser
 * Path: /src/logic/hooks/useMasterUser.ts
 * Integrates modular fetching, searching, and CRUD operations for Master User.
 */

import { useState, useCallback } from 'react';
import { useDataFetching, FetchingStrategy } from './useDataFetching.js';
import {
  fetchMasterUserList,
  createMasterUserItem,
  updateMasterUserItem,
  deleteMasterUserItem,
} from '../services/masterUserService.js';
import { User } from '../../modules/master-user/types.js';

export interface UseMasterUserOptions {
  strategy?: FetchingStrategy;
  autoFetch?: boolean;
}

export function useMasterUser(options: UseMasterUserOptions = {}) {
  const { strategy = 'full', autoFetch = true } = options;
  const [search, setSearch] = useState<string>('');

  const fetcher = useCallback(
    async (params: {
      strategy: FetchingStrategy;
      page: number;
      limit: number;
      offset: number;
    }) => {
      const res = await fetchMasterUserList({
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
  } = useDataFetching<User>(fetcher, {
    strategy,
    pageKey: 'MasterUser',
    autoFetch,
  });

  const handleCreate = useCallback(
    async (formData: Omit<User, 'id' | 'createdAt'>) => {
      await createMasterUserItem(formData);
      await refresh();
    },
    [refresh]
  );

  const handleUpdate = useCallback(
    async (id: string, formData: Partial<Omit<User, 'id' | 'createdAt'>>) => {
      await updateMasterUserItem(id, formData);
      await refresh();
    },
    [refresh]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMasterUserItem(id);
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
