import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { AlertCard } from './AlertCard';
import type { Alert } from '../../types';

interface AlertListProps {
  alerts: Alert[];
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (alert: Alert) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  onToggle,
  onEdit,
  onDelete,
  loading = false,
  emptyMessage = 'Chưa có cảnh báo nào',
}) => {
  // Separate alerts into active and inactive
  const activeAlerts = alerts.filter(a => a.isActive);
  const inactiveAlerts = alerts.filter(a => !a.isActive);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-10">
        <Ionicons name="notifications-outline" size={48} color={COLORS.gray} />
        <Text className="text-gray-500 mt-4">Đang tải...</Text>
      </View>
    );
  }

  if (alerts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <View 
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: `${COLORS.primary}15` }}
        >
          <Ionicons name="notifications-off-outline" size={40} color={COLORS.primary} />
        </View>
        <Text className="text-gray-900 font-semibold text-lg mb-2">
          {emptyMessage}
        </Text>
        <Text className="text-gray-500 text-center px-8">
          Tạo cảnh báo giá để nhận thông báo khi giá vàng đạt mức mong muốn
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={alerts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AlertCard
          alert={item}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={() => (
        <View className="mb-4">
          {/* Summary Stats */}
          <View className="flex-row mb-4">
            <View className="flex-1 bg-green-50 rounded-xl p-3 mr-2">
              <View className="flex-row items-center">
                <Ionicons name="notifications" size={20} color="#22c55e" />
                <Text className="text-green-600 font-bold text-lg ml-2">
                  {activeAlerts.length}
                </Text>
              </View>
              <Text className="text-green-600 text-xs mt-1">Đang hoạt động</Text>
            </View>
            
            <View className="flex-1 bg-gray-100 rounded-xl p-3">
              <View className="flex-row items-center">
                <Ionicons name="notifications-off" size={20} color="#6b7280" />
                <Text className="text-gray-600 font-bold text-lg ml-2">
                  {inactiveAlerts.length}
                </Text>
              </View>
              <Text className="text-gray-500 text-xs mt-1">Đã tắt</Text>
            </View>
          </View>

          {/* Section Header */}
          <Text className="text-sm font-medium text-gray-500 mb-2">
            Danh sách cảnh báo ({alerts.length})
          </Text>
        </View>
      )}
    />
  );
};
