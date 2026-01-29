import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useLanguage } from '../../contexts';

interface OfflineIndicatorProps {
  // Show at top (below status bar) or bottom
  position?: 'top' | 'bottom';
  // Custom message
  message?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'top',
  message,
}) => {
  const { t } = useLanguage();
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const isOffline = !isConnected || isInternetReachable === false;

  useEffect(() => {
    if (isOffline) {
      // Slide in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: position === 'top' ? -50 : 50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOffline, position, slideAnim, opacityAnim]);

  if (!isOffline) {
    return null;
  }

  const displayMessage = message || t('common.noInternet');

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top'
          ? { top: insets.top }
          : { bottom: insets.bottom },
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={18} color="#fff" />
        <Text style={styles.text}>{displayMessage}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default OfflineIndicator;
