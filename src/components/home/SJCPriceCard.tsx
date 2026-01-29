import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { GoldPrice } from '../../types';
import { formatPrice, formatPriceChange } from '../../utils/formatters';
import { getPriceChangeColor, getGoldName } from '../../utils/helpers';
import { useThemeContext, useLanguage } from '../../contexts';

interface SJCPriceCardProps {
  price: GoldPrice;
  onPress?: () => void;
}

export function SJCPriceCard({ price, onPress }: SJCPriceCardProps) {
  const { isDark, colors } = useThemeContext();
  const { t } = useLanguage();
  const change = price.change || 0;
  const changeColor = getPriceChangeColor(change);

  const getColorClasses = (color: 'up' | 'down' | 'neutral') => ({
    text: {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-500',
    }[color],
    bg: {
      up: isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
      down: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
      neutral: isDark ? colors.cardSecondary : '#f3f4f6',
    }[color],
  });

  const colorClasses = getColorClasses(changeColor);

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-xl overflow-hidden active:opacity-80"
      style={{ 
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <View 
        className="px-3 py-2"
        style={{ 
          backgroundColor: colors.cardSecondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text 
          className="text-sm font-semibold text-center" 
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {price.name || getGoldName(price.code)}
        </Text>
      </View>

      {/* Buy Price */}
      <View 
        className="px-3 py-2"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <Text className="text-xs mb-0.5" style={{ color: colors.textTertiary }}>{t('home.buy')}</Text>
        <Text className="text-lg font-bold" style={{ color: colors.text }}>
          {formatPrice(price.buyPrice, price.currency)}
        </Text>
      </View>

      {/* Sell Price */}
      <View className="px-3 py-2">
        <Text className="text-xs mb-0.5" style={{ color: colors.textTertiary }}>{t('home.sell')}</Text>
        <Text className="text-lg font-bold" style={{ color: colors.text }}>
          {formatPrice(price.sellPrice, price.currency)}
        </Text>
        {change !== 0 && (
          <View 
            className="mt-1 self-start px-1.5 py-0.5 rounded"
            style={{ backgroundColor: colorClasses.bg }}
          >
            <Text className={`text-xs font-medium ${colorClasses.text}`}>
              {change >= 0 ? '▲' : '▼'} {formatPriceChange(change, price.currency)}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
