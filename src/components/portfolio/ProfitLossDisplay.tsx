import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../contexts';
import { formatPrice, formatPercent } from '../../utils/formatters';

interface ProfitLossDisplayProps {
  profitLoss: number;
  profitLossPercent: number;
  investedAmount: number;
  currentValue: number;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export const ProfitLossDisplay: React.FC<ProfitLossDisplayProps> = ({
  profitLoss,
  profitLossPercent,
  investedAmount,
  currentValue,
  size = 'medium',
  showDetails = true,
}) => {
  const { isDark } = useThemeContext();
  
  const isProfit = profitLoss >= 0;
  const colorClass = isProfit 
    ? 'text-green-600 dark:text-green-500' 
    : 'text-red-600 dark:text-red-500';
  const bgColorClass = isProfit 
    ? 'bg-green-100 dark:bg-green-900/30' 
    : 'bg-red-100 dark:bg-red-900/30';
  const iconName = isProfit ? 'trending-up' : 'trending-down';
  const iconColor = isProfit ? '#22c55e' : '#ef4444';

  const sizeConfig = {
    small: {
      container: 'p-2',
      iconSize: 16,
      titleSize: 'text-xs',
      valueSize: 'text-sm',
      percentSize: 'text-xs',
    },
    medium: {
      container: 'p-3',
      iconSize: 20,
      titleSize: 'text-sm',
      valueSize: 'text-lg',
      percentSize: 'text-sm',
    },
    large: {
      container: 'p-4',
      iconSize: 24,
      titleSize: 'text-base',
      valueSize: 'text-2xl',
      percentSize: 'text-base',
    },
  };

  const config = sizeConfig[size];

  return (
    <View className={`rounded-xl ${bgColorClass} ${config.container}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name={iconName} size={config.iconSize} color={iconColor} />
          <Text className={`${config.titleSize} text-gray-600 dark:text-gray-400 ml-2`}>
            {isProfit ? 'Lãi' : 'Lỗ'}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <Text className={`${config.valueSize} font-bold ${colorClass}`}>
            {isProfit ? '+' : ''}{formatPrice(profitLoss)}
          </Text>
          <View className={`ml-2 px-2 py-0.5 rounded-full ${bgColorClass}`}>
            <Text className={`${config.percentSize} font-semibold ${colorClass}`}>
              {isProfit ? '+' : ''}{formatPercent(profitLossPercent)}
            </Text>
          </View>
        </View>
      </View>

      {showDetails && (
        <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <View>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Đã đầu tư
            </Text>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatPrice(investedAmount)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Giá trị hiện tại
            </Text>
            <Text className={`text-sm font-medium ${colorClass}`}>
              {formatPrice(currentValue)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfitLossDisplay;
