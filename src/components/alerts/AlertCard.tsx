import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../utils/constants';
import type { Alert } from '../../types';

interface AlertCardProps {
  alert: Alert;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (alert: Alert) => void;
  onDelete: (id: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const handleToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(alert.id, value);
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEdit(alert);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete(alert.id);
  };

  const isAbove = alert.condition === 'above';
  const isBuy = alert.priceType === 'buy';

  const getConditionText = () => {
    const conditionWord = isAbove ? 'vượt trên' : 'xuống dưới';
    const priceTypeWord = isBuy ? 'Giá mua' : 'Giá bán';
    return `${priceTypeWord} ${conditionWord}`;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <View 
      className={`
        bg-white rounded-2xl p-4 mb-3 shadow-sm border
        ${alert.isActive ? 'border-primary/30' : 'border-gray-100'}
      `}
      style={alert.isActive ? { borderColor: `${COLORS.primary}30` } : undefined}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View 
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: `${COLORS.primary}15` }}
          >
            <Ionicons 
              name={isAbove ? 'trending-up' : 'trending-down'} 
              size={20} 
              color={isAbove ? '#22c55e' : '#ef4444'} 
            />
          </View>
          
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
              {alert.productName}
            </Text>
            <Text className="text-xs text-gray-500">
              {alert.providerName}
            </Text>
          </View>
        </View>

        <Switch
          value={alert.isActive}
          onValueChange={handleToggle}
          trackColor={{ false: '#e5e7eb', true: COLORS.primaryLight }}
          thumbColor={alert.isActive ? COLORS.primary : '#f4f3f4'}
          ios_backgroundColor="#e5e7eb"
        />
      </View>

      {/* Condition */}
      <View className="bg-gray-50 rounded-xl p-3 mb-3">
        <Text className="text-xs text-gray-500 mb-1">{getConditionText()}</Text>
        <Text 
          className="text-xl font-bold"
          style={{ color: COLORS.primary }}
        >
          {formatPrice(alert.targetPrice)}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-gray-400">
          {alert.triggeredAt 
            ? `Đã kích hoạt: ${new Date(alert.triggeredAt).toLocaleString('vi-VN')}`
            : `Tạo: ${new Date(alert.createdAt).toLocaleDateString('vi-VN')}`
          }
        </Text>

        <View className="flex-row">
          <TouchableOpacity 
            onPress={handleEdit}
            className="w-8 h-8 rounded-lg items-center justify-center mr-2 bg-gray-100"
          >
            <Ionicons name="pencil" size={16} color="#6b7280" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleDelete}
            className="w-8 h-8 rounded-lg items-center justify-center bg-red-50"
          >
            <Ionicons name="trash" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Triggered Badge */}
      {alert.triggeredAt && (
        <View className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded-full">
          <Text className="text-xs text-green-600 font-medium">Đã kích hoạt</Text>
        </View>
      )}
    </View>
  );
};
