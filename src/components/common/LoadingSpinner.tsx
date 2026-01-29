import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useThemeContext } from '../../contexts';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = '#E6B800',
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const { colors } = useThemeContext();

  const content = (
    <View 
      className="items-center justify-center"
      accessibilityRole="progressbar"
      accessibilityLabel={text || 'Đang tải'}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
          {text}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        {content}
      </View>
    );
  }

  return content;
}
