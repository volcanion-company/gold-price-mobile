import React from 'react';
import { View, Text } from 'react-native';
import { formatPriceChange, formatPercentChange } from '../../utils/formatters';
import { getPriceChangeColor } from '../../utils/helpers';

interface PriceChangeProps {
  change?: number;
  changePercent?: number;
  currency?: 'VND' | 'USD';
  size?: 'sm' | 'md' | 'lg';
}

export function PriceChange({
  change = 0,
  changePercent,
  currency = 'VND',
  size = 'md',
}: PriceChangeProps) {
  const changeColor = getPriceChangeColor(change);
  
  const textSizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  const colorClass = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  }[changeColor];

  const bgColorClass = {
    up: 'bg-green-50',
    down: 'bg-red-50',
    neutral: 'bg-gray-100',
  }[changeColor];

  const arrow = change > 0 ? '▲' : change < 0 ? '▼' : '─';
  const formattedChange = formatPriceChange(change, currency);
  const formattedPercent = changePercent !== undefined 
    ? formatPercentChange(changePercent)
    : null;

  return (
    <View className={`flex-row items-center px-2 py-1 rounded ${bgColorClass}`}>
      <Text className={`${textSizeClass} ${colorClass} font-medium`}>
        {arrow} {formattedChange}
        {formattedPercent && ` (${formattedPercent})`}
      </Text>
    </View>
  );
}
