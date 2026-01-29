import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { GoldPrice } from '../types';
import { storageService, STORAGE_KEYS } from './storageService';

// Queue keys
const OFFLINE_QUEUE_KEY = '@offline_action_queue';

export interface OfflineAction {
  id: string;
  type: 'CREATE_ALERT' | 'UPDATE_ALERT' | 'DELETE_ALERT' | 'ADD_HOLDING' | 'UPDATE_HOLDING' | 'DELETE_HOLDING';
  payload: any;
  timestamp: number;
  retryCount: number;
}

export interface CachedPriceData {
  prices: GoldPrice[];
  timestamp: string;
  source: 'api' | 'websocket' | 'cache';
}

/**
 * Offline Cache Service
 * Handles caching prices and queuing actions for offline mode
 */
export const offlineCacheService = {
  /**
   * Cache prices for offline use
   */
  async cachePrices(prices: GoldPrice[]): Promise<void> {
    try {
      const cacheData: CachedPriceData = {
        prices,
        timestamp: new Date().toISOString(),
        source: 'api',
      };
      await storageService.set(STORAGE_KEYS.CACHED_PRICES, cacheData);
      await storageService.set(STORAGE_KEYS.LAST_UPDATED, cacheData.timestamp);
    } catch (error) {
      console.error('[OfflineCache] Failed to cache prices:', error);
    }
  },

  /**
   * Get cached prices
   */
  async getCachedPrices(): Promise<CachedPriceData | null> {
    try {
      return await storageService.get<CachedPriceData>(STORAGE_KEYS.CACHED_PRICES);
    } catch (error) {
      console.error('[OfflineCache] Failed to get cached prices:', error);
      return null;
    }
  },

  /**
   * Get last updated timestamp
   */
  async getLastUpdated(): Promise<string | null> {
    try {
      return await storageService.get<string>(STORAGE_KEYS.LAST_UPDATED);
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if cache is stale (older than maxAge in milliseconds)
   */
  async isCacheStale(maxAgeMs: number = 5 * 60 * 1000): Promise<boolean> {
    const lastUpdated = await this.getLastUpdated();
    if (!lastUpdated) return true;

    const cacheAge = Date.now() - new Date(lastUpdated).getTime();
    return cacheAge > maxAgeMs;
  },

  /**
   * Add action to offline queue
   */
  async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const queue = await this.getQueue();
      const newAction: OfflineAction = {
        ...action,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      };
      queue.push(newAction);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log('[OfflineCache] Action queued:', newAction.type);
    } catch (error) {
      console.error('[OfflineCache] Failed to queue action:', error);
    }
  },

  /**
   * Get offline action queue
   */
  async getQueue(): Promise<OfflineAction[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[OfflineCache] Failed to get queue:', error);
      return [];
    }
  },

  /**
   * Remove action from queue
   */
  async removeFromQueue(actionId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const filteredQueue = queue.filter(action => action.id !== actionId);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filteredQueue));
    } catch (error) {
      console.error('[OfflineCache] Failed to remove from queue:', error);
    }
  },

  /**
   * Update action retry count
   */
  async updateRetryCount(actionId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const updatedQueue = queue.map(action => {
        if (action.id === actionId) {
          return { ...action, retryCount: action.retryCount + 1 };
        }
        return action;
      });
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('[OfflineCache] Failed to update retry count:', error);
    }
  },

  /**
   * Clear queue
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (error) {
      console.error('[OfflineCache] Failed to clear queue:', error);
    }
  },

  /**
   * Get queue count
   */
  async getQueueCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  },

  /**
   * Process queued actions when back online
   * This should be called when network connection is restored
   */
  async processQueue(
    handlers: {
      [key in OfflineAction['type']]?: (payload: any) => Promise<boolean>;
    }
  ): Promise<{ success: number; failed: number }> {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      console.log('[OfflineCache] Still offline, cannot process queue');
      return { success: 0, failed: 0 };
    }

    const queue = await this.getQueue();
    let success = 0;
    let failed = 0;

    for (const action of queue) {
      const handler = handlers[action.type];
      if (!handler) {
        console.warn('[OfflineCache] No handler for action type:', action.type);
        continue;
      }

      try {
        const result = await handler(action.payload);
        if (result) {
          await this.removeFromQueue(action.id);
          success++;
          console.log('[OfflineCache] Action processed successfully:', action.type);
        } else {
          await this.updateRetryCount(action.id);
          failed++;
        }
      } catch (error) {
        console.error('[OfflineCache] Failed to process action:', action.type, error);
        await this.updateRetryCount(action.id);
        
        // Remove action if too many retries
        if (action.retryCount >= 3) {
          await this.removeFromQueue(action.id);
          console.log('[OfflineCache] Action removed after max retries:', action.type);
        }
        failed++;
      }
    }

    return { success, failed };
  },

  /**
   * Clear all cached data
   */
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        storageService.remove(STORAGE_KEYS.CACHED_PRICES),
        storageService.remove(STORAGE_KEYS.LAST_UPDATED),
        this.clearQueue(),
      ]);
    } catch (error) {
      console.error('[OfflineCache] Failed to clear all:', error);
    }
  },
};
