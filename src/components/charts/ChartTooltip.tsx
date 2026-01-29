import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../utils/constants';
import type { PriceHistory } from '../../types';

interface ChartTooltipProps {
  visible: boolean;
  data: PriceHistory | null;
  position?: { x: number; y: number };
  style?: object;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  visible,
  data,
  position = { x: 0, y: 0 },
  style,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 150 });
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 100 });
      scale.value = withTiming(0.8, { duration: 100 });
    }
  }, [visible]);

  useEffect(() => {
    translateX.value = withSpring(position.x, { damping: 20, stiffness: 200 });
    translateY.value = withSpring(position.y, { damping: 20, stiffness: 200 });
  }, [position.x, position.y]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (!data) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const spread = data.sell - data.buy;

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <View style={styles.content}>
          {/* Time */}
          <Text style={styles.time}>{formatDate(data.timestamp)}</Text>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Buy Price */}
          <View style={styles.row}>
            <View style={[styles.indicator, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.label}>Mua:</Text>
            <Text style={styles.value}>{formatPrice(data.buy)}</Text>
          </View>
          
          {/* Sell Price */}
          <View style={styles.row}>
            <View style={[styles.indicator, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.label}>Bán:</Text>
            <Text style={styles.value}>{formatPrice(data.sell)}</Text>
          </View>
          
          {/* Spread */}
          <View style={styles.row}>
            <View style={[styles.indicator, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.label}>Chênh:</Text>
            <Text style={styles.value}>{formatPrice(spread)}</Text>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    minWidth: 180,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  blur: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 12,
  },
  time: {
    color: '#9ca3af',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  label: {
    color: '#d1d5db',
    fontSize: 12,
    width: 50,
  },
  value: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});
