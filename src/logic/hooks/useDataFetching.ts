import { useState, useEffect, useCallback, useRef } from 'react';
import { getLimitForPage } from '../services/fetchingCenter.js';

export type FetchingStrategy = 'full' | 'lazy';

export interface FetchResult<T> {
  items: T[];
  totalCount?: number;
}

export type FetcherFunction<T> = (params: {
  strategy: FetchingStrategy;
  page: number;
  limit: number;
  offset: number;
}) => Promise<FetchResult<T> | T[]>;

export interface UseDataFetchingOptions {
  strategy?: FetchingStrategy;
  pageKey?: string;
  customLimit?: number;
  autoFetch?: boolean;
}

export interface UseDataFetchingReturn<T> {
  data: T[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  page: number;
  limit: number;
  totalCount: number | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Universal Data Fetching Hook
 * Supports Strategy 1 (Full Fetching) and Strategy 2 (Lazy Loading with limits from fetchingCenter.ts)
 */
export function useDataFetching<T = unknown>(
  fetcher: FetcherFunction<T>,
  options: UseDataFetchingOptions = {}
): UseDataFetchingReturn<T> {
  const {
    strategy = 'full',
    pageKey,
    customLimit,
    autoFetch = true,
  } = options;

  const limit = customLimit || (strategy === 'lazy' ? getLimitForPage(pageKey) : 0);

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (targetPage: number, append = false) => {
      if (targetPage === 1) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      setError(null);

      try {
        const offset = (targetPage - 1) * limit;
        const result = await fetcher({
          strategy,
          page: targetPage,
          limit,
          offset,
        });

        if (!isMountedRef.current) return;

        let newItems: T[] = [];
        let fetchedTotal: number | null = null;

        if (Array.isArray(result)) {
          newItems = result;
        } else if (result && Array.isArray(result.items)) {
          newItems = result.items;
          if (typeof result.totalCount === 'number') {
            fetchedTotal = result.totalCount;
          }
        }

        if (strategy === 'full') {
          setData(newItems);
          setHasMore(false);
          setTotalCount(newItems.length);
        } else {
          // Lazy loading strategy
          if (append) {
            setData((prev) => [...prev, ...newItems]);
          } else {
            setData(newItems);
          }

          if (fetchedTotal !== null) {
            setTotalCount(fetchedTotal);
            const loadedSoFar = append ? data.length + newItems.length : newItems.length;
            setHasMore(loadedSoFar < fetchedTotal);
          } else {
            // Fallback: if returned items less than requested limit, assume no more items
            setHasMore(newItems.length >= limit && limit > 0);
          }
        }

        setPage(targetPage);
      } catch (err) {
        if (isMountedRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsFetchingMore(false);
        }
      }
    },
    [fetcher, strategy, limit, data.length]
  );

  const refresh = useCallback(async () => {
    setPage(1);
    await fetchData(1, false);
  }, [fetchData]);

  const loadMore = useCallback(async () => {
    if (strategy === 'lazy' && hasMore && !isLoading && !isFetchingMore) {
      await fetchData(page + 1, true);
    }
  }, [strategy, hasMore, isLoading, isFetchingMore, page, fetchData]);

  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  return {
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
  };
}
