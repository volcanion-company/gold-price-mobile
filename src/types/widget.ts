// Widget types

export interface WidgetConfig {
  selectedCodes: string[];
  sortBy: 'default' | 'change' | 'price';
  showChange: boolean;
  showPercent: boolean;
  showSpread: boolean;
  showChart: boolean;
  showTime: boolean;
  theme: 'light' | 'dark' | 'system';
  refreshInterval: 15 | 30 | 60;
}

export interface WidgetData {
  prices: WidgetPriceItem[];
  updatedAt: string;
}

export interface WidgetPriceItem {
  code: string;
  name: string;
  buy: number;
  sell: number;
  changeBuy: number;
  changePercent: number;
  currency: 'VND' | 'USD';
}

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  selectedCodes: ['SJL1L10', 'DOJINHTV'],
  sortBy: 'default',
  showChange: true,
  showPercent: false,
  showSpread: false,
  showChart: false,
  showTime: true,
  theme: 'system',
  refreshInterval: 15,
};
