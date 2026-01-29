import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart as GiftedPieChart } from 'react-native-gifted-charts';
import { COLORS } from '../../utils/constants';
import type { HoldingItem } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PortfolioChartProps {
  holdings: HoldingItem[];
  getCurrentPrice: (productName: string) => number;
  size?: number;
}

const CHART_COLORS = [
  COLORS.primary,
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#06b6d4',
  '#84cc16',
];

export const PortfolioChart: React.FC<PortfolioChartProps> = ({
  holdings,
  getCurrentPrice,
  size = SCREEN_WIDTH * 0.5,
}) => {
  const chartData = useMemo(() => {
    if (!holdings || holdings.length === 0) return [];

    // Group holdings by product name
    const grouped = holdings.reduce((acc, holding) => {
      const key = holding.productName;
      if (!acc[key]) {
        acc[key] = {
          productName: key,
          totalValue: 0,
        };
      }
      const currentPrice = getCurrentPrice(holding.productName) || holding.buyPrice;
      acc[key].totalValue += holding.quantity * currentPrice;
      return acc;
    }, {} as Record<string, { productName: string; totalValue: number }>);

    const items = Object.values(grouped);
    const total = items.reduce((sum, item) => sum + item.totalValue, 0);

    return items.map((item, index) => ({
      value: item.totalValue,
      color: CHART_COLORS[index % CHART_COLORS.length],
      text: `${((item.totalValue / total) * 100).toFixed(0)}%`,
      productName: item.productName,
      focused: index === 0,
    }));
  }, [holdings, getCurrentPrice]);

  const totalValue = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return (price / 1000000000).toFixed(2) + ' tỷ';
    }
    if (price >= 1000000) {
      return (price / 1000000).toFixed(2) + 'M';
    }
    return price.toLocaleString('vi-VN');
  };

  if (chartData.length === 0) {
    return (
      <View className="bg-white rounded-2xl p-5 mx-4 mb-4 items-center">
        <Text className="text-gray-500">Không có dữ liệu danh mục</Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-5 mx-4 mb-4">
      <Text className="text-lg font-bold text-gray-900 mb-4">
        Phân bổ danh mục
      </Text>

      <View className="flex-row items-center">
        {/* Pie Chart */}
        <View className="items-center justify-center">
          <GiftedPieChart
            data={chartData}
            donut
            radius={size / 2}
            innerRadius={size / 3}
            innerCircleColor="#ffffff"
            centerLabelComponent={() => (
              <View className="items-center">
                <Text className="text-xs text-gray-500">Tổng</Text>
                <Text 
                  className="text-sm font-bold"
                  style={{ color: COLORS.primary }}
                >
                  {formatPrice(totalValue)}
                </Text>
              </View>
            )}
          />
        </View>

        {/* Legend */}
        <View className="flex-1 ml-4">
          {chartData.map((item, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <View 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <View className="flex-1">
                <Text 
                  className="text-xs text-gray-900 font-medium" 
                  numberOfLines={1}
                >
                  {item.productName}
                </Text>
                <Text className="text-xs text-gray-500">
                  {formatPrice(item.value)} ({item.text})
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
