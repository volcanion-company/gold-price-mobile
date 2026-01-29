import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-gifted-charts';
import { usePrices, usePriceHistory, useTheme } from '../../src/hooks';
import { useLanguage } from '../../src/contexts';
import { PriceChange, LoadingSpinner, ErrorDisplay } from '../../src/components/common';
import { formatPrice, formatPriceFull, formatDateTime, formatDateShort } from '../../src/utils/formatters';
import { GOLD_CODES, COLORS } from '../../src/utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PriceDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const { prices, isLoading: isPricesLoading } = usePrices();
  const { history, isLoading: isHistoryLoading } = usePriceHistory(code || '', '1w');

  const price = useMemo(
    () => prices.find((p) => p.code === code),
    [prices, code]
  );

  const chartData = useMemo(() => {
    if (!history || history.length === 0) {
      // Demo data
      return Array.from({ length: 14 }, (_, i) => ({
        value: 8000000 + Math.random() * 200000,
        label: i % 3 === 0 ? `${i + 1}` : '',
      }));
    }
    
    return history.map((item, index) => ({
      value: item.sellPrice,
      label: index % Math.ceil(history.length / 5) === 0 
        ? formatDateShort(item.timestamp) 
        : '',
    }));
  }, [history]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    return { min, max, avg };
  }, [chartData]);

  if (isPricesLoading && !price) {
    return <LoadingSpinner fullScreen text={t('common.loading')} />;
  }

  if (!price) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <ErrorDisplay
          message={t('common.noData')}
          onRetry={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const goldName = GOLD_CODES[price.code] || price.code;
  const spread = price.sellPrice - price.buyPrice;
  const spreadPercent = ((spread / price.buyPrice) * 100).toFixed(2);

  return (
    <>
      <Stack.Screen
        options={{
          title: goldName,
          headerBackTitle: t('common.close'),
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }}
      />
      
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['bottom']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <LinearGradient
            colors={isDark ? ['#B8860B', '#996515'] : ['#E6B800', '#CC9900']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="mx-4 mt-4 p-5 rounded-2xl"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gold-100 text-sm">{price.code}</Text>
                <Text className="text-white text-xl font-bold">{goldName}</Text>
              </View>
              
              {price.change !== undefined && (
                <View className={`px-3 py-1.5 rounded-full ${
                  price.change >= 0 ? 'bg-white/20' : 'bg-white/20'
                }`}>
                  <Text className="text-white font-semibold">
                    {price.change >= 0 ? '▲' : '▼'} {price.changePercent?.toFixed(2)}%
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row mt-4">
              <View className="flex-1">
                <Text className="text-gold-100 text-xs">Mua vào</Text>
                <Text className="text-white text-2xl font-bold">
                  {formatPrice(price.buyPrice)}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-gold-100 text-xs">Bán ra</Text>
                <Text className="text-white text-2xl font-bold">
                  {formatPrice(price.sellPrice)}
                </Text>
              </View>
            </View>

            {price.updatedAt && (
              <Text className="text-gold-100 text-xs mt-3 text-center">
                ⏱️ Cập nhật: {formatDateTime(price.updatedAt)}
              </Text>
            )}
          </LinearGradient>

          {/* Price Details */}
          <View 
            className="mx-4 mt-4 p-4 rounded-2xl"
            style={{ backgroundColor: colors.card }}
          >
            <Text 
              className="text-base font-semibold mb-3"
              style={{ color: colors.text }}
            >
              📊 {t('charts.statistics', { defaultValue: 'Chi tiết giá' })}
            </Text>
            
            <View className="space-y-3">
              <View 
                className="flex-row justify-between py-2 border-b"
                style={{ borderColor: colors.border }}
              >
                <Text style={{ color: colors.textSecondary }}>{t('compare.difference', { defaultValue: 'Chênh lệch mua/bán' })}</Text>
                <Text className="font-semibold" style={{ color: colors.text }}>
                  {formatPrice(spread)} ({spreadPercent}%)
                </Text>
              </View>
              
              {price.change !== undefined && (
                <View 
                  className="flex-row justify-between py-2 border-b"
                  style={{ borderColor: colors.border }}
                >
                  <Text style={{ color: colors.textSecondary }}>{t('home.change')}</Text>
                  <PriceChange change={price.change} changePercent={price.changePercent} />
                </View>
              )}
              
              {price.provider && (
                <View 
                  className="flex-row justify-between py-2 border-b"
                  style={{ borderColor: colors.border }}
                >
                  <Text style={{ color: colors.textSecondary }}>{t('common.noData', { defaultValue: 'Nguồn' })}</Text>
                  <Text className="font-semibold" style={{ color: colors.text }}>{price.provider}</Text>
                </View>
              )}
              
              {price.unit && (
                <View className="flex-row justify-between py-2">
                  <Text style={{ color: colors.textSecondary }}>{t('portfolio.unit.gram', { defaultValue: 'Đơn vị' })}</Text>
                  <Text className="font-semibold" style={{ color: colors.text }}>{price.unit}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Chart Section */}
          <View 
            className="mx-4 mt-4 p-4 rounded-2xl"
            style={{ backgroundColor: colors.card }}
          >
            <Text 
              className="text-base font-semibold mb-3"
              style={{ color: colors.text }}
            >
              📈 {t('charts.period.1W', { defaultValue: 'Biểu đồ 7 ngày' })}
            </Text>
            
            {isHistoryLoading ? (
              <View className="h-[180px] items-center justify-center">
                <LoadingSpinner text="Đang tải..." />
              </View>
            ) : (
              <LineChart
                data={chartData}
                width={SCREEN_WIDTH - 80}
                height={180}
                color={COLORS.gold[400]}
                thickness={2}
                startFillColor={COLORS.gold[400]}
                endFillColor="rgba(230, 184, 0, 0.1)"
                areaChart
                curved
                hideDataPoints
                yAxisTextStyle={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                xAxisLabelTextStyle={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
                hideRules
                showVerticalLines={false}
                initialSpacing={0}
                endSpacing={0}
                adjustToWidth
              />
            )}
          </View>

          {/* Statistics */}
          {stats && (
            <View className="mx-4 mt-4 mb-6">
              <Text 
                className="text-base font-semibold mb-3"
                style={{ color: colors.text }}
              >
                📋 {t('charts.statistics')} (7 {t('time.daysAgo', { defaultValue: 'ngày' })})
              </Text>
              <View className="flex-row gap-3">
                <View 
                  className="flex-1 p-3 rounded-xl"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#f0fdf4',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0',
                  }}
                >
                  <Text className="text-xs" style={{ color: isDark ? '#4ade80' : '#16a34a' }}>
                    {t('charts.stats.low')}
                  </Text>
                  <Text className="text-base font-bold" style={{ color: isDark ? '#86efac' : '#15803d' }}>
                    {formatPrice(stats.min)}
                  </Text>
                </View>
                <View 
                  className="flex-1 p-3 rounded-xl"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe',
                  }}
                >
                  <Text className="text-xs" style={{ color: isDark ? '#60a5fa' : '#2563eb' }}>
                    {t('charts.stats.average')}
                  </Text>
                  <Text className="text-base font-bold" style={{ color: isDark ? '#93c5fd' : '#1d4ed8' }}>
                    {formatPrice(stats.avg)}
                  </Text>
                </View>
                <View 
                  className="flex-1 p-3 rounded-xl"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
                  }}
                >
                  <Text className="text-xs" style={{ color: isDark ? '#f87171' : '#dc2626' }}>
                    {t('charts.stats.high')}
                  </Text>
                  <Text className="text-base font-bold" style={{ color: isDark ? '#fca5a5' : '#b91c1c' }}>
                    {formatPrice(stats.max)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="mx-4 mb-6 flex-row gap-3">
            <Pressable 
              className="flex-1 py-3 rounded-xl active:opacity-80"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-center text-white font-semibold">
                🔔 {t('alerts.createAlert')}
              </Text>
            </Pressable>
            <Pressable 
              className="flex-1 py-3 rounded-xl active:opacity-80"
              style={{ backgroundColor: colors.cardSecondary }}
            >
              <Text className="text-center font-semibold" style={{ color: colors.text }}>
                💰 {t('portfolio.addHolding')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
