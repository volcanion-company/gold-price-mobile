import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { GoldPrice } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { getGoldName } from '../../utils/helpers';
import { useThemeContext, useLanguage } from '../../contexts';
import { PriceChange } from './PriceChange';

interface PriceRowProps {
  price: GoldPrice;
  onPress?: () => void;
  showChange?: boolean;
}

export function PriceRow({ price, onPress, showChange = true }: PriceRowProps) {
  const { colors } = useThemeContext();
  const { t } = useLanguage();
  const displayName = price.name || getGoldName(price.code);
  const changeLabel = showChange && price.change !== undefined && price.change !== 0
    ? `, ${price.change >= 0 ? 'tăng' : 'giảm'} ${price.changePercent ? `${Math.abs(price.changePercent).toFixed(2)}%` : ''}`
    : '';
  
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-3 px-4"
      style={{ 
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}, mua ${formatPrice(price.buyPrice, price.currency)}, bán ${formatPrice(price.sellPrice, price.currency)}${changeLabel}`}
      accessibilityHint={onPress ? "Nhấn để xem chi tiết" : undefined}
    >
      <View className="flex-1">
        <Text className="text-base font-semibold" style={{ color: colors.text }}>
          {price.name || getGoldName(price.code)}
        </Text>
        <View className="flex-row mt-1">
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            {t('home.buy')}: <Text className="font-medium" style={{ color: colors.textSecondary }}>{formatPrice(price.buyPrice, price.currency)}</Text>
          </Text>
          <Text className="text-sm ml-4" style={{ color: colors.textSecondary }}>
            {t('home.sell')}: <Text className="font-medium" style={{ color: colors.textSecondary }}>{formatPrice(price.sellPrice, price.currency)}</Text>
          </Text>
        </View>
      </View>
      
      {showChange && price.change !== undefined && (
        <PriceChange
          change={price.change}
          changePercent={price.changePercent}
        />
      )}
    </Pressable>
  );
}
