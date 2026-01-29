import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ColorScheme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = '@theme_preference';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ColorScheme>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Determine the actual color scheme to use
  const colorScheme: 'light' | 'dark' = 
    themePreference === 'system' 
      ? (systemColorScheme || 'dark') 
      : themePreference;

  const isDark = colorScheme === 'dark';

  // Load saved theme preference
  const loadThemePreference = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setThemePreference(saved as ColorScheme);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save theme preference
  const setTheme = useCallback(async (scheme: ColorScheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      setThemePreference(scheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  }, [isDark, setTheme]);

  // Theme colors
  const colors = {
    // Backgrounds
    background: isDark ? '#0f0f0f' : '#f5f5f5',
    card: isDark ? '#1a1a1a' : '#ffffff',
    cardSecondary: isDark ? '#262626' : '#f3f4f6',
    
    // Text
    text: isDark ? '#ffffff' : '#111827',
    textSecondary: isDark ? '#a3a3a3' : '#6b7280',
    textTertiary: isDark ? '#737373' : '#9ca3af',
    
    // Primary (Gold)
    primary: '#D4AF37',
    primaryLight: '#F4E4A6',
    primaryDark: '#8B7355',
    
    // Status colors
    success: isDark ? '#22c55e' : '#16a34a',
    error: isDark ? '#ef4444' : '#dc2626',
    warning: isDark ? '#f59e0b' : '#d97706',
    info: isDark ? '#3b82f6' : '#2563eb',
    
    // Borders
    border: isDark ? '#262626' : '#e5e7eb',
    borderSecondary: isDark ? '#404040' : '#d1d5db',
    
    // Misc
    overlay: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
    tabBar: isDark ? '#0f0f0f' : '#ffffff',
    tabBarBorder: isDark ? '#262626' : '#e5e7eb',
  };

  // Load on mount
  useEffect(() => {
    loadThemePreference();
  }, [loadThemePreference]);

  return {
    colorScheme,
    themePreference,
    isDark,
    isLoading,
    colors,
    setTheme,
    toggleTheme,
  };
};

// Export colors type
export type ThemeColors = ReturnType<typeof useTheme>['colors'];
