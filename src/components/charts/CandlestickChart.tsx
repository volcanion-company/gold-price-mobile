import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Line, Rect, G, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../../utils/constants';
import type { PriceHistory } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CandlestickData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: PriceHistory[];
  height?: number;
  bullColor?: string;
  bearColor?: string;
  loading?: boolean;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  height = 250,
  bullColor = '#22c55e',
  bearColor = '#ef4444',
  loading = false,
}) => {
  const chartWidth = SCREEN_WIDTH - 40;
  const chartHeight = height - 40;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const candleData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group data by day
    const grouped = data.reduce((acc, item) => {
      const dateKey = new Date(item.timestamp).toDateString();
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    }, {} as Record<string, PriceHistory[]>);
    
    // Create OHLC data for each day
    return Object.entries(grouped).map(([dateKey, items]) => {
      const sorted = items.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const prices = items.map(i => i.buy);
      
      return {
        date: new Date(dateKey),
        open: sorted[0].buy,
        close: sorted[sorted.length - 1].buy,
        high: Math.max(...prices),
        low: Math.min(...prices),
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data]);

  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (candleData.length === 0) {
      return { minPrice: 0, maxPrice: 100, priceRange: 100 };
    }
    
    const allPrices = candleData.flatMap(c => [c.high, c.low]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const range = max - min;
    const padding = range * 0.1;
    
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      priceRange: range + padding * 2,
    };
  }, [candleData]);

  const scaleY = (price: number) => {
    return paddingTop + ((maxPrice - price) / priceRange) * chartHeight;
  };

  const candleWidth = Math.max(
    4,
    (chartWidth - paddingLeft - paddingRight) / candleData.length - 4
  );

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

  if (candleData.length === 0) {
    return (
      <View 
        className="items-center justify-center bg-gray-100 rounded-xl"
        style={{ height }}
      >
        <Text className="text-gray-500">Không đủ dữ liệu để hiển thị</Text>
      </View>
    );
  }

  // Price labels for Y axis
  const priceLabels = Array.from({ length: 5 }, (_, i) => {
    const price = maxPrice - (priceRange * i) / 4;
    return {
      price,
      y: scaleY(price),
      label: (price / 1000000).toFixed(2) + 'M',
    };
  });

  return (
    <View>
      <Svg width={chartWidth} height={height}>
        {/* Y-axis labels */}
        {priceLabels.map((label, index) => (
          <G key={index}>
            <Line
              x1={paddingLeft}
              y1={label.y}
              x2={chartWidth - paddingRight}
              y2={label.y}
              stroke="#e5e7eb"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <SvgText
              x={paddingLeft - 8}
              y={label.y + 4}
              fontSize={10}
              fill="#6b7280"
              textAnchor="end"
            >
              {label.label}
            </SvgText>
          </G>
        ))}

        {/* Candlesticks */}
        {candleData.map((candle, index) => {
          const x = paddingLeft + index * ((chartWidth - paddingLeft - paddingRight) / candleData.length) + candleWidth / 2;
          const isBull = candle.close >= candle.open;
          const color = isBull ? bullColor : bearColor;
          
          const bodyTop = scaleY(Math.max(candle.open, candle.close));
          const bodyBottom = scaleY(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(1, bodyBottom - bodyTop);
          
          return (
            <G key={index}>
              {/* Wick (high-low line) */}
              <Line
                x1={x}
                y1={scaleY(candle.high)}
                x2={x}
                y2={scaleY(candle.low)}
                stroke={color}
                strokeWidth={1}
              />
              {/* Body */}
              <Rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={isBull ? color : color}
                stroke={color}
                strokeWidth={1}
              />
            </G>
          );
        })}

        {/* X-axis labels */}
        {candleData.map((candle, index) => {
          if (index % Math.ceil(candleData.length / 5) !== 0) return null;
          
          const x = paddingLeft + index * ((chartWidth - paddingLeft - paddingRight) / candleData.length) + candleWidth / 2;
          
          return (
            <SvgText
              key={`label-${index}`}
              x={x}
              y={height - 10}
              fontSize={9}
              fill="#6b7280"
              textAnchor="middle"
            >
              {candle.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend */}
      <View className="flex-row justify-center mt-2 space-x-4">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: bullColor }} />
          <Text className="text-xs text-gray-600">Tăng</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-sm mr-1" style={{ backgroundColor: bearColor }} />
          <Text className="text-xs text-gray-600">Giảm</Text>
        </View>
      </View>
    </View>
  );
};
