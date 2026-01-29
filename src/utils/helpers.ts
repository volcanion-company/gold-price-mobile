import { GoldPrice } from '../types';
import { GOLD_CODES, GOLD_CODE_DETAILS, GoldCode } from './constants';

/**
 * Get display name for a gold code
 */
export function getGoldName(code: string): string {
  return GOLD_CODES[code] || code;
}

/**
 * Get category for a gold code
 */
export function getGoldCategory(code: string): string {
  return GOLD_CODE_DETAILS[code as GoldCode]?.category || 'other';
}

/**
 * Sort prices by category priority
 */
export function sortPricesByPriority(prices: GoldPrice[]): GoldPrice[] {
  const categoryOrder = ['international', 'sjc', 'doji', 'pnj', 'other'];
  
  return [...prices].sort((a, b) => {
    const categoryA = getGoldCategory(a.code);
    const categoryB = getGoldCategory(b.code);
    
    const orderA = categoryOrder.indexOf(categoryA);
    const orderB = categoryOrder.indexOf(categoryB);
    
    return orderA - orderB;
  });
}

/**
 * Filter prices by category
 */
export function filterByCategory(prices: GoldPrice[], category: string): GoldPrice[] {
  return prices.filter(price => getGoldCategory(price.code) === category);
}

/**
 * Get price change color based on value
 */
export function getPriceChangeColor(value: number): 'up' | 'down' | 'neutral' {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'neutral';
}

/**
 * Calculate change percentage
 */
export function calculateChangePercent(currentPrice: number, change: number): number {
  if (currentPrice === 0) return 0;
  const previousPrice = currentPrice - change;
  if (previousPrice === 0) return 0;
  return (change / previousPrice) * 100;
}

/**
 * Find best buy price (lowest)
 */
export function findBestBuyPrice(prices: GoldPrice[]): GoldPrice | null {
  if (prices.length === 0) return null;
  
  return prices.reduce((best, current) => {
    if (current.buyPrice > 0 && (best.buyPrice === 0 || current.buyPrice < best.buyPrice)) {
      return current;
    }
    return best;
  });
}

/**
 * Find best sell price (highest)
 */
export function findBestSellPrice(prices: GoldPrice[]): GoldPrice | null {
  if (prices.length === 0) return null;
  
  return prices.reduce((best, current) => {
    if (current.sellPrice > best.sellPrice) {
      return current;
    }
    return best;
  });
}

/**
 * Delay helper for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
