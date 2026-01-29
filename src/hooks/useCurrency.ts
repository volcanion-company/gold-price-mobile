import { useState, useEffect, useCallback } from 'react';
import { currencyService, ExchangeRates } from '../services/currencyService';

interface UseCurrencyReturn {
  // Exchange rates
  rates: ExchangeRates | null;
  usdToVnd: number;
  // Loading state
  isLoading: boolean;
  error: string | null;
  // Actions
  refresh: () => Promise<void>;
  convertUSDToVND: (usd: number) => number;
  convertVNDToUSD: (vnd: number) => number;
  // Formatters
  formatVND: (amount: number) => string;
  formatUSD: (amount: number) => string;
}

// Default rate while loading
const DEFAULT_USD_VND = 24500000;

export const useCurrency = (): UseCurrencyReturn => {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current USD to VND rate (with fallback)
  const usdToVnd = rates?.USD_VND || DEFAULT_USD_VND;

  // Load rates on mount
  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedRates = await currencyService.getExchangeRates();
      setRates(fetchedRates);
    } catch (err) {
      console.error('[useCurrency] Failed to load rates:', err);
      setError('Failed to load exchange rates');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const freshRates = await currencyService.refreshRates();
      setRates(freshRates);
    } catch (err) {
      console.error('[useCurrency] Failed to refresh rates:', err);
      setError('Failed to refresh exchange rates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const convertUSDToVND = useCallback((usd: number): number => {
    return usd * usdToVnd;
  }, [usdToVnd]);

  const convertVNDToUSD = useCallback((vnd: number): number => {
    return vnd / usdToVnd;
  }, [usdToVnd]);

  const formatVND = useCallback((amount: number): string => {
    return currencyService.formatVND(amount);
  }, []);

  const formatUSD = useCallback((amount: number): string => {
    return currencyService.formatUSD(amount);
  }, []);

  return {
    rates,
    usdToVnd,
    isLoading,
    error,
    refresh,
    convertUSDToVND,
    convertVNDToUSD,
    formatVND,
    formatUSD,
  };
};

export default useCurrency;
