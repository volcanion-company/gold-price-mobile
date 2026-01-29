import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GoldPrice } from '../../types';
import { formatPrice, formatPriceChange, formatPercentChange } from '../../utils/formatters';
import { getPriceChangeColor, calculateChangePercent, getGoldName } from '../../utils/helpers';

interface PriceCardProps {
  price: GoldPrice;
  onPress?: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

export function PriceCard({ price, onPress, variant = 'default' }: PriceCardProps) {
  const change = price.change || 0;
  const changeColor = getPriceChangeColor(change);
  const changePercent = price.changePercent || calculateChangePercent(price.buyPrice, change);

  const colorStyles = {
    up: {
      border: 'border-green-300',
      text: 'text-green-600',
      bg: 'bg-green-50',
    },
    down: {
      border: 'border-red-300',
      text: 'text-red-600',
      bg: 'bg-red-50',
    },
    neutral: {
      border: 'border-gray-200',
      text: 'text-gray-500',
      bg: 'bg-gray-100',
    },
  }[changeColor];

  const displayName = price.name || getGoldName(price.code);

  if (variant === 'compact') {
    return (
      <Pressable
        onPress={onPress}
        className={`flex-1 p-3 bg-white dark:bg-dark-card rounded-xl border ${colorStyles.border} active:opacity-80`}
        accessibilityRole="button"
        accessibilityLabel={`${displayName}, giá mua ${formatPrice(price.buyPrice, price.currency)}${change !== 0 ? `, ${change >= 0 ? 'tăng' : 'giảm'} ${formatPriceChange(change, price.currency)}` : ''}`}
        accessibilityHint="Nhấn để xem chi tiết"
      >
        <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {displayName}
        </Text>
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          {formatPrice(price.buyPrice, price.currency)}
        </Text>
        {change !== 0 && (
          <View className={`mt-2 self-start px-2 py-0.5 rounded ${colorStyles.bg}`}>
            <Text className={`text-xs font-medium ${colorStyles.text}`}>
              {change >= 0 ? '▲' : '▼'} {formatPriceChange(change, price.currency)}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }

  if (variant === 'featured') {
    return (
      <Pressable
        onPress={onPress}
        className="active:opacity-90"
        accessibilityRole="button"
        accessibilityLabel={`Vàng thế giới XAU/USD, giá ${formatPrice(price.buyPrice, price.currency)}${change !== 0 ? `, ${change >= 0 ? 'tăng' : 'giảm'} ${formatPriceChange(change, price.currency)}, ${formatPercentChange(changePercent)}` : ''}`}
        accessibilityHint="Nhấn để xem chi tiết"
      >
        <LinearGradient
          colors={['#E6B800', '#B38F00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-4 rounded-2xl"
        >
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <Text className="text-white/80 text-sm font-medium">🌍 VÀNG THẾ GIỚI</Text>
              <Text className="text-white/60 text-xs mt-0.5">XAU/USD</Text>
            </View>
          </View>
          
          <Text className="text-white text-3xl font-bold">
            {formatPrice(price.buyPrice, price.currency)}
          </Text>
          
          <View className="flex-row items-center mt-2">
            <View className={`px-2 py-1 rounded ${colorStyles.bg}`}>
              <Text className={`text-sm font-semibold ${colorStyles.text}`}>
                {change >= 0 ? '▲' : '▼'} {formatPriceChange(change, price.currency)} ({formatPercentChange(changePercent)})
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  // Default variant
  return (
    <Pressable
      onPress={onPress}
      className={`p-4 bg-white dark:bg-dark-card rounded-xl border ${colorStyles.border} active:opacity-80`}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}, mua ${formatPrice(price.buyPrice, price.currency)}, bán ${formatPrice(price.sellPrice, price.currency)}${change !== 0 ? `, ${change >= 0 ? 'tăng' : 'giảm'} ${formatPriceChange(change, price.currency)}` : ''}`}
      accessibilityHint="Nhấn để xem chi tiết"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {displayName}
        </Text>
      </View>
      
      <View className="flex-row justify-between items-end">
        <View>
          <Text className="text-xs text-gray-400 mb-1">Mua</Text>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            {formatPrice(price.buyPrice, price.currency)}
          </Text>
        </View>
        
        <View className="items-end">
          <Text className="text-xs text-gray-400 mb-1">Bán</Text>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            {formatPrice(price.sellPrice, price.currency)}
          </Text>
        </View>
      </View>
      
      {change !== 0 && (
        <View className={`mt-3 self-start px-2 py-1 rounded ${colorStyles.bg}`}>
          <Text className={`text-sm font-medium ${colorStyles.text}`}>
            {change >= 0 ? '▲' : '▼'} {formatPriceChange(change, price.currency)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
