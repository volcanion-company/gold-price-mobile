import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  ALERTS: '@gold_price_alerts',
  HOLDINGS: '@gold_price_holdings',
  TRANSACTIONS: '@gold_price_transactions',
  THEME: '@theme_preference',
  LANGUAGE: '@app_language',
  PUSH_TOKEN: '@push_token',
  USER: '@user_data',
  AUTH_TOKENS: '@auth_tokens',
  FAVORITES: '@favorite_products',
  SETTINGS: '@app_settings',
  CACHED_PRICES: '@cached_prices',
  LAST_SYNC: '@last_sync',
  WIDGET_DATA: '@widget_data',
  LAST_UPDATED: '@last_updated',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Storage service for managing AsyncStorage operations
 */
export const storageService = {
  /**
   * Get item from storage
   */
  async get<T>(key: StorageKey): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return null;
    }
  },

  /**
   * Set item in storage
   */
  async set<T>(key: StorageKey, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
      throw error;
    }
  },

  /**
   * Remove item from storage
   */
  async remove(key: StorageKey): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get multiple items from storage
   */
  async getMultiple<T extends Record<string, any>>(keys: StorageKey[]): Promise<Partial<T>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};
      
      pairs.forEach(([key, value]) => {
        if (value) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });
      
      return result as Partial<T>;
    } catch (error) {
      console.error('Failed to get multiple items:', error);
      return {};
    }
  },

  /**
   * Set multiple items in storage
   */
  async setMultiple(items: [StorageKey, any][]): Promise<void> {
    try {
      const pairs = items.map(([key, value]) => [key, JSON.stringify(value)] as [string, string]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Failed to set multiple items:', error);
      throw error;
    }
  },

  /**
   * Remove multiple items from storage
   */
  async removeMultiple(keys: StorageKey[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Failed to remove multiple items:', error);
      throw error;
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  },

  /**
   * Get all storage keys
   */
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  },

  /**
   * Calculate storage size (approximate)
   */
  async getStorageSize(): Promise<{ size: number; sizeFormatted: string }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet([...keys]);
      
      let totalSize = 0;
      pairs.forEach(([key, value]) => {
        totalSize += (key?.length || 0) + (value?.length || 0);
      });
      
      // Convert bytes to human readable
      const sizeFormatted = formatBytes(totalSize);
      
      return { size: totalSize, sizeFormatted };
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return { size: 0, sizeFormatted: '0 B' };
    }
  },

  /**
   * Clear cache data (prices, sync data) but keep user data
   */
  async clearCache(): Promise<void> {
    try {
      await this.removeMultiple([
        STORAGE_KEYS.CACHED_PRICES,
        STORAGE_KEYS.LAST_SYNC,
      ]);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  },
};

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
