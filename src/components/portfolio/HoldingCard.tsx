import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../utils/constants';
import type { HoldingItem } from '../../types';

interface HoldingCardProps {
  holding: HoldingItem;
  currentPrice?: number;
  onPress?: (holding: HoldingItem) => void;
  onEdit?: (holding: HoldingItem) => void;
  onDelete?: (id: string) => void;
}

export const HoldingCard: React.FC<HoldingCardProps> = ({
  holding,
  currentPrice,
  onPress,
  onEdit,
  onDelete,
}) => {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(holding);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onEdit(holding);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDelete(holding.id);
    }
  };

  const currentValue = currentPrice 
    ? holding.quantity * currentPrice 
    : holding.quantity * holding.buyPrice;
  
  const investedValue = holding.quantity * holding.buyPrice;
  const profitLoss = currentValue - investedValue;
  const profitLossPercent = (profitLoss / investedValue) * 100;
  const isProfit = profitLoss >= 0;

  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return (price / 1000000000).toFixed(2) + ' tỷ';
    }
    if (price >= 1000000) {
      return (price / 1000000).toFixed(2) + ' triệu';
    }
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const formatQuantity = (quantity: number) => {
    if (quantity >= 1) {
      return quantity.toFixed(2) + ' lượng';
    }
    return (quantity * 10).toFixed(2) + ' chỉ';
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={onPress ? 0.7 : 1}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View 
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: `${COLORS.primary}15` }}
          >
            <Ionicons name="cube" size={24} color={COLORS.primary} />
          </View>
          
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
              {holding.productName}
            </Text>
            <Text className="text-xs text-gray-500">
              {holding.providerName}
            </Text>
          </View>
        </View>

        {(onEdit || onDelete) && (
          <View className="flex-row">
            {onEdit && (
              <TouchableOpacity 
                onPress={handleEdit}
                className="w-8 h-8 rounded-lg items-center justify-center mr-1 bg-gray-100"
              >
                <Ionicons name="pencil" size={14} color="#6b7280" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity 
                onPress={handleDelete}
                className="w-8 h-8 rounded-lg items-center justify-center bg-red-50"
              >
                <Ionicons name="trash" size={14} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Stats Grid */}
      <View className="bg-gray-50 rounded-xl p-3">
        <View className="flex-row mb-3">
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">Số lượng</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {formatQuantity(holding.quantity)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">Giá mua</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {formatPrice(holding.buyPrice)}
            </Text>
          </View>
        </View>
        
        <View className="flex-row">
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">Giá trị hiện tại</Text>
            <Text 
              className="text-sm font-bold"
              style={{ color: COLORS.primary }}
            >
              {formatPrice(currentValue)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">Lợi nhuận</Text>
            <Text className={`text-sm font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {isProfit ? '+' : ''}{formatPrice(profitLoss)}
            </Text>
          </View>
        </View>
      </View>

      {/* Profit/Loss Badge */}
      <View className="flex-row justify-between items-center mt-3">
        <Text className="text-xs text-gray-400">
          Mua: {new Date(holding.buyDate).toLocaleDateString('vi-VN')}
        </Text>
        
        <View 
          className={`px-2 py-1 rounded-full ${isProfit ? 'bg-green-100' : 'bg-red-100'}`}
        >
          <Text className={`text-xs font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
            {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
