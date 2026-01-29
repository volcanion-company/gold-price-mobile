import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { usePrices, usePriceHistory, useGoldCodes } from '../../src/hooks';
import { useThemeContext, useLanguage } from '../../src/contexts';
import { LoadingSpinner, ErrorDisplay } from '../../src/components/common';
import { AuthGuard } from '../../src/components/auth';
import { formatPrice, formatPriceShort, formatDateShort } from '../../src/utils/formatters';
import { COLORS } from '../../src/utils/constants';
import { PricePeriod, GoldPrice } from '../../src/types';
import { GoldCodeInfo } from '../../src/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;

type PeriodOption = {
  label: string;
  value: PricePeriod;
};

const PERIODS: PeriodOption[] = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '1Y', value: '1y' },
];

// Preferred order for displaying codes (will filter by available)
const PREFERRED_CODES_ORDER = ['XAUUSD', 'SJL1L10', 'DOJINHTV', 'PNJL1L', 'MIHOS99'];

// Zoomable Chart Component
interface ZoomableChartProps {
  chartData: Array<{ value: number; date: Date; label: string }>;
  chartWidth: number;
  isDark: boolean;
  formatYLabel: (label: string) => string;
}

function ZoomableChart({ chartData, chartWidth, isDark, formatYLabel }: ZoomableChartProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const CONTAINER_HEIGHT = 180;
  const CHART_HEIGHT = 160; // Actual chart drawing height (smaller to fit labels)
  const MIN_SCALE = 1;
  const MAX_SCALE = 3;

  // Clamp translation to keep chart within bounds
  const clampTranslation = (translate: number, scale: number, dimension: number) => {
    'worklet';
    const maxTranslate = (dimension * (scale - 1)) / 2;
    return Math.max(-maxTranslate, Math.min(maxTranslate, translate));
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, savedScale.value * e.scale));
      scale.value = newScale;
      
      // Adjust translation to keep within bounds when scale changes
      translateX.value = clampTranslation(savedTranslateX.value, newScale, chartWidth);
      translateY.value = clampTranslation(savedTranslateY.value, newScale, CONTAINER_HEIGHT);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = clampTranslation(
          savedTranslateX.value + e.translationX,
          scale.value,
          chartWidth
        );
        translateY.value = clampTranslation(
          savedTranslateY.value + e.translationY,
          scale.value,
          CONTAINER_HEIGHT
        );
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedScale.value = 1;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={{ overflow: 'hidden', borderRadius: 8, height: CONTAINER_HEIGHT }}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={animatedStyle}>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={CHART_HEIGHT}
            color={COLORS.gold[400]}
            thickness={2}
            startFillColor={COLORS.gold[400]}
            endFillColor="rgba(230, 184, 0, 0.1)"
            areaChart
            curved
            hideDataPoints
            yAxisTextStyle={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 10 }}
            xAxisLabelTextStyle={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 9 }}
            hideRules
            showVerticalLines={false}
            initialSpacing={16}
            endSpacing={16}
            adjustToWidth
            formatYLabel={formatYLabel}
            xAxisLabelsVerticalShift={2}
            xAxisThickness={0}
            yAxisThickness={0}
            noOfSections={4}
            disableScroll
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function ChartsScreen() {
  return (
    <AuthGuard>
      <ChartsContent />
    </AuthGuard>
  );
}

function ChartsContent() {
  const { prices, isLoading: isPricesLoading, error: pricesError } = usePrices();
  const { codes: goldCodes, isLoading: isCodesLoading, error: codesError } = useGoldCodes();
  const { isDark } = useThemeContext();
  const { t } = useLanguage();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PricePeriod>('1w');
  
  // Create a map for code name lookup
  const codeNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    goldCodes.forEach(item => {
      map[item.code] = item.name;
    });
    return map;
  }, [goldCodes]);

  // Get available codes - prefer from goldCodes API, fallback to prices
  const availableCodes = useMemo(() => {
    // If we have gold codes from API, use them
    if (goldCodes && goldCodes.length > 0) {
      const allCodes = goldCodes.map(g => g.code);
      
      // Sort: preferred codes first, then others alphabetically
      const preferredAvailable = PREFERRED_CODES_ORDER.filter(code => allCodes.includes(code));
      const otherCodes = allCodes.filter(code => !PREFERRED_CODES_ORDER.includes(code)).sort();
      
      return [...preferredAvailable, ...otherCodes];
    }
    
    // Fallback to prices data
    if (!prices || prices.length === 0) return [];
    
    // Get all codes from prices
    const allCodes = prices.map(p => p.code);
    
    // Sort: preferred codes first, then others alphabetically
    const preferredAvailable = PREFERRED_CODES_ORDER.filter(code => allCodes.includes(code));
    const otherCodes = allCodes.filter(code => !PREFERRED_CODES_ORDER.includes(code)).sort();
    
    return [...preferredAvailable, ...otherCodes];
  }, [goldCodes, prices]);

  // Auto-select first available code when prices load
  useEffect(() => {
    if (availableCodes.length > 0 && !selectedCode) {
      setSelectedCode(availableCodes[0]);
    }
    // If selected code is no longer available, switch to first available
    if (selectedCode && availableCodes.length > 0 && !availableCodes.includes(selectedCode)) {
      setSelectedCode(availableCodes[0]);
    }
  }, [availableCodes, selectedCode]);

  // Only fetch history when we have a valid selected code
  const { history, isLoading: isHistoryLoading, error, refetch } = usePriceHistory(
    selectedCode || '',
    selectedPeriod
  );

  const selectedPrice = useMemo(
    () => prices.find((p) => p.code === selectedCode),
    [prices, selectedCode]
  );

  // Generate mock data for demo when no history available or error
  const generateMockData = useCallback(() => {
    const basePrice = selectedPrice?.sellPrice || 8000000;
    const dataLength = 20;
    const labelInterval = Math.ceil(dataLength / 5);
    
    return Array.from({ length: dataLength }, (_, i) => {
      const date = new Date(Date.now() - (dataLength - i) * 86400000);
      return {
        value: basePrice + (Math.random() - 0.5) * (basePrice * 0.05),
        date,
        label: i % labelInterval === 0 || i === dataLength - 1 
          ? formatDateShort(date.toISOString()) 
          : '',
      };
    });
  }, [selectedPrice?.sellPrice]);

  const chartData = useMemo(() => {
    if (!history || history.length === 0 || error) {
      // Use mock data when no history available or API error
      return generateMockData();
    }
    
    const labelInterval = Math.max(1, Math.ceil(history.length / 5));
    
    return history.map((item, index) => ({
      value: item.sellPrice || item.buyPrice || 0,
      date: new Date(item.timestamp),
      label: index % labelInterval === 0 || index === history.length - 1
        ? formatDateShort(item.timestamp) 
        : '',
    }));
  }, [history, error, generateMockData]);

  // Check if using demo data
  const isUsingDemoData = !history || history.length === 0 || !!error;

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const changePercent = ((change / first) * 100).toFixed(2);
    
    return { min, max, first, last, change, changePercent };
  }, [chartData]);

  const handleCodeSelect = useCallback((code: string) => {
    setSelectedCode(code);
  }, []);

  const handlePeriodSelect = useCallback((period: PricePeriod) => {
    setSelectedPeriod(period);
  }, []);

  const isLoading = (isPricesLoading || isCodesLoading) && prices.length === 0 && goldCodes.length === 0;

  // Helper function to get code display name
  const getCodeDisplayName = useCallback((code: string) => {
    return codeNameMap[code] || code;
  }, [codeNameMap]);

  // Show loading while fetching prices
  if (isLoading) {
    return <LoadingSpinner fullScreen text={t('common.loading')} />;
  }

  // Show error if no prices available
  if (pricesError && prices.length === 0) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-gray-50'}`} edges={['top']}>
        <ErrorDisplay 
          message={t('charts.noPricesAvailable', { defaultValue: 'Could not load gold prices' })}
          onRetry={() => {}}
        />
      </SafeAreaView>
    );
  }

  // Show message if no codes available
  if (availableCodes.length === 0) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-gray-50'}`} edges={['top']}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-5xl mb-4">📊</Text>
          <Text className={`text-lg font-semibold text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('charts.noDataAvailable', { defaultValue: 'No price data available' })}
          </Text>
          <Text className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('charts.waitingForData', { defaultValue: 'Waiting for price data from server...' })}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-gray-50'}`} edges={[]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Code Selector - shows available codes from API */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className={`py-3 border-b ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-gray-100'}`}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {availableCodes.map((code, index) => {
            const isSelected = code === selectedCode;
            const isLast = index === availableCodes.length - 1;
            return (
              <Pressable
                key={code}
                className={`px-4 py-2 rounded-full border ${isLast ? '' : 'mr-2'} ${
                  isSelected
                    ? 'bg-gold-400 border-gold-400'
                    : isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-100 border-gray-200'
                }`}
                onPress={() => handleCodeSelect(code)}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {getCodeDisplayName(code)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Current Price Card */}
        {selectedPrice && (
          <View className={`mx-4 mt-4 p-4 rounded-2xl shadow-sm ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {getCodeDisplayName(selectedPrice.code)}
                </Text>
                <Text className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {formatPrice(selectedPrice.sellPrice)}
                </Text>
              </View>
              
              {stats && (
                <View className={`px-3 py-1.5 rounded-lg ${
                  stats.change >= 0 
                    ? isDark ? 'bg-green-900/40' : 'bg-green-100' 
                    : isDark ? 'bg-red-900/40' : 'bg-red-100'
                }`}>
                  <Text className={`text-sm font-semibold ${
                    stats.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.change >= 0 ? '▲' : '▼'} {stats.changePercent}%
                  </Text>
                </View>
              )}
            </View>
            
            <View className={`flex-row mt-3 pt-3 border-t ${isDark ? 'border-dark-border' : 'border-gray-100'}`}>
              <View className="flex-1">
                <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('compare.buyIn')}</Text>
                <Text className="text-base font-semibold text-blue-600">
                  {formatPrice(selectedPrice.buyPrice)}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('compare.sellOut')}</Text>
                <Text className="text-base font-semibold text-green-600">
                  {formatPrice(selectedPrice.sellPrice)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Period Selector */}
        <View className={`flex-row mx-4 mt-4 p-1 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-gray-100'}`}>
          {PERIODS.map((period) => {
            const isSelected = period.value === selectedPeriod;
            return (
              <Pressable
                key={period.value}
                className={`flex-1 py-2 rounded-lg ${
                  isSelected 
                    ? isDark ? 'bg-dark-surface shadow-sm' : 'bg-white shadow-sm' 
                    : 'bg-transparent'
                }`}
                onPress={() => handlePeriodSelect(period.value)}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    isSelected ? 'text-gold-500' : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {period.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Chart */}
        <View className={`mx-4 mt-4 p-4 rounded-2xl shadow-sm ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
          {isHistoryLoading ? (
            <View className="h-[200px] items-center justify-center">
              <LoadingSpinner text={t('charts.loadingChart')} />
            </View>
          ) : (
            <>
              {isUsingDemoData && (
                <View className={`mb-2 px-3 py-1.5 rounded-lg self-start ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                  <Text className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    📊 {t('charts.demoData', { defaultValue: 'Demo data - API not available' })}
                  </Text>
                </View>
              )}
              <ZoomableChart
                chartData={chartData}
                chartWidth={CHART_WIDTH - 48}
                isDark={isDark}
                formatYLabel={(label) => formatPriceShort(Number(label))}
              />
              <Text className={`text-xs text-center mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('charts.pinchToZoom', { defaultValue: 'Pinch to zoom • Double tap to reset' })}
              </Text>
            </>
          )}
        </View>

        {/* Stats */}
        {stats && (
          <View className="mx-4 mt-4 mb-6">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              📊 {t('charts.statistics')} ({PERIODS.find((p) => p.value === selectedPeriod)?.label})
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <View className={`flex-1 min-w-[45%] p-3 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
                <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('charts.stats.low')}</Text>
                <Text className="text-base font-bold text-green-600">
                  {formatPrice(stats.min)}
                </Text>
              </View>
              <View className={`flex-1 min-w-[45%] p-3 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
                <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('charts.stats.high')}</Text>
                <Text className="text-base font-bold text-red-600">
                  {formatPrice(stats.max)}
                </Text>
              </View>
              <View className={`flex-1 min-w-[45%] p-3 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
                <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('charts.periodStart')}</Text>
                <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {formatPrice(stats.first)}
                </Text>
              </View>
              <View className={`flex-1 min-w-[45%] p-3 rounded-xl ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
                <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('charts.stats.change')}</Text>
                <Text className={`text-base font-bold ${
                  stats.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.change >= 0 ? '+' : ''}{formatPrice(stats.change)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
