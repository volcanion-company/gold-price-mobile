import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrices } from '../../src/hooks';
import { useThemeContext, useLanguage } from '../../src/contexts';
import { PriceCard, LoadingSpinner, ErrorDisplay } from '../../src/components/common';
import { AuthGuard } from '../../src/components/auth';
import { formatPrice, formatPriceChange } from '../../src/utils/formatters';
import { GOLD_CODES } from '../../src/utils/constants';
import { GoldPrice } from '../../src/types';

type CompareMode = 'buy' | 'sell';

export default function CompareScreen() {
  return (
    <AuthGuard>
      <CompareContent />
    </AuthGuard>
  );
}

function CompareContent() {
  const { prices, isLoading, error, refetch } = usePrices();
  const { isDark } = useThemeContext();
  const { t } = useLanguage();
  const [compareMode, setCompareMode] = useState<CompareMode>('buy');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrices = useMemo(() => {
    let filtered = prices;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => 
        p.code.toLowerCase().includes(query) ||
        GOLD_CODES[p.code]?.toLowerCase().includes(query)
      );
    }
    
    // Sort by price
    return filtered.sort((a, b) => {
      const priceA = compareMode === 'buy' ? a.buyPrice : a.sellPrice;
      const priceB = compareMode === 'buy' ? b.buyPrice : b.sellPrice;
      return priceA - priceB;
    });
  }, [prices, searchQuery, compareMode]);

  const bestPrice = useMemo(() => {
    if (filteredPrices.length === 0) return null;
    return filteredPrices[0];
  }, [filteredPrices]);

  const worstPrice = useMemo(() => {
    if (filteredPrices.length === 0) return null;
    return filteredPrices[filteredPrices.length - 1];
  }, [filteredPrices]);

  const renderPriceItem = useCallback((item: GoldPrice, index: number) => {
    const price = compareMode === 'buy' ? item.buyPrice : item.sellPrice;
    const isBest = index === 0;
    const isWorst = index === filteredPrices.length - 1;
    const priceDiff = bestPrice ? price - (compareMode === 'buy' ? bestPrice.buyPrice : bestPrice.sellPrice) : 0;

    return (
      <View
        key={item.code}
        className={`mx-4 mb-3 p-4 rounded-xl border ${
          isBest
            ? isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'
            : isWorst
            ? isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'
            : isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-100'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {GOLD_CODES[item.code] || item.code}
              </Text>
              {isBest && (
                <View className="ml-2 px-2 py-0.5 bg-green-500 rounded-full">
                  <Text className="text-xs font-bold text-white">{t('compare.best')}</Text>
                </View>
              )}
              {isWorst && (
                <View className="ml-2 px-2 py-0.5 bg-red-500 rounded-full">
                  <Text className="text-xs font-bold text-white">{t('compare.highest')}</Text>
                </View>
              )}
            </View>
            <Text className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.code}</Text>
          </View>
          
          <View className="items-end">
            <Text className={`text-lg font-bold ${
              isBest ? 'text-green-600' : isWorst ? 'text-red-600' : isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {formatPrice(price)}
            </Text>
            {priceDiff > 0 && (
              <Text className="text-xs text-red-500">
                +{formatPrice(priceDiff)}
              </Text>
            )}
          </View>
        </View>
        
        <View className={`flex-row mt-3 pt-3 border-t ${isDark ? 'border-dark-border' : 'border-gray-100'}`}>
          <View className="flex-1">
            <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('compare.buyIn')}</Text>
            <Text className={`text-sm font-medium ${
              compareMode === 'buy' ? 'text-blue-600' : isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {formatPrice(item.buyPrice)}
            </Text>
          </View>
          <View className="flex-1 items-end">
            <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('compare.sellOut')}</Text>
            <Text className={`text-sm font-medium ${
              compareMode === 'sell' ? 'text-blue-600' : isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {formatPrice(item.sellPrice)}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [compareMode, filteredPrices, bestPrice]);

  if (isLoading && prices.length === 0) {
    return <LoadingSpinner fullScreen text={t('common.loading')} />;
  }

  if (error && prices.length === 0) {
    return <ErrorDisplay message={t('errors.networkError')} onRetry={refetch} />;
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-gray-50'}`} edges={[]}>
      {/* Header Controls */}
      <View className={`p-4 border-b ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-gray-100'}`}>
        {/* Search */}
        <View className={`flex-row items-center rounded-xl px-4 py-2 mb-3 ${isDark ? 'bg-dark-card' : 'bg-gray-100'}`}>
          <Text className="mr-2">🔍</Text>
          <TextInput
            className={`flex-1 text-base ${isDark ? 'text-white' : 'text-gray-800'}`}
            placeholder={t('compare.searchPlaceholder')}
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Text className={isDark ? 'text-gray-500' : 'text-gray-400'}>✕</Text>
            </Pressable>
          )}
        </View>
        
        {/* Compare Mode Toggle */}
        <View className={`flex-row rounded-xl p-1 ${isDark ? 'bg-dark-card' : 'bg-gray-100'}`}>
          <Pressable
            className={`flex-1 py-2.5 rounded-lg ${
              compareMode === 'buy' ? 'bg-gold-400' : 'bg-transparent'
            }`}
            onPress={() => setCompareMode('buy')}
          >
            <Text className={`text-center font-semibold ${
              compareMode === 'buy' ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              💰 {t('compare.buyPriceLowToHigh')}
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2.5 rounded-lg ${
              compareMode === 'sell' ? 'bg-gold-400' : 'bg-transparent'
            }`}
            onPress={() => setCompareMode('sell')}
          >
            <Text className={`text-center font-semibold ${
              compareMode === 'sell' ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              💵 {t('compare.sellPriceLowToHigh')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Summary */}
      {bestPrice && worstPrice && (
        <View className="flex-row p-4 gap-3">
          <View className="flex-1 bg-green-50 rounded-xl p-3 border border-green-200">
            <Text className="text-xs text-green-600 font-medium">
              {compareMode === 'buy' ? `💚 ${t('compare.lowestBuy')}` : `💚 ${t('compare.lowestSell')}`}
            </Text>
            <Text className="text-base font-bold text-green-700 mt-1">
              {formatPrice(compareMode === 'buy' ? bestPrice.buyPrice : bestPrice.sellPrice)}
            </Text>
            <Text className="text-xs text-green-500">
              {GOLD_CODES[bestPrice.code] || bestPrice.code}
            </Text>
          </View>
          <View className="flex-1 bg-red-50 rounded-xl p-3 border border-red-200">
            <Text className="text-xs text-red-600 font-medium">
              {compareMode === 'buy' ? `❤️ ${t('compare.highestBuy')}` : `❤️ ${t('compare.highestSell')}`}
            </Text>
            <Text className="text-base font-bold text-red-700 mt-1">
              {formatPrice(compareMode === 'buy' ? worstPrice.buyPrice : worstPrice.sellPrice)}
            </Text>
            <Text className="text-xs text-red-500">
              {GOLD_CODES[worstPrice.code] || worstPrice.code}
            </Text>
          </View>
        </View>
      )}

      {/* Price List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pb-4">
          {filteredPrices.map(renderPriceItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
