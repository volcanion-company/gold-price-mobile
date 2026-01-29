import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { GoldPrice } from '../../types';
import { formatPrice, formatPriceChange, formatPercent } from '../../utils/formatters';

interface QuickStatsProps {
  prices: GoldPrice[];
  lastUpdated?: string | null;
}

interface StatItem {
  label: string;
  value: string;
  subValue?: string;
  color?: 'up' | 'down' | 'neutral';
}

export const QuickStats: React.FC<QuickStatsProps> = ({ prices, lastUpdated }) => {
  const stats = useMemo<StatItem[]>(() => {
    if (prices.length === 0) return [];

    // Find XAU/USD
    const xauusd = prices.find((p) => p.code === 'XAUUSD');
    
    // Find SJC main price
    const sjcMain = prices.find((p) => p.code === 'SJL1L10');
    
    // Calculate average domestic price change
    const domesticPrices = prices.filter((p) => p.currency === 'VND');
    const avgChange = domesticPrices.length > 0
      ? domesticPrices.reduce((acc, p) => acc + (p.changeBuy || p.change || 0), 0) / domesticPrices.length
      : 0;

    // Find best buy price (lowest)
    const lowestBuy = [...prices]
      .filter((p) => p.currency === 'VND' && p.buyPrice > 0)
      .sort((a, b) => a.buyPrice - b.buyPrice)[0];

    // Find best sell price (highest)
    const highestSell = [...prices]
      .filter((p) => p.currency === 'VND' && p.sellPrice > 0)
      .sort((a, b) => b.sellPrice - a.sellPrice)[0];

    const result: StatItem[] = [];

    if (xauusd) {
      result.push({
        label: 'Vàng TG',
        value: `$${xauusd.sellPrice.toLocaleString()}`,
        subValue: xauusd.changePercent 
          ? `${xauusd.changePercent > 0 ? '+' : ''}${xauusd.changePercent.toFixed(2)}%`
          : undefined,
        color: xauusd.changePercent && xauusd.changePercent > 0 
          ? 'up' 
          : xauusd.changePercent && xauusd.changePercent < 0 
          ? 'down' 
          : 'neutral',
      });
    }

    if (sjcMain) {
      result.push({
        label: 'SJC',
        value: formatPrice(sjcMain.sellPrice, 'VND'),
        subValue: sjcMain.changeBuy 
          ? formatPriceChange(sjcMain.changeBuy, 'VND')
          : undefined,
        color: sjcMain.changeBuy && sjcMain.changeBuy > 0 
          ? 'up' 
          : sjcMain.changeBuy && sjcMain.changeBuy < 0 
          ? 'down' 
          : 'neutral',
      });
    }

    if (lowestBuy) {
      result.push({
        label: 'Mua thấp',
        value: formatPrice(lowestBuy.buyPrice, 'VND'),
        subValue: lowestBuy.name || lowestBuy.code,
        color: 'neutral',
      });
    }

    if (highestSell) {
      result.push({
        label: 'Bán cao',
        value: formatPrice(highestSell.sellPrice, 'VND'),
        subValue: highestSell.name || highestSell.code,
        color: 'neutral',
      });
    }

    return result;
  }, [prices]);

  const getColorClass = (color?: 'up' | 'down' | 'neutral') => {
    switch (color) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  if (stats.length === 0) return null;

  return (
    <View className="bg-white rounded-xl p-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-semibold text-gray-800">
          Thống kê nhanh
        </Text>
        {lastUpdated && (
          <Text className="text-xs text-gray-400">
            {lastUpdated}
          </Text>
        )}
      </View>

      <View className="flex-row flex-wrap -mx-1">
        {stats.map((stat, index) => (
          <View key={index} className="w-1/2 px-1 mb-2">
            <View className="bg-gray-50 rounded-lg p-3">
              <Text className="text-xs text-gray-500 mb-1">
                {stat.label}
              </Text>
              <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
                {stat.value}
              </Text>
              {stat.subValue && (
                <Text 
                  className={`text-xs mt-0.5 ${getColorClass(stat.color)}`}
                  numberOfLines={1}
                >
                  {stat.subValue}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
