import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext, useLanguage } from '../../contexts';
import { formatPrice } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';

interface AlertHistoryItem {
  id: string;
  productName: string;
  providerName: string;
  targetPrice: number;
  triggeredPrice: number;
  condition: 'above' | 'below';
  priceType: 'buy' | 'sell';
  triggeredAt: string;
}

interface AlertHistoryProps {
  history: AlertHistoryItem[];
  onItemPress?: (item: AlertHistoryItem) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export const AlertHistory: React.FC<AlertHistoryProps> = ({
  history,
  onItemPress,
  emptyMessage,
  loading = false,
}) => {
  const { isDark } = useThemeContext();
  const { t } = useLanguage();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('time.justNow');
    if (diffMins < 60) return `${diffMins} ${t('time.minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('time.hoursAgo')}`;
    if (diffDays === 1) return t('time.yesterday');
    if (diffDays < 7) return `${diffDays} ${t('time.daysAgo')}`;
    
    return date.toLocaleDateString('vi-VN');
  };

  const renderItem = ({ item }: { item: AlertHistoryItem }) => {
    const isAbove = item.condition === 'above';
    
    return (
      <TouchableOpacity
        onPress={() => onItemPress?.(item)}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        activeOpacity={0.7}
      >
        <View className="flex-row items-start justify-between">
          {/* Left: Product info */}
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <View 
                className={`w-6 h-6 rounded-full items-center justify-center mr-2 ${
                  isAbove ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}
              >
                <Ionicons 
                  name={isAbove ? 'arrow-up' : 'arrow-down'} 
                  size={14} 
                  color={isAbove ? '#22c55e' : '#ef4444'} 
                />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {item.productName}
              </Text>
            </View>
            
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {item.providerName}
            </Text>

            <View className="flex-row items-center">
              <View className="mr-4">
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {t('alerts.targetPrice')}
                </Text>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatPrice(item.targetPrice)}
                </Text>
              </View>
              
              <Ionicons 
                name="arrow-forward" 
                size={16} 
                color={isDark ? '#6b7280' : '#9ca3af'} 
              />
              
              <View className="ml-4">
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {t('alerts.currentPrice')}
                </Text>
                <Text className={`text-sm font-medium ${
                  isAbove ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                }`}>
                  {formatPrice(item.triggeredPrice)}
                </Text>
              </View>
            </View>
          </View>

          {/* Right: Time */}
          <View className="items-end">
            <View className="bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full mb-1">
              <Text className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {t('alerts.triggeredLabel')}
              </Text>
            </View>
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {formatTime(item.triggeredAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-12">
      <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mb-4">
        <Ionicons 
          name="notifications-off-outline" 
          size={32} 
          color={isDark ? '#6b7280' : '#9ca3af'} 
        />
      </View>
      <Text className="text-gray-500 dark:text-gray-400 text-center">
        {emptyMessage || 'Chưa có cảnh báo nào được kích hoạt'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Text className="text-gray-500 dark:text-gray-400">
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={history}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ 
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexGrow: 1,
      }}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default AlertHistory;
