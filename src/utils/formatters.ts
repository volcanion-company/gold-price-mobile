import numeral from 'numeral';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format price number based on currency
 */
export function formatPrice(value: number, currency: 'VND' | 'USD' = 'VND'): string {
  if (value == null || isNaN(value)) {
    return currency === 'USD' ? '$--' : '--₫';
  }
  
  if (currency === 'USD') {
    return numeral(value).format('$0,0.00');
  }
  
  // For VND, show in millions for better readability
  if (value >= 1000000) {
    return numeral(value / 1000000).format('0,0.00') + 'M';
  }
  
  return numeral(value).format('0,0') + '₫';
}

/**
 * Format price for display with full number
 */
export function formatPriceFull(value: number, currency: 'VND' | 'USD' = 'VND'): string {
  if (currency === 'USD') {
    return numeral(value).format('$0,0.00');
  }
  
  return numeral(value).format('0,0') + ' ₫';
}

/**
 * Format price change with sign and color indicator
 */
export function formatPriceChange(value: number, currency: 'VND' | 'USD' = 'VND'): string {
  const sign = value >= 0 ? '+' : '';
  
  if (currency === 'USD') {
    return `${sign}${numeral(value).format('0,0.00')}`;
  }
  
  if (Math.abs(value) >= 1000) {
    return `${sign}${numeral(value / 1000).format('0,0')}K`;
  }
  
  return `${sign}${numeral(value).format('0,0')}`;
}

/**
 * Format percentage change
 */
export function formatPercentChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${numeral(value).format('0.00')}%`;
}

/**
 * Format date/time for display
 */
export function formatDateTime(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'HH:mm:ss - dd/MM/yyyy', { locale: vi });
}

/**
 * Format time only
 */
export function formatTime(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'HH:mm', { locale: vi });
}

/**
 * Format date only
 */
export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'dd/MM/yyyy', { locale: vi });
}

/**
 * Format relative time (e.g., "5 phút trước")
 */
export function formatRelativeTime(dateString: string): string {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: vi });
}

/**
 * Format spread (buy-sell difference)
 */
export function formatSpread(buy: number, sell: number, currency: 'VND' | 'USD' = 'VND'): string {
  const spread = sell - buy;
  return formatPrice(spread, currency);
}

/**
 * Format date short (e.g., "25/12")
 */
export function formatDateShort(dateString: string): string {
  const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
  return format(date, 'dd/MM', { locale: vi });
}

/**
 * Format price short (e.g., "8.2M")
 */
export function formatPriceShort(value: number): string {
  if (value >= 1000000000) {
    return numeral(value / 1000000000).format('0.0') + 'B';
  }
  if (value >= 1000000) {
    return numeral(value / 1000000).format('0.0') + 'M';
  }
  if (value >= 1000) {
    return numeral(value / 1000).format('0.0') + 'K';
  }
  return numeral(value).format('0,0');
}

/**
 * Format percent (e.g., "12.5%")
 */
export function formatPercent(value: number): string {
  return numeral(value).format('0.00') + '%';
}
