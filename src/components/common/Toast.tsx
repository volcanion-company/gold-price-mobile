import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';

export interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide?: () => void;
}

const TOAST_COLORS = {
  success: {
    bg: 'bg-green-500',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-500',
    icon: '✕',
  },
  warning: {
    bg: 'bg-yellow-500',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-500',
    icon: 'ℹ',
  },
};

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  if (!visible) return null;

  const { bg, icon } = TOAST_COLORS[type];

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
      className="absolute top-12 left-4 right-4 z-50"
    >
      <Pressable
        onPress={hideToast}
        className={`${bg} rounded-xl p-4 flex-row items-center shadow-lg`}
      >
        <Text className="text-white text-lg mr-3">{icon}</Text>
        <Text className="text-white font-medium flex-1">{message}</Text>
      </Pressable>
    </Animated.View>
  );
};
