import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  // Appearance
  theme: 'light' | 'dark' | 'system';
  language: 'vi' | 'en';
  
  // Display preferences
  defaultCurrency: 'VND' | 'USD';
  showPercentChange: boolean;
  showSpread: boolean;
  
  // Notifications
  pushNotifications: boolean;
  priceAlertSound: boolean;
  priceAlertVibration: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'vi' | 'en') => void;
  setDefaultCurrency: (currency: 'VND' | 'USD') => void;
  setShowPercentChange: (show: boolean) => void;
  setShowSpread: (show: boolean) => void;
  setPushNotifications: (enabled: boolean) => void;
  setPriceAlertSound: (enabled: boolean) => void;
  setPriceAlertVibration: (enabled: boolean) => void;
  reset: () => void;
}

const initialState = {
  theme: 'system' as const,
  language: 'vi' as const,
  defaultCurrency: 'VND' as const,
  showPercentChange: true,
  showSpread: false,
  pushNotifications: true,
  priceAlertSound: true,
  priceAlertVibration: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),
      setShowPercentChange: (show) => set({ showPercentChange: show }),
      setShowSpread: (show) => set({ showSpread: show }),
      setPushNotifications: (enabled) => set({ pushNotifications: enabled }),
      setPriceAlertSound: (enabled) => set({ priceAlertSound: enabled }),
      setPriceAlertVibration: (enabled) => set({ priceAlertVibration: enabled }),
      reset: () => set(initialState),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
