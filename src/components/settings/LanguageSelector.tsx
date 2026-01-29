import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../../stores/settingsStore';
import { useThemeContext, useLanguage } from '../../contexts';
import { COLORS } from '../../utils/constants';

type LanguageOption = 'vi' | 'en';

interface LanguageOptionItem {
  value: LanguageOption;
  label: string;
  flag: string;
  nativeName: string;
}

const languageOptions: LanguageOptionItem[] = [
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Vietnamese' },
  { value: 'en', label: 'English', flag: '🇺🇸', nativeName: 'English' },
];

export const LanguageSelector: React.FC = () => {
  const { isDark } = useThemeContext();
  const { t, setLanguage: setLocale } = useLanguage();
  const { language, setLanguage } = useSettingsStore();

  const handleSelect = async (value: LanguageOption) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(value);
    setLocale(value);
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
      <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {t('settings.language')}
        </Text>
      </View>

      {languageOptions.map((option, index) => {
        const isSelected = language === option.value;
        const isLast = index === languageOptions.length - 1;

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
              <Text className="text-2xl">{option.flag}</Text>
            </View>

            <View className="flex-1">
              <Text
                className={`text-base ${
                  isSelected
                    ? 'text-amber-600 dark:text-amber-500 font-semibold'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {option.label}
              </Text>
              {option.value !== language && (
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {option.nativeName}
                </Text>
              )}
            </View>

            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default LanguageSelector;
