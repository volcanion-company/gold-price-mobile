import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeContext, useLanguage } from '../../contexts';
import { useSettingsStore } from '../../stores/settingsStore';
import { COLORS } from '../../utils/constants';

type ThemeOption = 'light' | 'dark' | 'system';

interface ThemeOptionItem {
  value: ThemeOption;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const themeOptions: ThemeOptionItem[] = [
  { value: 'light', labelKey: 'settings.lightMode', icon: 'sunny' },
  { value: 'dark', labelKey: 'settings.darkMode', icon: 'moon' },
  { value: 'system', labelKey: 'settings.systemDefault', icon: 'phone-portrait-outline' },
];

export const ThemeSelector: React.FC = () => {
  const { isDark, setTheme } = useThemeContext();
  const { t } = useLanguage();
  const { theme } = useSettingsStore();

  const handleSelect = async (value: ThemeOption) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(value);
    useSettingsStore.getState().setTheme(value);
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
      <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {t('settings.appearance')}
        </Text>
      </View>

      {themeOptions.map((option, index) => {
        const isSelected = theme === option.value;
        const isLast = index === themeOptions.length - 1;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleSelect(option.value)}
            className={`flex-row items-center px-4 py-3.5 ${
              !isLast ? 'border-b border-gray-100 dark:border-gray-700' : ''
            }`}
            activeOpacity={0.7}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: isSelected ? `${COLORS.primary}15` : isDark ? '#374151' : '#f3f4f6' }}
            >
              <Ionicons
                name={option.icon}
                size={20}
                color={isSelected ? COLORS.primary : isDark ? '#9ca3af' : '#6b7280'}
              />
            </View>

            <Text
              className={`flex-1 text-base ${
                isSelected
                  ? 'text-amber-600 dark:text-amber-500 font-semibold'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {t(option.labelKey)}
            </Text>

            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default ThemeSelector;
