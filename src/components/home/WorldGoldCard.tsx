import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GoldPrice } from '../../types';
import { formatPriceChange, formatPercentChange } from '../../utils/formatters';
import { getPriceChangeColor, calculateChangePercent } from '../../utils/helpers';
import { useLanguage } from '../../contexts';

interface WorldGoldCardProps {
  price: GoldPrice;
  onPress?: () => void;
}

export function WorldGoldCard({ price, onPress }: WorldGoldCardProps) {
  const { t } = useLanguage();
  const buyPrice = price?.buyPrice ?? 0;
  const change = price?.change || 0;
  const changeColor = getPriceChangeColor(change);
  const changePercent = price?.changePercent || calculateChangePercent(buyPrice, change);

  const colorStyles = {
    up: { text: 'text-green-700', bg: 'bg-white/90' },
    down: { text: 'text-red-700', bg: 'bg-white/90' },
    neutral: { text: 'text-gray-600', bg: 'bg-white/90' },
  }[changeColor];

  // Don't render if price is not available
  if (!price || buyPrice === 0) {
    return null;
  }

  return (
    <Pressable onPress={onPress} className="active:opacity-90">
      <LinearGradient
        colors={['#E6B800', '#D4A800', '#B38F00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5 rounded-2xl shadow-lg"
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <Text className="text-white/90 text-sm font-semibold tracking-wide">
              🌍 {t('home.worldGold').toUpperCase()}
            </Text>
            <Text className="text-white/60 text-xs mt-0.5">XAU/USD</Text>
          </View>
          <View className="bg-white/20 px-2 py-1 rounded">
            <Text className="text-white text-xs font-medium">LIVE</Text>
          </View>
        </View>

        {/* Price */}
        <Text className="text-white text-4xl font-bold tracking-tight">
          ${buyPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>

        {/* Change */}
        <View className="flex-row items-center mt-3">
          <View className={`px-3 py-1.5 rounded-lg ${colorStyles.bg}`}>
            <Text className={`text-sm font-bold ${colorStyles.text}`}>
              {change >= 0 ? '▲' : '▼'} {formatPriceChange(change, 'USD')} ({formatPercentChange(changePercent)})
            </Text>
          </View>
        </View>

        {/* Mini Chart Placeholder */}
        <View className="mt-4 h-12 bg-white/10 rounded-lg items-center justify-center">
          <Text className="text-white/40 text-xs">📈 {t('charts.title')}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
