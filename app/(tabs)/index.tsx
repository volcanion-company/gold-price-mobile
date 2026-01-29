import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePrices } from '../../src/hooks';
import { useThemeContext, useLanguage } from '../../src/contexts';
import { WorldGoldCard, SJCPriceCard } from '../../src/components/home';
import { PriceRow, LoadingSpinner, ErrorDisplay } from '../../src/components/common';
import { formatDateTime } from '../../src/utils/formatters';
import { sortPricesByPriority } from '../../src/utils/helpers';
import { GoldPrice } from '../../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const { prices, isLoading, isFetching, error, refetch } = usePrices();
  const { isDark, colors } = useThemeContext();
  const { t } = useLanguage();

  const sortedPrices = useMemo(() => sortPricesByPriority(prices), [prices]);
  
  const worldGold = useMemo(
    () => prices.find((p) => p.code === 'XAUUSD'),
    [prices]
  );
  
  const sjcPrice = useMemo(
    () => prices.find((p) => p.code === 'SJL1L10'),
    [prices]
  );
  
  const dojiPrice = useMemo(
    () => prices.find((p) => p.code === 'DOJINHTV'),
    [prices]
  );
  
  const otherPrices = useMemo(
    () => sortedPrices.filter((p) => !['XAUUSD', 'SJL1L10', 'DOJINHTV'].includes(p.code)),
    [sortedPrices]
  );

  const lastUpdated = useMemo(() => {
    if (prices.length > 0 && prices[0].updatedAt) {
      return formatDateTime(prices[0].updatedAt);
    }
    return null;
  }, [prices]);

  const handlePricePress = useCallback((code: string) => {
    router.push(`/price/${code}`);
  }, [router]);

  const renderPriceRow = useCallback(({ item }: { item: GoldPrice }) => (
    <PriceRow
      price={item}
      onPress={() => handlePricePress(item.code)}
    />
  ), [handlePricePress]);

  if (isLoading && prices.length === 0) {
    return <LoadingSpinner fullScreen text={t('common.loading')} />;
  }

  if (error && prices.length === 0) {
    return (
      <ErrorDisplay
        message={t('errors.networkError')}
        onRetry={refetch}
      />
    );
  }

  return (
    <SafeAreaView 
      className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-gray-50'}`} 
      edges={['top']}
    >
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor="#E6B800"
            colors={['#E6B800']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          {/* World Gold Card */}
          {worldGold && (
            <WorldGoldCard
              price={worldGold}
              onPress={() => handlePricePress('XAUUSD')}
            />
          )}

          {/* SJC & DOJI Cards */}
          <View className="flex-row gap-3 mt-4">
            {sjcPrice && (
              <SJCPriceCard
                price={sjcPrice}
                onPress={() => handlePricePress('SJL1L10')}
              />
            )}
            {dojiPrice && (
              <SJCPriceCard
                price={dojiPrice}
                onPress={() => handlePricePress('DOJINHTV')}
              />
            )}
          </View>

          {/* Last Updated */}
          {lastUpdated && (
            <View className="flex-row items-center justify-center mt-4">
              <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                ⏱️ {t('common.lastUpdated')}: {lastUpdated}
              </Text>
            </View>
          )}
        </View>

        {/* All Prices Section */}
        <View className="mt-2">
          <View className={`px-4 py-3 ${isDark ? 'bg-dark-surface' : 'bg-gray-100'}`}>
            <Text className={`text-sm font-semibold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('home.allPrices')}
            </Text>
          </View>
          
          <View>
            {otherPrices.map((item) => (
              <PriceRow
                key={item.code}
                price={item}
                onPress={() => handlePricePress(item.code)}
              />
            ))}
          </View>
        </View>

        {/* Bottom Spacer */}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
