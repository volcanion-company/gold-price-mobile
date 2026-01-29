import { useEffect, useCallback, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { priceApi, GoldCodeInfo } from '../services/api';
import { priceSocket } from '../services/socket/priceSocket';
import { offlineCacheService } from '../services/offlineCacheService';
import { saveWidgetPrices } from '../services/widget/androidWidgetService';
import { usePriceStore } from '../stores';
import { GoldPrice } from '../types';
import { CACHE_TTL, REFRESH_INTERVALS } from '../utils/constants';
import { useNetworkStatus } from './useNetworkStatus';

export function usePrices() {
  const queryClient = useQueryClient();
  const { setPrices, setLoading, setError } = usePriceStore();
  const { isConnected } = useNetworkStatus();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Main query for fetching prices
  const {
    data: prices = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      // If offline, try to get cached data
      if (!isConnected) {
        const cached = await offlineCacheService.getCachedPrices();
        if (cached) {
          setLastUpdated(cached.timestamp);
          setIsFromCache(true);
          return cached.prices;
        }
        throw new Error('Không có kết nối mạng và không có dữ liệu cache');
      }

      // Online: fetch from API
      const data = await priceApi.getAllPrices();
      
      // Cache the prices for offline use
      await offlineCacheService.cachePrices(data);
      // Save to Android widget
      await saveWidgetPrices(data);
      setLastUpdated(new Date().toISOString());
      setIsFromCache(false);
      
      return data;
    },
    staleTime: CACHE_TTL.PRICES,
    refetchInterval: isConnected ? REFRESH_INTERVALS.PRICES : false,
    refetchOnWindowFocus: isConnected,
    retry: isConnected ? 3 : 0,
  });

  // Update store when data changes
  useEffect(() => {
    if (prices.length > 0) {
      setPrices(prices);
    }
  }, [prices, setPrices]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      setError(error.message);
    }
  }, [error, setError]);

  // Subscribe to WebSocket for real-time updates (only when online)
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = priceSocket.subscribe(async (updatedPrices: GoldPrice[]) => {
      // Update React Query cache
      queryClient.setQueryData(['prices'], updatedPrices);
      // Update store
      setPrices(updatedPrices);
      // Cache for offline use
      await offlineCacheService.cachePrices(updatedPrices);
      // Save to Android widget
      await saveWidgetPrices(updatedPrices);
      setLastUpdated(new Date().toISOString());
      setIsFromCache(false);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, setPrices, isConnected]);

  // Load cached data on mount if offline
  useEffect(() => {
    const loadCachedData = async () => {
      if (!isConnected && prices.length === 0) {
        const cached = await offlineCacheService.getCachedPrices();
        if (cached) {
          setPrices(cached.prices);
          setLastUpdated(cached.timestamp);
          setIsFromCache(true);
        }
      }
    };
    loadCachedData();
  }, [isConnected]);

  const refreshPrices = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    prices,
    isLoading,
    isFetching,
    error,
    refetch: refreshPrices,
    lastUpdated,
    isFromCache,
    isOffline: !isConnected,
  };
}

export function usePriceByCode(code: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['price', code],
    queryFn: () => priceApi.getPriceByCode(code),
    staleTime: CACHE_TTL.PRICES,
    enabled: !!code,
  });

  return {
    price: data,
    isLoading,
    error,
  };
}

// Map period shortcuts to API period values
const periodMap: Record<string, 'minute' | 'hour' | 'day' | 'week' | 'month'> = {
  '1d': 'hour',
  '1w': 'day',
  '1m': 'day',
  '3m': 'week',
  '1y': 'month',
};

export type PricePeriod = '1d' | '1w' | '1m' | '3m' | '1y';

export interface PriceHistoryOptions {
  period?: 'minute' | 'hour' | 'day' | 'week' | 'month';
  from?: string;
  to?: string;
  limit?: number;
}

/**
 * Hook to fetch price history
 * @param code - Gold type code (e.g., 'SJC', 'PNJ')
 * @param periodOrOptions - Either a period shortcut ('1d', '1w', '1m', '3m', '1y') or options object
 */
export function usePriceHistory(
  code: string, 
  periodOrOptions?: PricePeriod | PriceHistoryOptions
) {
  // Normalize options
  const options = useMemo(() => {
    if (!periodOrOptions) {
      return { period: 'day' as const };
    }
    if (typeof periodOrOptions === 'string') {
      return { period: periodMap[periodOrOptions] || 'day' };
    }
    return periodOrOptions;
  }, [periodOrOptions]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['priceHistory', code, options],
    queryFn: async () => {
      try {
        const result = await priceApi.getPriceHistory(code, options);
        return result;
      } catch (err: any) {
        console.error('Error fetching price history:', err?.message || err);
        throw err;
      }
    },
    staleTime: CACHE_TTL.HISTORY,
    enabled: !!code,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    history: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch available gold codes
 * Should be called before fetching price history to get the list of available codes
 */
export function useGoldCodes() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['goldCodes'],
    queryFn: () => priceApi.getGoldCodes(),
    staleTime: CACHE_TTL.HISTORY, // Gold codes don't change frequently
    retry: 2,
  });

  return {
    codes: data || [],
    isLoading,
    error,
    refetch,
  };
}
