import { Platform, NativeModules } from 'react-native';
import { storageService, STORAGE_KEYS } from '../storageService';

// Widget data structure
export interface WidgetData {
  sjc: {
    buy: number;
    sell: number;
    change: number;
    changePercent: number;
  } | null;
  world: {
    price: number;
    change: number;
    changePercent: number;
  } | null;
  lastUpdated: string;
}

export interface WidgetConfig {
  showSJC: boolean;
  showWorld: boolean;
  showChange: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_CONFIG: WidgetConfig = {
  showSJC: true,
  showWorld: true,
  showChange: true,
  autoRefresh: true,
  refreshInterval: 15,
  theme: 'system',
};

// Native module for widget (to be implemented in native code)
const { GoldPriceWidget } = NativeModules;

/**
 * Widget Service for managing home screen widgets
 */
export const widgetService = {
  /**
   * Update widget with latest price data
   */
  async updateWidgetData(prices: any[]): Promise<void> {
    try {
      // Find relevant prices
      const sjcPrice = prices.find(
        p => p.code === 'SJC' || p.name?.toLowerCase().includes('sjc')
      );
      const worldPrice = prices.find(
        p => p.code === 'XAUUSD' || p.name?.toLowerCase().includes('xauusd')
      );
      
      const widgetData: WidgetData = {
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
      
      // Store data for native access
      await storageService.set(STORAGE_KEYS.WIDGET_DATA, widgetData);
      
      // Notify native widget to refresh
      await this.refreshNativeWidget();
      
      console.log('[WidgetService] Widget data updated');
    } catch (error) {
      console.error('[WidgetService] Error updating widget data:', error);
      throw error;
    }
  },

  /**
   * Get current widget data
   */
  async getWidgetData(): Promise<WidgetData | null> {
    try {
      return await storageService.get<WidgetData>(STORAGE_KEYS.WIDGET_DATA);
    } catch (error) {
      console.error('[WidgetService] Error getting widget data:', error);
      return null;
    }
  },

  /**
   * Get widget configuration
   */
  async getConfig(): Promise<WidgetConfig> {
    try {
      const config = await storageService.get<WidgetConfig>('WIDGET_CONFIG' as any);
      return config || DEFAULT_CONFIG;
    } catch (error) {
      console.error('[WidgetService] Error getting config:', error);
      return DEFAULT_CONFIG;
    }
  },

  /**
   * Update widget configuration
   */
  async setConfig(config: Partial<WidgetConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const newConfig = { ...currentConfig, ...config };
      await storageService.set('WIDGET_CONFIG' as any, newConfig);
      
      // Notify native widget of config change
      await this.refreshNativeWidget();
      
      console.log('[WidgetService] Config updated');
    } catch (error) {
      console.error('[WidgetService] Error setting config:', error);
      throw error;
    }
  },

  /**
   * Reset widget configuration to defaults
   */
  async resetConfig(): Promise<void> {
    try {
      await storageService.set('WIDGET_CONFIG' as any, DEFAULT_CONFIG);
      await this.refreshNativeWidget();
      console.log('[WidgetService] Config reset to defaults');
    } catch (error) {
      console.error('[WidgetService] Error resetting config:', error);
      throw error;
    }
  },

  /**
   * Refresh native widget
   * Calls platform-specific native module to reload widget
   */
  async refreshNativeWidget(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        // iOS: Reload all WidgetKit timelines
        if (GoldPriceWidget?.reloadAllTimelines) {
          await GoldPriceWidget.reloadAllTimelines();
        } else {
          console.warn('[WidgetService] iOS native module not available');
        }
      } else if (Platform.OS === 'android') {
        // Android: Notify AppWidget to update
        if (GoldPriceWidget?.updateWidget) {
          await GoldPriceWidget.updateWidget();
        } else {
          console.warn('[WidgetService] Android native module not available');
        }
      }
    } catch (error) {
      console.error('[WidgetService] Error refreshing native widget:', error);
    }
  },

  /**
   * Check if widget is installed/active
   */
  async isWidgetActive(): Promise<boolean> {
    try {
      if (GoldPriceWidget?.isWidgetActive) {
        return await GoldPriceWidget.isWidgetActive();
      }
      return false;
    } catch (error) {
      console.error('[WidgetService] Error checking widget status:', error);
      return false;
    }
  },

  /**
   * Get widget installation instructions based on platform
   */
  getInstallInstructions(): {
    title: string;
    steps: string[];
  } {
    if (Platform.OS === 'ios') {
      return {
        title: 'Thêm Widget trên iOS',
        steps: [
          'Nhấn giữ màn hình chính cho đến khi các biểu tượng bắt đầu rung',
          'Nhấn nút "+" ở góc trên bên trái',
          'Tìm kiếm "Gold Price"',
          'Chọn kích thước widget (nhỏ, vừa, hoặc lớn)',
          'Nhấn "Thêm Widget"',
          'Kéo widget đến vị trí mong muốn',
          'Nhấn "Xong"',
        ],
      };
    } else {
      return {
        title: 'Thêm Widget trên Android',
        steps: [
          'Nhấn giữ màn hình chính',
          'Chọn "Widgets"',
          'Tìm kiếm "Gold Price"',
          'Nhấn giữ và kéo widget đến màn hình chính',
          'Chọn kích thước widget',
          'Nhấn "Thêm"',
        ],
      };
    }
  },

  /**
   * Format price for widget display
   */
  formatWidgetPrice(price: number, short: boolean = false): string {
    if (short) {
      // Format as millions (e.g., 85.2M for 85,200,000)
      if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1)}M`;
      }
      if (price >= 1000) {
        return `${(price / 1000).toFixed(1)}K`;
      }
      return price.toFixed(0);
    }
    
    // Full format with thousands separator
    return price.toLocaleString('vi-VN');
  },

  /**
   * Get price change indicator
   */
  getPriceChangeIndicator(change: number): {
    symbol: string;
    color: string;
  } {
    if (change > 0) {
      return { symbol: '↑', color: '#22c55e' };
    }
    if (change < 0) {
      return { symbol: '↓', color: '#ef4444' };
    }
    return { symbol: '−', color: '#9ca3af' };
  },
};

export default widgetService;
