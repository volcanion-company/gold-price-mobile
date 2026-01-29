import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Price store import removed - alerts work independently
import type { Alert as AlertType } from '../types';

const ALERTS_STORAGE_KEY = '@gold_price_alerts';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(false);

  // Load alerts from storage
  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
      if (stored) {
        setAlerts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save alerts to storage
  const saveAlerts = useCallback(async (newAlerts: AlertType[]) => {
    try {
      await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(newAlerts));
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Failed to save alerts:', error);
      throw error;
    }
  }, []);

  // Add new alert
  const addAlert = useCallback(async (alertData: Omit<AlertType, 'id' | 'createdAt' | 'isActive'>) => {
    const newAlert: AlertType = {
      ...alertData,
      id: Date.now().toString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const newAlerts = [...alerts, newAlert];
    await saveAlerts(newAlerts);
    return newAlert;
  }, [alerts, saveAlerts]);

  // Update alert
  const updateAlert = useCallback(async (id: string, updates: Partial<AlertType>) => {
    const newAlerts = alerts.map(alert =>
      alert.id === id ? { ...alert, ...updates } : alert
    );
    await saveAlerts(newAlerts);
  }, [alerts, saveAlerts]);

  // Toggle alert active state
  const toggleAlert = useCallback(async (id: string, isActive: boolean) => {
    await updateAlert(id, { isActive });
  }, [updateAlert]);

  // Delete alert
  const deleteAlert = useCallback(async (id: string) => {
    return new Promise<void>((resolve) => {
      Alert.alert(
        'Xác nhận xóa',
        'Bạn có chắc muốn xóa cảnh báo này?',
        [
          { text: 'Hủy', style: 'cancel', onPress: () => resolve() },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              const newAlerts = alerts.filter(alert => alert.id !== id);
              await saveAlerts(newAlerts);
              resolve();
            },
          },
        ]
      );
    });
  }, [alerts, saveAlerts]);

  // Check alerts against current prices
  const checkAlerts = useCallback((currentPrices: Map<string, { buy: number; sell: number }>) => {
    const triggeredAlerts: AlertType[] = [];

    alerts.forEach(alert => {
      if (!alert.isActive) return;

      const price = currentPrices.get(alert.productName);
      if (!price) return;

      const currentPrice = alert.priceType === 'buy' ? price.buy : price.sell;
      let triggered = false;

      if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
        triggered = true;
      } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
        triggered = true;
      }

      if (triggered && !alert.triggeredAt) {
        triggeredAlerts.push({
          ...alert,
          triggeredAt: new Date().toISOString(),
        });
      }
    });

    // Update triggered alerts
    if (triggeredAlerts.length > 0) {
      const newAlerts = alerts.map(alert => {
        const triggered = triggeredAlerts.find(t => t.id === alert.id);
        return triggered || alert;
      });
      saveAlerts(newAlerts);
    }

    return triggeredAlerts;
  }, [alerts, saveAlerts]);

  // Get active alerts count
  const activeCount = alerts.filter(a => a.isActive).length;

  return {
    alerts,
    loading,
    activeCount,
    loadAlerts,
    addAlert,
    updateAlert,
    toggleAlert,
    deleteAlert,
    checkAlerts,
  };
};
