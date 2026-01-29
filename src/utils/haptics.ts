import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utility for consistent haptic responses across the app
 */
export const haptics = {
  /**
   * Light impact feedback - for subtle interactions like switches
   */
  light: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  /**
   * Medium impact feedback - for button presses
   */
  medium: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /**
   * Heavy impact feedback - for significant actions
   */
  heavy: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /**
   * Selection feedback - for picker/scroll selections
   */
  selection: () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  },

  /**
   * Success notification - for successful operations
   */
  success: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  /**
   * Warning notification - for warning states
   */
  warning: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  /**
   * Error notification - for error states
   */
  error: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  /**
   * Tab switch feedback
   */
  tabSwitch: () => {
    haptics.light();
  },

  /**
   * Button press feedback
   */
  buttonPress: () => {
    haptics.medium();
  },

  /**
   * Pull to refresh feedback
   */
  pullToRefresh: () => {
    haptics.medium();
  },

  /**
   * Alert trigger feedback
   */
  alertTrigger: () => {
    haptics.success();
  },

  /**
   * Price update feedback
   */
  priceUpdate: () => {
    haptics.light();
  },

  /**
   * Long press feedback
   */
  longPress: () => {
    haptics.heavy();
  },
};

export default haptics;
