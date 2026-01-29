import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../utils/constants';
import type { Alert } from '../../types';

interface AlertNotificationProps {
  alert: Alert;
  currentPrice: number;
  onDismiss: () => void;
  onViewDetails: () => void;
}

export const AlertNotification: React.FC<AlertNotificationProps> = ({
  alert,
  currentPrice,
  onDismiss,
  onViewDetails,
}) => {
  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  const handleViewDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onViewDetails();
  };

  const isAbove = alert.condition === 'above';
  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';
  const priceChange = currentPrice - alert.targetPrice;
  const priceChangePercent = (priceChange / alert.targetPrice) * 100;

  return (
    <BlurView intensity={95} tint="systemChromeMaterial" className="rounded-2xl overflow-hidden">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View 
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: isAbove ? '#dcfce7' : '#fee2e2' }}
            >
              <Ionicons 
                name="notifications" 
                size={22} 
                color={isAbove ? '#22c55e' : '#ef4444'} 
              />
            </View>
            <View className="ml-3">
              <Text className="text-base font-bold text-gray-900">
                Cảnh báo giá!
              </Text>
              <Text className="text-xs text-gray-500">
                Vừa xong
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleDismiss}
            className="w-8 h-8 rounded-full items-center justify-center bg-gray-100"
          >
            <Ionicons name="close" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="bg-gray-50 rounded-xl p-3 mb-3">
          <Text className="text-sm text-gray-700 mb-2">
            <Text className="font-semibold">{alert.productName}</Text>
            {' '}đã {isAbove ? 'vượt trên' : 'xuống dưới'} mức{' '}
            <Text className="font-semibold" style={{ color: COLORS.primary }}>
              {formatPrice(alert.targetPrice)}
            </Text>
          </Text>

          <View className="flex-row items-center justify-between mt-2">
            <View>
              <Text className="text-xs text-gray-500">Giá hiện tại</Text>
              <Text className="text-lg font-bold text-gray-900">
                {formatPrice(currentPrice)}
              </Text>
            </View>
            
            <View 
              className={`px-3 py-1 rounded-full ${
                priceChange >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <Text className={`text-sm font-medium ${
                priceChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {priceChange >= 0 ? '+' : ''}{formatPrice(priceChange)}
                {' '}({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row">
          <TouchableOpacity
            onPress={handleDismiss}
            className="flex-1 py-3 rounded-xl bg-gray-200 mr-2 items-center"
          >
            <Text className="text-gray-700 font-medium">Bỏ qua</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleViewDetails}
            className="flex-1 py-3 rounded-xl items-center"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="text-white font-medium">Xem chi tiết</Text>
          </TouchableOpacity>
        </View>

        {/* Note if exists */}
        {alert.note && (
          <View className="mt-3 pt-3 border-t border-gray-200">
            <View className="flex-row items-center">
              <Ionicons name="document-text-outline" size={14} color="#9ca3af" />
              <Text className="text-xs text-gray-500 ml-1">{alert.note}</Text>
            </View>
          </View>
        )}
      </View>
    </BlurView>
  );
};
