import { Platform, NativeModules } from 'react-native';
import { GoldPrice } from '@/types';

// Native module interface (will be available after rebuild)
interface WidgetDataModule {
  savePrices(pricesJson: string): Promise<boolean>;
  savePrice(
    name: string,
    code: string,
    buyPrice: number,
    sellPrice: number,
    change: number,
    changePercent: number
  ): Promise<boolean>;
  getLastUpdate(): Promise<number>;
  refreshWidgets(): Promise<boolean>;
  clearData(): Promise<boolean>;
}

// Get native module - will be null until native code is rebuilt
const getWidgetDataModule = (): WidgetDataModule | null => {
  if (Platform.OS !== 'android') {
    return null;
  }
  
  try {
    // Try to get from expo-modules
    const ExpoModules = require('expo-modules-core');
    return ExpoModules.requireNativeModule('WidgetData');
  } catch {
    // Try NativeModules fallback
    return NativeModules.WidgetData || null;
  }
};

/**
 * Save gold prices to Android widget SharedPreferences
 * This allows the Android widget to display current gold prices
 */
export const saveWidgetPrices = async (prices: GoldPrice[]): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }

  const module = getWidgetDataModule();
  if (!module) {
    console.log('WidgetData module not available - native rebuild required');
    return false;
  }

  try {
    const pricesData = prices.map(price => ({
      name: price.name,
      code: price.code,
      buyPrice: price.buyPrice,
      sellPrice: price.sellPrice,
      change: price.change,
      changePercent: price.changePercent,
    }));

    return await module.savePrices(JSON.stringify(pricesData));
  } catch (error) {
    console.error('Failed to save widget prices:', error);
    return false;
  }
};

/**
 * Save a single gold price to Android widget
 */
export const saveWidgetPrice = async (price: GoldPrice): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }

  const module = getWidgetDataModule();
  if (!module) {
    console.log('WidgetData module not available - native rebuild required');
    return false;
  }

  try {
    return await module.savePrice(
      price.name,
      price.code,
      price.buyPrice,
      price.sellPrice,
      price.change ?? 0,
      price.changePercent ?? 0
    );
  } catch (error) {
    console.error('Failed to save widget price:', error);
    return false;
  }
};

/**
 * Force refresh all Android widgets
 */
export const refreshWidgets = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }

  const module = getWidgetDataModule();
  if (!module) {
    return false;
  }

  try {
    return await module.refreshWidgets();
  } catch (error) {
    console.error('Failed to refresh widgets:', error);
    return false;
  }
};

/**
 * Get last widget data update timestamp
 */
export const getWidgetLastUpdate = async (): Promise<number> => {
  if (Platform.OS !== 'android') {
    return 0;
  }

  const module = getWidgetDataModule();
  if (!module) {
    return 0;
  }

  try {
    return await module.getLastUpdate();
  } catch (error) {
    console.error('Failed to get widget last update:', error);
    return 0;
  }
};

/**
 * Clear all widget data
 */
export const clearWidgetData = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return false;
  }

  const module = getWidgetDataModule();
  if (!module) {
    return false;
  }

  try {
    return await module.clearData();
  } catch (error) {
    console.error('Failed to clear widget data:', error);
    return false;
  }
};

export default {
  saveWidgetPrices,
  saveWidgetPrice,
  refreshWidgets,
  getWidgetLastUpdate,
  clearWidgetData,
};
