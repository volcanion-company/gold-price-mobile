import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api/client';

const EXCHANGE_RATE_KEY = '@exchange_rates';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export interface ExchangeRates {
  USD_VND: number;
  lastUpdated: string;
}

interface CachedRates {
  rates: ExchangeRates;
  cachedAt: number;
}

// Default rates (fallback)
const DEFAULT_RATES: ExchangeRates = {
  USD_VND: 24500000, // 1 USD = 24,500,000 VND
  lastUpdated: new Date().toISOString(),
};

/**
 * Currency Service for managing exchange rates
 */
export const currencyService = {
  /**
   * Get current exchange rates (with caching)
   */
  async getExchangeRates(): Promise<ExchangeRates> {
    try {
      // Check cache first
      const cached = await this.getCachedRates();
      if (cached && !this.isCacheExpired(cached.cachedAt)) {
        return cached.rates;
      }

      // Fetch fresh rates from API
      const freshRates = await this.fetchRatesFromAPI();
      
      // Cache the new rates
      await this.cacheRates(freshRates);
      
      return freshRates;
    } catch (error) {
      console.error('[CurrencyService] Error getting exchange rates:', error);
      
      // Try to return cached data even if expired
      const cached = await this.getCachedRates();
      if (cached) {
        return cached.rates;
      }
      
      // Return default rates as last resort
      return DEFAULT_RATES;
    }
  },

  /**
   * Fetch exchange rates from API
   */
  async fetchRatesFromAPI(): Promise<ExchangeRates> {
    try {
      // Try to get from our backend first
      const response = await apiClient.get('/exchange-rates');
      
      if (response.data?.data?.USD_VND) {
        return {
          USD_VND: response.data.data.USD_VND,
          lastUpdated: response.data.data.lastUpdated || new Date().toISOString(),
        };
      }
    } catch (error) {
      console.log('[CurrencyService] Backend API failed, trying fallback...');
    }

    // Fallback: Try public exchange rate API
    try {
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD'
      );
      const data = await response.json();
      
      if (data?.rates?.VND) {
        return {
          USD_VND: data.rates.VND,
          lastUpdated: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.log('[CurrencyService] Public API failed:', error);
    }

    // Return default rates
    return DEFAULT_RATES;
  },

  /**
   * Get USD to VND rate
   */
  async getUSDToVND(): Promise<number> {
    const rates = await this.getExchangeRates();
    return rates.USD_VND;
  },

  /**
   * Convert USD to VND
   */
  async convertUSDToVND(usdAmount: number): Promise<number> {
    const rate = await this.getUSDToVND();
    return usdAmount * rate;
  },

  /**
   * Convert VND to USD
   */
  async convertVNDToUSD(vndAmount: number): Promise<number> {
    const rate = await this.getUSDToVND();
    return vndAmount / rate;
  },

  /**
   * Get cached rates
   */
  async getCachedRates(): Promise<CachedRates | null> {
    try {
      const cached = await AsyncStorage.getItem(EXCHANGE_RATE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('[CurrencyService] Error reading cache:', error);
    }
    return null;
  },

  /**
   * Cache rates
   */
  async cacheRates(rates: ExchangeRates): Promise<void> {
    try {
      const cacheData: CachedRates = {
        rates,
        cachedAt: Date.now(),
      };
      await AsyncStorage.setItem(EXCHANGE_RATE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('[CurrencyService] Error caching rates:', error);
    }
  },

  /**
   * Check if cache is expired
   */
  isCacheExpired(cachedAt: number): boolean {
    return Date.now() - cachedAt > CACHE_DURATION;
  },

  /**
   * Force refresh rates
   */
  async refreshRates(): Promise<ExchangeRates> {
    const freshRates = await this.fetchRatesFromAPI();
    await this.cacheRates(freshRates);
    return freshRates;
  },

  /**
   * Format currency
   */
  formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  },

  formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },
};

export default currencyService;
