import { NativeModules, Platform } from 'react-native';

// Define interface for native module
interface GoldPriceWidgetModule {
  // iOS methods
  reloadAllTimelines: () => Promise<void>;
  reloadTimeline: (kind: string) => Promise<void>;
  
  // Android methods
  updateWidget: () => Promise<void>;
  updateWidgetWithData: (data: string) => Promise<void>;
  
  // Common methods
  isWidgetActive: () => Promise<boolean>;
  getWidgetInfo: () => Promise<{
    isInstalled: boolean;
    sizes: string[];
  }>;
}

// Get native module with type safety
const GoldPriceWidgetNative = NativeModules.GoldPriceWidget as GoldPriceWidgetModule | undefined;

/**
 * Widget Bridge - Native module communication
 * Provides platform-agnostic interface to native widget functionality
 */
export const widgetBridge = {
  /**
   * Check if native module is available
   */
  isAvailable(): boolean {
    return GoldPriceWidgetNative !== undefined;
  },

  /**
   * Reload all widget timelines (iOS)
   * This triggers WidgetKit to fetch new data for all widgets
   */
  async reloadAllTimelines(): Promise<void> {
    if (Platform.OS !== 'ios') {
      console.log('[WidgetBridge] reloadAllTimelines is iOS only');
      return;
    }

    if (!GoldPriceWidgetNative?.reloadAllTimelines) {
      console.warn('[WidgetBridge] reloadAllTimelines not available');
      return;
    }

    try {
      await GoldPriceWidgetNative.reloadAllTimelines();
      console.log('[WidgetBridge] Reloaded all timelines');
    } catch (error) {
      console.error('[WidgetBridge] Error reloading timelines:', error);
      throw error;
    }
  },

  /**
   * Reload a specific widget timeline (iOS)
   */
  async reloadTimeline(kind: string): Promise<void> {
    if (Platform.OS !== 'ios') {
      console.log('[WidgetBridge] reloadTimeline is iOS only');
      return;
    }

    if (!GoldPriceWidgetNative?.reloadTimeline) {
      console.warn('[WidgetBridge] reloadTimeline not available');
      return;
    }

    try {
      await GoldPriceWidgetNative.reloadTimeline(kind);
      console.log('[WidgetBridge] Reloaded timeline:', kind);
    } catch (error) {
      console.error('[WidgetBridge] Error reloading timeline:', error);
      throw error;
    }
  },

  /**
   * Update widget (Android)
   * This triggers AppWidgetManager to update all Gold Price widgets
   */
  async updateWidget(): Promise<void> {
    if (Platform.OS !== 'android') {
      console.log('[WidgetBridge] updateWidget is Android only');
      return;
    }

    if (!GoldPriceWidgetNative?.updateWidget) {
      console.warn('[WidgetBridge] updateWidget not available');
      return;
    }

    try {
      await GoldPriceWidgetNative.updateWidget();
      console.log('[WidgetBridge] Updated widget');
    } catch (error) {
      console.error('[WidgetBridge] Error updating widget:', error);
      throw error;
    }
  },

  /**
   * Update widget with specific data (Android)
   */
  async updateWidgetWithData(data: object): Promise<void> {
    if (Platform.OS !== 'android') {
      console.log('[WidgetBridge] updateWidgetWithData is Android only');
      return;
    }

    if (!GoldPriceWidgetNative?.updateWidgetWithData) {
      console.warn('[WidgetBridge] updateWidgetWithData not available');
      return;
    }

    try {
      await GoldPriceWidgetNative.updateWidgetWithData(JSON.stringify(data));
      console.log('[WidgetBridge] Updated widget with data');
    } catch (error) {
      console.error('[WidgetBridge] Error updating widget with data:', error);
      throw error;
    }
  },

  /**
   * Check if any widget is currently active/installed
   */
  async isWidgetActive(): Promise<boolean> {
    if (!GoldPriceWidgetNative?.isWidgetActive) {
      return false;
    }

    try {
      return await GoldPriceWidgetNative.isWidgetActive();
    } catch (error) {
      console.error('[WidgetBridge] Error checking widget status:', error);
      return false;
    }
  },

  /**
   * Get widget installation info
   */
  async getWidgetInfo(): Promise<{
    isInstalled: boolean;
    sizes: string[];
  }> {
    if (!GoldPriceWidgetNative?.getWidgetInfo) {
      return { isInstalled: false, sizes: [] };
    }

    try {
      return await GoldPriceWidgetNative.getWidgetInfo();
    } catch (error) {
      console.error('[WidgetBridge] Error getting widget info:', error);
      return { isInstalled: false, sizes: [] };
    }
  },

  /**
   * Platform-agnostic refresh
   * Calls appropriate native method based on platform
   */
  async refresh(): Promise<void> {
    if (Platform.OS === 'ios') {
      await this.reloadAllTimelines();
    } else if (Platform.OS === 'android') {
      await this.updateWidget();
    }
  },
};

export default widgetBridge;
