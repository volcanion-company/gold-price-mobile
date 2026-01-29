import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { GoldPrice } from '../../types';
import { GOLD_CODES, GOLD_CODE_DETAILS } from '../../utils/constants';
import { formatPrice } from '../../utils/formatters';
import { PriceChange } from '../common';

interface BrandPriceListProps {
  prices: GoldPrice[];
  category?: 'sjc' | 'doji' | 'pnj' | 'other' | 'all';
  onPricePress?: (code: string) => void;
  title?: string;
  showHeader?: boolean;
}

export const BrandPriceList: React.FC<BrandPriceListProps> = ({
  prices,
  category = 'all',
  onPricePress,
  title,
  showHeader = true,
}) => {
  const filteredPrices = useMemo(() => {
    if (category === 'all') {
      return prices;
    }
    
    return prices.filter((price) => {
      const details = GOLD_CODE_DETAILS[price.code as keyof typeof GOLD_CODE_DETAILS];
      return details?.category === category;
    });
  }, [prices, category]);

  const renderItem = ({ item }: { item: GoldPrice }) => {
    const displayName = GOLD_CODES[item.code] || item.name || item.code;
    
    return (
      <Pressable
        onPress={() => onPricePress?.(item.code)}
        className="flex-row items-center justify-between py-3 px-4 bg-white border-b border-gray-50 active:bg-gray-50"
      >
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
            {displayName}
          </Text>
          <Text className="text-xs text-gray-400 mt-0.5">
            {item.code}
          </Text>
        </View>

        <View className="items-end mr-4">
          <Text className="text-sm text-gray-500">Mua</Text>
          <Text className="text-sm font-semibold text-gray-800">
            {formatPrice(item.buyPrice, item.currency)}
          </Text>
        </View>

        <View className="items-end mr-4">
          <Text className="text-sm text-gray-500">Bán</Text>
          <Text className="text-sm font-semibold text-gray-800">
            {formatPrice(item.sellPrice, item.currency)}
          </Text>
        </View>

        <View className="items-end min-w-16">
          <PriceChange
            change={item.changeBuy || item.change || 0}
            currency={item.currency}
            size="sm"
          />
        </View>
      </Pressable>
    );
  };

  const getCategoryTitle = () => {
    if (title) return title;
    
    switch (category) {
      case 'sjc':
        return 'Vàng SJC';
      case 'doji':
        return 'Vàng DOJI';
      case 'pnj':
        return 'Vàng PNJ';
      case 'other':
        return 'Thương hiệu khác';
      default:
        return 'Tất cả giá vàng';
    }
  };

  return (
    <View className="bg-white rounded-xl overflow-hidden shadow-sm">
      {showHeader && (
        <View className="px-4 py-3 border-b border-gray-100">
          <Text className="text-base font-semibold text-gray-800">
            {getCategoryTitle()}
          </Text>
          <Text className="text-xs text-gray-400 mt-0.5">
            {filteredPrices.length} loại vàng
          </Text>
        </View>
      )}
      
      <View className="min-h-20">
        {filteredPrices.map((item) => renderItem({ item }))}
      </View>
    </View>
  );
};
