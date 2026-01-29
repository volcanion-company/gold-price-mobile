import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle, StyleSheet, DimensionValue } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#F3F4F6'], // gray-200 to gray-100
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

export function SkeletonPriceCard() {
  return (
    <View className="bg-white dark:bg-gray-800 p-4 rounded-2xl mb-3">
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Skeleton width={120} height={16} style={styles.marginBottom} />
          <Skeleton width={80} height={12} />
        </View>
        <Skeleton width={60} height={24} borderRadius={12} />
      </View>
      
      <View className="flex-row justify-between">
        <View className="flex-1">
          <Skeleton width={40} height={12} style={styles.marginBottom} />
          <Skeleton width={100} height={24} />
        </View>
        <View className="flex-1 items-end">
          <Skeleton width={40} height={12} style={styles.marginBottom} />
          <Skeleton width={100} height={24} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonPriceRow() {
  return (
    <View className="flex-row items-center py-4 px-4 border-b border-gray-100 dark:border-gray-700">
      <View className="flex-1">
        <Skeleton width={100} height={16} style={styles.marginBottom} />
        <Skeleton width={60} height={12} />
      </View>
      <View className="items-end mr-4">
        <Skeleton width={80} height={16} style={styles.marginBottom} />
        <Skeleton width={80} height={12} />
      </View>
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
  );
}

export function SkeletonAlertCard() {
  return (
    <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3">
      <View className="flex-row justify-between items-start mb-2">
        <Skeleton width={120} height={16} />
        <Skeleton width={60} height={24} borderRadius={12} />
      </View>
      <Skeleton width="80%" height={14} style={styles.marginBottom} />
      <Skeleton width="60%" height={14} />
    </View>
  );
}

export function SkeletonPortfolioCard() {
  return (
    <View className="bg-white dark:bg-gray-800 p-4 rounded-2xl mb-3">
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Skeleton width={100} height={16} style={styles.marginBottom} />
          <Skeleton width={60} height={12} />
        </View>
        <Skeleton width={80} height={28} borderRadius={14} />
      </View>
      
      <View className="flex-row justify-between">
        <View>
          <Skeleton width={80} height={12} style={styles.marginBottom} />
          <Skeleton width={100} height={20} />
        </View>
        <View className="items-end">
          <Skeleton width={80} height={12} style={styles.marginBottom} />
          <Skeleton width={100} height={20} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3, type = 'card' }: { count?: number; type?: 'card' | 'row' | 'alert' | 'portfolio' }) {
  const Component = {
    card: SkeletonPriceCard,
    row: SkeletonPriceRow,
    alert: SkeletonAlertCard,
    portfolio: SkeletonPortfolioCard,
  }[type];

  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <Component key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: 8,
  },
});
