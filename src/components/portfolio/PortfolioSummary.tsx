import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import type { HoldingItem } from '../../types';

interface PortfolioSummaryProps {
  holdings: HoldingItem[];
  getCurrentPrice: (productName: string) => number;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  holdings,
  getCurrentPrice,
}) => {
  // Calculate portfolio metrics
  const totalInvested = holdings.reduce((sum, h) => sum + h.quantity * h.buyPrice, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => {
    const currentPrice = getCurrentPrice(h.productName) || h.buyPrice;
    return sum + h.quantity * currentPrice;
  }, 0);
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
  const isProfit = totalProfitLoss >= 0;

  // Calculate total quantity in "lượng"
  const totalQuantity = holdings.reduce((sum, h) => sum + h.quantity, 0);

  const formatPrice = (price: number) => {
    if (Math.abs(price) >= 1000000000) {
      return (price / 1000000000).toFixed(2) + ' tỷ';
    }
    if (Math.abs(price) >= 1000000) {
      return (price / 1000000).toFixed(2) + ' triệu';
    }
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <View className="bg-white rounded-2xl p-5 mx-4 shadow-sm mb-4">
      {/* Total Value */}
      <View className="items-center mb-6">
        <Text className="text-sm text-gray-500 mb-1">Tổng giá trị danh mục</Text>
        <Text 
          className="text-3xl font-bold"
          style={{ color: COLORS.primary }}
        >
          {formatPrice(totalCurrentValue)}
        </Text>
        
        {/* Profit/Loss Badge */}
        <View 
          className={`flex-row items-center mt-2 px-3 py-1 rounded-full ${
            isProfit ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          <Ionicons 
            name={isProfit ? 'trending-up' : 'trending-down'} 
            size={14} 
            color={isProfit ? '#22c55e' : '#ef4444'} 
          />
          <Text className={`ml-1 text-sm font-medium ${
            isProfit ? 'text-green-600' : 'text-red-600'
          }`}>
            {isProfit ? '+' : ''}{formatPrice(totalProfitLoss)} 
            {' '}({isProfit ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%)
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="flex-row">
        <View className="flex-1 items-center px-2">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mb-2"
            style={{ backgroundColor: `${COLORS.primary}15` }}
          >
            <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
          </View>
          <Text className="text-xs text-gray-500">Đã đầu tư</Text>
          <Text className="text-sm font-semibold text-gray-900">
            {formatPrice(totalInvested)}
          </Text>
        </View>

        <View className="w-px bg-gray-200" />

        <View className="flex-1 items-center px-2">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mb-2"
            style={{ backgroundColor: '#fef3c715' }}
          >
            <Ionicons name="cube-outline" size={20} color="#f59e0b" />
          </View>
          <Text className="text-xs text-gray-500">Số lượng</Text>
          <Text className="text-sm font-semibold text-gray-900">
            {totalQuantity.toFixed(2)} lượng
          </Text>
        </View>

        <View className="w-px bg-gray-200" />

        <View className="flex-1 items-center px-2">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mb-2"
            style={{ backgroundColor: '#dbeafe15' }}
          >
            <Ionicons name="layers-outline" size={20} color="#3b82f6" />
          </View>
          <Text className="text-xs text-gray-500">Sản phẩm</Text>
          <Text className="text-sm font-semibold text-gray-900">
            {holdings.length}
          </Text>
        </View>
      </View>
    </View>
  );
};
