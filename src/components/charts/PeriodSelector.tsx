import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../utils/constants';

export type ChartPeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

interface PeriodOption {
  key: ChartPeriod;
  label: string;
  days: number | null;
}

const PERIODS: PeriodOption[] = [
  { key: '1D', label: '1 ngày', days: 1 },
  { key: '1W', label: '1 tuần', days: 7 },
  { key: '1M', label: '1 tháng', days: 30 },
  { key: '3M', label: '3 tháng', days: 90 },
  { key: '6M', label: '6 tháng', days: 180 },
  { key: '1Y', label: '1 năm', days: 365 },
  { key: 'ALL', label: 'Tất cả', days: null },
];

interface PeriodSelectorProps {
  selectedPeriod: ChartPeriod;
  onSelectPeriod: (period: ChartPeriod) => void;
  variant?: 'default' | 'compact' | 'pills';
  disabled?: boolean;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onSelectPeriod,
  variant = 'default',
  disabled = false,
}) => {
  const handleSelect = (period: ChartPeriod) => {
    if (disabled || period === selectedPeriod) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectPeriod(period);
  };

  if (variant === 'pills') {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-4"
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {PERIODS.map((period) => {
          const isSelected = selectedPeriod === period.key;
          
          return (
            <TouchableOpacity
              key={period.key}
              onPress={() => handleSelect(period.key)}
              disabled={disabled}
              className={`
                px-4 py-2 rounded-full mr-2
                ${isSelected ? 'bg-primary' : 'bg-gray-100'}
                ${disabled ? 'opacity-50' : ''}
              `}
              style={isSelected ? { backgroundColor: COLORS.primary } : undefined}
            >
              <Text className={`
                text-sm font-medium
                ${isSelected ? 'text-white' : 'text-gray-600'}
              `}>
                {period.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  if (variant === 'compact') {
    return (
      <View className="flex-row bg-gray-100 rounded-xl p-1 mx-4 mb-4">
        {PERIODS.slice(0, 5).map((period) => {
          const isSelected = selectedPeriod === period.key;
          
          return (
            <TouchableOpacity
              key={period.key}
              onPress={() => handleSelect(period.key)}
              disabled={disabled}
              className={`
                flex-1 py-2 rounded-lg items-center justify-center
                ${disabled ? 'opacity-50' : ''}
              `}
              style={isSelected ? { backgroundColor: COLORS.primary } : undefined}
            >
              <Text className={`
                text-xs font-bold
                ${isSelected ? 'text-white' : 'text-gray-600'}
              `}>
                {period.key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // Default variant
  return (
    <View className="flex-row justify-between bg-gray-50 rounded-xl p-1 mx-4 mb-4">
      {PERIODS.map((period) => {
        const isSelected = selectedPeriod === period.key;
        
        return (
          <TouchableOpacity
            key={period.key}
            onPress={() => handleSelect(period.key)}
            disabled={disabled}
            className={`
              py-2 px-3 rounded-lg items-center justify-center
              ${disabled ? 'opacity-50' : ''}
            `}
            style={isSelected ? { backgroundColor: COLORS.primary } : undefined}
          >
            <Text className={`
              text-xs font-bold
              ${isSelected ? 'text-white' : 'text-gray-600'}
            `}>
              {period.key}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Helper function to get date range for a period
export const getDateRangeForPeriod = (period: ChartPeriod): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();
  
  const periodConfig = PERIODS.find(p => p.key === period);
  
  if (periodConfig?.days) {
    startDate.setDate(startDate.getDate() - periodConfig.days);
  } else {
    // ALL - go back 2 years
    startDate.setFullYear(startDate.getFullYear() - 2);
  }
  
  return { startDate, endDate };
};
