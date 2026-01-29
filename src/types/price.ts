// Types for Gold Price data

export interface GoldPrice {
  id?: string;
  code: string;
  name: string;
  type: string;
  brand: string;
  providerId: string;
  buy: number;
  sell: number;
  buyPrice: number;
  sellPrice: number;
  change?: number;
  changeBuy?: number;
  changeSell?: number;
  changePercent?: number;
  currency: 'VND' | 'USD';
  provider?: string;
  source?: string;
  unit?: string;
  updatedAt?: string;
}

export interface PriceResponse {
  success: boolean;
  data: {
    lastUpdated: string;
    source: string;
    count: number;
    prices: GoldPrice[];
  };
  timestamp: string;
}

export interface PriceHistory {
  timestamp: string;
  buy: number;
  sell: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

export interface PriceHistoryItem {
  timestamp: string;
  buyPrice: number;
  sellPrice: number;
  date?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  change?: number;
  changePercent?: number;
}

export interface PriceHistoryResponse {
  success: boolean;
  data: {
    code: string;
    name: string;
    currency: 'VND' | 'USD';
    period: 'minute' | 'hour' | 'day' | 'week' | 'month';
    history: PriceHistoryItem[];
  };
  meta: {
    from: string;
    to: string;
    count: number;
  };
  timestamp: string;
}

export type PricePeriod = '1d' | '1w' | '1m' | '3m' | '1y';

export interface PriceStatistics {
  high: number;
  low: number;
  average: number;
  volatility: number;
  trend: 'up' | 'down' | 'stable';
}

// Alert types
export interface Alert {
  id: string;
  productName: string;
  providerId: string;
  providerName: string;
  targetPrice: number;
  condition: 'above' | 'below';
  priceType: 'buy' | 'sell';
  isActive: boolean;
  note?: string;
  createdAt: string;
  triggeredAt?: string;
}

// Portfolio types
export interface HoldingItem {
  id: string;
  productName: string;
  providerId: string;
  providerName: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  note?: string;
}

export interface Transaction {
  id: string;
  productName: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  date: string;
  note?: string;
}
