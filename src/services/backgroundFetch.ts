import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { priceApi } from './api/priceApi';
import { storageService, STORAGE_KEYS } from './storageService';

// Task name for background price fetch
export const BACKGROUND_FETCH_TASK = 'GOLD_PRICE_BACKGROUND_FETCH';
const BACKGROUND_FETCH_INTERVAL = 15 * 60; // 15 minutes in seconds

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  console.log('[BackgroundFetch] Running background fetch task');
  
  try {
    // Fetch latest prices
    const prices = await priceApi.getAllPrices();
    
    if (prices && prices.length > 0) {
      // Store prices for widget and offline use
      await storageService.set(STORAGE_KEYS.CACHED_PRICES, prices);
      await storageService.set(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
      
      // Update widget data (native bridge call)
      await updateWidgetData(prices);
      
      console.log('[BackgroundFetch] Successfully fetched and stored', prices.length, 'prices');
      
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundFetch] Error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Update widget data using native bridge
 * This is a placeholder - actual implementation requires native modules
 */
async function updateWidgetData(prices: any[]): Promise<void> {
  try {
    // Find SJC price for widget
    const sjcPrice = prices.find(p => p.code === 'SJC' || p.name?.includes('SJC'));
    const worldPrice = prices.find(p => p.code === 'XAUUSD' || p.name?.includes('XAUUSD'));
    
    const widgetData = {
      sjc: sjcPrice ? {
        buy: sjcPrice.buy,
        sell: sjcPrice.sell,
        change: sjcPrice.buyChange || 0,
        changePercent: sjcPrice.changePercent || 0,
      } : null,
      world: worldPrice ? {
        price: worldPrice.sell || worldPrice.buy,
        change: worldPrice.sellChange || 0,
        changePercent: worldPrice.changePercent || 0,
      } : null,
      lastUpdated: new Date().toISOString(),
    };
    
    // Store widget data for native module access
    await storageService.set(STORAGE_KEYS.WIDGET_DATA, widgetData);
    
    // TODO: Call native module to refresh widget
    // For iOS: WidgetCenter.shared.reloadAllTimelines()
    // For Android: AppWidgetManager.notifyAppWidgetViewDataChanged()
    
    console.log('[BackgroundFetch] Widget data updated');
  } catch (error) {
    console.error('[BackgroundFetch] Error updating widget data:', error);
  }
}

/**
 * Register background fetch task
 */
export async function registerBackgroundFetch(): Promise<boolean> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    
    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
        status === BackgroundFetch.BackgroundFetchStatus.Denied) {
      console.warn('[BackgroundFetch] Background fetch is disabled');
      return false;
    }
    
    // Check if already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: BACKGROUND_FETCH_INTERVAL,
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('[BackgroundFetch] Task registered successfully');
    } else {
      console.log('[BackgroundFetch] Task already registered');
    }
    
    return true;
  } catch (error) {
    console.error('[BackgroundFetch] Error registering task:', error);
    return false;
  }
}

/**
 * Unregister background fetch task
 */
export async function unregisterBackgroundFetch(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      console.log('[BackgroundFetch] Task unregistered');
    }
  } catch (error) {
    console.error('[BackgroundFetch] Error unregistering task:', error);
  }
}

/**
 * Check background fetch status
 */
export async function getBackgroundFetchStatus(): Promise<{
  available: boolean;
  status: string;
  isRegistered: boolean;
}> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    
    let statusString: string;
    let available: boolean;
    
    switch (status) {
      case BackgroundFetch.BackgroundFetchStatus.Available:
        statusString = 'available';
        available = true;
        break;
      case BackgroundFetch.BackgroundFetchStatus.Restricted:
        statusString = 'restricted';
        available = false;
        break;
      case BackgroundFetch.BackgroundFetchStatus.Denied:
        statusString = 'denied';
        available = false;
        break;
      default:
        statusString = 'unknown';
        available = false;
    }
    
    return {
      available,
      status: statusString,
      isRegistered,
    };
  } catch (error) {
    console.error('[BackgroundFetch] Error getting status:', error);
    return {
      available: false,
      status: 'error',
      isRegistered: false,
    };
  }
}

/**
 * Manually trigger a background fetch (for testing)
 */
export async function triggerBackgroundFetch(): Promise<void> {
  console.log('[BackgroundFetch] Manually triggering fetch');
  
  try {
    const prices = await priceApi.getAllPrices();
    
    if (prices && prices.length > 0) {
      await storageService.set(STORAGE_KEYS.CACHED_PRICES, prices);
      await storageService.set(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
      await updateWidgetData(prices);
      
      console.log('[BackgroundFetch] Manual fetch completed');
    }
  } catch (error) {
    console.error('[BackgroundFetch] Manual fetch error:', error);
    throw error;
  }
}

export const backgroundFetchService = {
  register: registerBackgroundFetch,
  unregister: unregisterBackgroundFetch,
  getStatus: getBackgroundFetchStatus,
  trigger: triggerBackgroundFetch,
  TASK_NAME: BACKGROUND_FETCH_TASK,
};

export default backgroundFetchService;
