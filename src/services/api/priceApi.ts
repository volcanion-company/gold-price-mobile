import apiClient from './client';
import { GoldPrice, PriceResponse, PriceHistoryResponse, PriceHistoryItem } from '../../types';

/**
 * Transform API response to ensure buyPrice/sellPrice are populated
 * API returns 'buy' and 'sell', but components use 'buyPrice' and 'sellPrice'
 */
function transformPrice(price: any): GoldPrice {
  return {
    ...price,
    buyPrice: price.buyPrice ?? price.buy ?? 0,
    sellPrice: price.sellPrice ?? price.sell ?? 0,
    buy: price.buy ?? price.buyPrice ?? 0,
    sell: price.sell ?? price.sellPrice ?? 0,
  };
}

function transformPrices(prices: any[]): GoldPrice[] {
  return prices.map(transformPrice);
}

export interface PriceStatistics {
  code: string;
  period: string;
  buy: {
    current: number;
    min: number;
    max: number;
    avg: number;
    change: number;
    changePercent: number;
  };
  sell: {
    current: number;
    min: number;
    max: number;
    avg: number;
    change: number;
    changePercent: number;
  };
}

export interface PriceComparison {
  prices: GoldPrice[];
  bestBuy: { code: string; price: number };
  bestSell: { code: string; price: number };
  spread: Record<string, number>;
}

export interface GoldCodeInfo {
  code: string;
  name: string;
  currency: 'VND' | 'USD';
}

export interface GoldCodesResponse {
  count: number;
  codes: GoldCodeInfo[];
}

export const priceApi = {
  /**
   * Get list of available gold codes
   */
  async getGoldCodes(): Promise<GoldCodeInfo[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: GoldCodesResponse;
    }>('/prices/codes');
    return response.data.data.codes;
  },

  /**
   * Get all current gold prices
   */
  async getAllPrices(currency?: 'VND' | 'USD'): Promise<GoldPrice[]> {
    const params = currency ? { currency } : {};
    const response = await apiClient.get<PriceResponse>('/prices', { params });
    return transformPrices(response.data.data.prices);
  },

  /**
   * Get price by code
   */
  async getPriceByCode(code: string): Promise<GoldPrice> {
    const response = await apiClient.get<{ success: boolean; data: GoldPrice }>(`/prices/${code}`);
    return transformPrice(response.data.data);
  },

  /**
   * Get multiple prices by codes
   */
  async getPricesByCodes(codes: string[]): Promise<GoldPrice[]> {
    const response = await apiClient.get<PriceResponse>('/prices', {
      params: { codes: codes.join(',') },
    });
    return transformPrices(response.data.data.prices);
  },

  /**
   * Get price history
   */
  async getPriceHistory(
    code: string,
    options?: {
      period?: 'minute' | 'hour' | 'day' | 'week' | 'month';
      from?: string;
      to?: string;
      limit?: number;
    }
  ): Promise<PriceHistoryItem[]> {
    const response = await apiClient.get<PriceHistoryResponse>(`/prices/${code}/history`, {
      params: options,
    });
    
    // Transform API response to match expected format
    // API returns: { buy, sell, recordedAt } 
    // Components expect: { buyPrice, sellPrice, timestamp }
    return response.data.data.history.map((item: any) => ({
      ...item,
      buyPrice: item.buyPrice ?? item.buy ?? 0,
      sellPrice: item.sellPrice ?? item.sell ?? 0,
      timestamp: item.timestamp ?? item.recordedAt ?? item.date ?? new Date().toISOString(),
    }));
  },

  /**
   * Get price statistics
   */
  async getPriceStatistics(code: string, days: number = 30): Promise<PriceStatistics> {
    const response = await apiClient.get<{ success: boolean; data: PriceStatistics }>(
      `/prices/${code}/statistics`,
      { params: { days } }
    );
    return response.data.data;
  },

  /**
   * Compare prices between different gold types
   */
  async comparePrices(codes?: string[]): Promise<PriceComparison> {
    const params = codes ? { codes: codes.join(',') } : {};
    const response = await apiClient.get<{ success: boolean; data: PriceComparison }>(
      '/prices/compare',
      { params }
    );
    return response.data.data;
  },

  /**
   * Manually trigger a price refresh from external sources
   */
  async refreshPrices(): Promise<{ message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/prices/refresh');
    return { message: response.data.message };
  },
};
