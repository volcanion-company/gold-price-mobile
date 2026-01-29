// App constants

// Environment-based configuration
// Lấy IP từ biến môi trường hoặc sử dụng localhost cho development
const DEV_API_HOST = process.env.EXPO_PUBLIC_API_HOST || '192.168.10.126';
const DEV_API_PORT = process.env.EXPO_PUBLIC_API_PORT || '3000';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (
  __DEV__ 
    ? `http://${DEV_API_HOST}:${DEV_API_PORT}/v1`
    : 'https://api.goldprice.app/v1'
);

export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || (
  __DEV__
    ? `http://${DEV_API_HOST}:${DEV_API_PORT}`
    : 'https://api.goldprice.app'
);

// API Configuration
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  socketURL: WS_URL,
  timeout: 10000,
  retryAttempts: 3,
};

// Gold code name mappings (for display)
export const GOLD_CODES: Record<string, string> = {
  // International
  XAUUSD: 'Vàng Thế Giới (XAU/USD)',
  
  // SJC
  SJL1L10: 'SJC 9999 (1L-10L)',
  SJC5C: 'SJC 5 chỉ',
  SJC2C: 'SJC 2 chỉ',
  SJC1C: 'SJC 1 chỉ',
  
  // DOJI
  DOJINHTV: 'DOJI Nữ trang 99.99',
  DOHNL: 'DOJI Hà Nội',
  DOHCML: 'DOJI HCM',
  
  // PNJ
  PNJNTV: 'PNJ Nữ trang 99.99',
  PNJSJC: 'PNJ SJC',
  PNJL1L: 'PNJ 1L-10L',
  
  // Others
  BTSJC: 'Bảo Tín Minh Châu SJC',
  BTNTV: 'Bảo Tín Minh Châu Nữ trang',
  PHUQUY: 'Phú Quý',
  MIHOS99: 'Minh Hoàng 99.99',
};

// Gold code details (for filtering and categorization)
export const GOLD_CODE_DETAILS = {
  XAUUSD: { currency: 'USD' as const, category: 'international' },
  SJL1L10: { currency: 'VND' as const, category: 'sjc' },
  SJC5C: { currency: 'VND' as const, category: 'sjc' },
  SJC2C: { currency: 'VND' as const, category: 'sjc' },
  SJC1C: { currency: 'VND' as const, category: 'sjc' },
  DOJINHTV: { currency: 'VND' as const, category: 'doji' },
  DOHNL: { currency: 'VND' as const, category: 'doji' },
  DOHCML: { currency: 'VND' as const, category: 'doji' },
  PNJNTV: { currency: 'VND' as const, category: 'pnj' },
  PNJSJC: { currency: 'VND' as const, category: 'pnj' },
  PNJL1L: { currency: 'VND' as const, category: 'pnj' },
  BTSJC: { currency: 'VND' as const, category: 'other' },
  BTNTV: { currency: 'VND' as const, category: 'other' },
  PHUQUY: { currency: 'VND' as const, category: 'other' },
  MIHOS99: { currency: 'VND' as const, category: 'other' },
} as const;

export type GoldCode = keyof typeof GOLD_CODE_DETAILS;

// Default selected codes for widget
export const DEFAULT_WIDGET_CODES: string[] = ['SJL1L10', 'DOJINHTV'];

// Currency conversion
// Note: In production, this should be fetched from an API
export const EXCHANGE_RATES = {
  USD_VND: 24500000, // 1 USD = 24,500,000 VND (approximate for gold ounce to luong conversion)
};

// Cache TTL (in milliseconds)
export const CACHE_TTL = {
  PRICES: 30 * 1000, // 30 seconds
  HISTORY: 5 * 60 * 1000, // 5 minutes
};

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  PRICES: 60 * 1000, // 1 minute
  WIDGET: 15 * 60 * 1000, // 15 minutes
};

// Colors
export const COLORS = {
  // Primary colors (Gold)
  primary: '#D4AF37',
  primaryLight: '#F4E4A6',
  primaryDark: '#8B7355',
  
  // Neutral colors
  gray: '#9ca3af',
  
  gold: {
    50: '#FFF9E6',
    100: '#FFF0B3',
    200: '#FFE680',
    300: '#FFD94D',
    400: '#FFCC1A',
    500: '#E6B800',
    600: '#B38F00',
    700: '#806600',
    800: '#4D3D00',
    900: '#1A1400',
  },
  up: {
    light: '#E8F5E9',
    main: '#4CAF50',
    dark: '#2E7D32',
  },
  down: {
    light: '#FFEBEE',
    main: '#F44336',
    dark: '#C62828',
  },
};
