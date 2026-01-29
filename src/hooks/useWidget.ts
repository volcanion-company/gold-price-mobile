import { useState, useEffect, useCallback } from 'react';
import { 
  widgetService, 
  WidgetData, 
  WidgetConfig 
} from '../services/widget/widgetService';
import { usePrices } from './usePrices';

interface UseWidgetReturn {
  // Widget data
  widgetData: WidgetData | null;
  // Widget config
  config: WidgetConfig;
  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  // Errors
  error: string | null;
  // Actions
  updateWidget: () => Promise<void>;
  setConfig: (config: Partial<WidgetConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
  refreshWidget: () => Promise<void>;
}

export const useWidget = (): UseWidgetReturn => {
  const { prices } = usePrices();
  const [widgetData, setWidgetData] = useState<WidgetData | null>(null);
  const [config, setConfigState] = useState<WidgetConfig>({
    showSJC: true,
    showWorld: true,
    showChange: true,
    autoRefresh: true,
    refreshInterval: 15,
    theme: 'system',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [data, savedConfig] = await Promise.all([
          widgetService.getWidgetData(),
          widgetService.getConfig(),
        ]);
        
        if (data) {
          setWidgetData(data);
        }
        setConfigState(savedConfig);
      } catch (err) {
        console.error('[useWidget] Failed to load widget data:', err);
        setError('Failed to load widget data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update widget when prices change
  useEffect(() => {
    if (prices.length > 0 && config.autoRefresh) {
      updateWidget();
    }
  }, [prices]);

  // Update widget with current prices
  const updateWidget = useCallback(async () => {
    if (prices.length === 0) return;

    try {
      setIsUpdating(true);
      setError(null);
      
      await widgetService.updateWidgetData(prices);
      const newData = await widgetService.getWidgetData();
      
      if (newData) {
        setWidgetData(newData);
      }
    } catch (err) {
      console.error('[useWidget] Failed to update widget:', err);
      setError('Failed to update widget');
    } finally {
      setIsUpdating(false);
    }
  }, [prices]);

  // Set widget config
  const setConfig = useCallback(async (newConfig: Partial<WidgetConfig>) => {
    try {
      const updatedConfig = { ...config, ...newConfig };
      await widgetService.setConfig(updatedConfig);
      setConfigState(updatedConfig);
      
      // Refresh widget with new config
      await widgetService.refreshNativeWidget();
    } catch (err) {
      console.error('[useWidget] Failed to set config:', err);
      setError('Failed to update widget settings');
    }
  }, [config]);

  // Reset config to defaults
  const resetConfig = useCallback(async () => {
    try {
      await widgetService.resetConfig();
      const defaultConfig = await widgetService.getConfig();
      setConfigState(defaultConfig);
    } catch (err) {
      console.error('[useWidget] Failed to reset config:', err);
      setError('Failed to reset widget settings');
    }
  }, []);

  // Manually refresh native widget
  const refreshWidget = useCallback(async () => {
    try {
      setIsUpdating(true);
      await widgetService.refreshNativeWidget();
    } catch (err) {
      console.error('[useWidget] Failed to refresh widget:', err);
      setError('Failed to refresh widget');
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    widgetData,
    config,
    isLoading,
    isUpdating,
    error,
    updateWidget,
    setConfig,
    resetConfig,
    refreshWidget,
  };
};

export default useWidget;
