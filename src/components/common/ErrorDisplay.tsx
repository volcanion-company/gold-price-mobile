import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeContext, useLanguage } from '../../contexts';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  const { colors } = useThemeContext();
  const { t } = useLanguage();

  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className="text-5xl mb-4">😕</Text>
      <Text 
        className="text-lg font-semibold text-center mb-2"
        style={{ color: colors.text }}
      >
        {t('common.error')}
      </Text>
      <Text 
        className="text-sm text-center mb-4"
        style={{ color: colors.textSecondary }}
      >
        {message}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="px-6 py-3 rounded-full active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-semibold">{t('common.retry')}</Text>
        </Pressable>
      )}
    </View>
  );
}
