import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { COLORS } from '../../utils/constants';
import type { PriceHistory } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LineChartProps {
  data: PriceHistory[];
  height?: number;
  showDataPoints?: boolean;
  showArea?: boolean;
  color?: string;
  areaColor?: string;
  onPointPress?: (item: PriceHistory, index: number) => void;
  loading?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  showDataPoints = false,
  showArea = true,
  color = COLORS.primary,
  areaColor,
  onPointPress,
  loading = false,
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((item, index) => ({
      value: item.buy,
      dataPointText: '',
      label: index % Math.ceil(data.length / 5) === 0 
        ? new Date(item.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
        : '',
      originalData: item,
    }));
  }, [data]);

  const { minValue, maxValue } = useMemo(() => {
    if (!data || data.length === 0) return { minValue: 0, maxValue: 100 };
    
    const values = data.map(d => d.buy);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    
    return {
      minValue: Math.floor((min - padding) / 100000) * 100000,
      maxValue: Math.ceil((max + padding) / 100000) * 100000,
    };
  }, [data]);

  const priceChange = useMemo(() => {
    if (!data || data.length < 2) return { value: 0, percent: 0 };
    
    const first = data[0].buy;
    const last = data[data.length - 1].buy;
    const change = last - first;
    const percent = (change / first) * 100;
    
    return { value: change, percent };
  }, [data]);

  if (loading) {
    return (
      <View 
        className="items-center justify-center bg-gray-100 rounded-xl"
        style={{ height }}
      >
        <Text className="text-gray-500">Đang tải biểu đồ...</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View 
        className="items-center justify-center bg-gray-100 rounded-xl"
        style={{ height }}
      >
        <Text className="text-gray-500">Không có dữ liệu</Text>
      </View>
    );
  }

  const isPositive = priceChange.value >= 0;

  return (
    <View>
      {/* Price Change Summary */}
      <View className="flex-row items-center mb-3 px-2">
        <Text className="text-2xl font-bold text-gray-900">
          {data[data.length - 1]?.buy.toLocaleString('vi-VN')}đ
        </Text>
        <View className={`ml-2 px-2 py-1 rounded-full ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
          <Text className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{priceChange.value.toLocaleString('vi-VN')}đ ({priceChange.percent.toFixed(2)}%)
          </Text>
        </View>
      </View>

      {/* Chart */}
      <GiftedLineChart
        data={chartData}
        width={SCREEN_WIDTH - 60}
        height={height}
        spacing={(SCREEN_WIDTH - 80) / Math.max(chartData.length - 1, 1)}
        color={color}
        thickness={2}
        hideRules
        hideYAxisText
        hideAxesAndRules
        areaChart={showArea}
        startFillColor={areaColor || `${color}40`}
        endFillColor={areaColor || `${color}10`}
        startOpacity={0.4}
        endOpacity={0.1}
        initialSpacing={10}
        endSpacing={10}
        hideDataPoints={!showDataPoints}
        dataPointsColor={color}
        dataPointsRadius={4}
        curved
        curvature={0.2}
        pointerConfig={{
          pointerStripUptoDataPoint: true,
          pointerStripColor: COLORS.gray,
          pointerStripWidth: 1,
          pointerColor: color,
          radius: 6,
          pointerLabelWidth: 120,
          pointerLabelHeight: 60,
          activatePointersOnLongPress: true,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: any[]) => {
            const item = items[0];
            if (!item?.originalData) return null;
            
            return (
              <View className="bg-gray-900 px-3 py-2 rounded-lg shadow-lg">
                <Text className="text-white text-xs mb-1">
                  {new Date(item.originalData.timestamp).toLocaleString('vi-VN')}
                </Text>
                <Text className="text-white font-bold">
                  Mua: {item.originalData.buy.toLocaleString('vi-VN')}đ
                </Text>
                <Text className="text-white font-bold">
                  Bán: {item.originalData.sell.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            );
          },
        }}
      />
    </View>
  );
};
