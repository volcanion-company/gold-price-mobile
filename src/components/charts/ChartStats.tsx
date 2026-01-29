import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import type { PriceHistory } from '../../types';

interface ChartStatsProps {
  data: PriceHistory[];
  period?: string;
}

interface StatItem {
  label: string;
  value: string;
  subValue?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const ChartStats: React.FC<ChartStatsProps> = ({
  data,
  period = '1M',
}) => {
  const stats = useMemo<StatItem[]>(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const prices = data.map(d => d.buy);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    
    const min = sortedPrices[0];
    const max = sortedPrices[sortedPrices.length - 1];
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    const first = prices[0];
    const last = prices[prices.length - 1];
    const change = last - first;
    const changePercent = (change / first) * 100;
    
    // Volatility (standard deviation)
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    const volatility = (stdDev / avg) * 100;

    const formatPrice = (price: number) => {
      if (price >= 1000000) {
        return (price / 1000000).toFixed(2) + 'M';
      }
      return price.toLocaleString('vi-VN');
    };

    return [
      {
        label: 'Cao nhất',
        value: formatPrice(max) + 'đ',
        subValue: 'High',
        icon: 'arrow-up-circle',
        color: '#22c55e',
      },
      {
        label: 'Thấp nhất',
        value: formatPrice(min) + 'đ',
        subValue: 'Low',
        icon: 'arrow-down-circle',
        color: '#ef4444',
      },
      {
        label: 'Trung bình',
        value: formatPrice(avg) + 'đ',
        subValue: 'Average',
        icon: 'analytics',
        color: COLORS.primary,
      },
      {
        label: 'Biến động',
        value: (change >= 0 ? '+' : '') + formatPrice(change) + 'đ',
        subValue: (changePercent >= 0 ? '+' : '') + changePercent.toFixed(2) + '%',
        icon: change >= 0 ? 'trending-up' : 'trending-down',
        color: change >= 0 ? '#22c55e' : '#ef4444',
      },
      {
        label: 'Độ biến động',
        value: volatility.toFixed(2) + '%',
        subValue: 'Volatility',
        icon: 'pulse',
        color: volatility > 5 ? '#ef4444' : volatility > 2 ? '#f59e0b' : '#22c55e',
      },
      {
        label: 'Mẫu dữ liệu',
        value: data.length.toString(),
        subValue: 'Data points',
        icon: 'bar-chart',
        color: '#6366f1',
      },
    ];
  }, [data]);

  if (stats.length === 0) {
    return (
      <View className="bg-gray-50 rounded-xl p-4 mx-4">
        <Text className="text-gray-500 text-center">Không có dữ liệu thống kê</Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl mx-4 p-4 shadow-sm">
      <Text className="text-lg font-bold text-gray-900 mb-4">
        Thống kê {period}
      </Text>
      
      <View className="flex-row flex-wrap -mx-2">
        {stats.map((stat, index) => (
          <View key={index} className="w-1/2 px-2 mb-4">
            <View className="bg-gray-50 rounded-xl p-3">
              <View className="flex-row items-center mb-2">
                <View 
                  className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Ionicons name={stat.icon} size={18} color={stat.color} />
                </View>
                <Text className="text-xs text-gray-500 flex-1">{stat.label}</Text>
              </View>
              
              <Text 
                className="text-base font-bold"
                style={{ color: stat.color }}
                numberOfLines={1}
              >
                {stat.value}
              </Text>
              
              {stat.subValue && (
                <Text className="text-xs text-gray-400 mt-1">
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
