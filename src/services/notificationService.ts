import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const PUSH_TOKEN_KEY = '@push_token';
const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  priceAlerts: boolean;
  dailySummary: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface LocalNotificationData {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  categoryId?: string;
  sound?: boolean;
  badge?: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  priceAlerts: true,
  dailySummary: false,
  sound: true,
  vibration: true,
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Notification Service for managing push and local notifications
 */
export const notificationService = {
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('[NotificationService] Push notifications require a physical device');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  },

  /**
   * Register for push notifications and get Expo push token
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Check permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('[NotificationService] Notification permission not granted');
        return null;
      }

      // Get project ID from app config
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      
      const token = tokenData.data;
      console.log('[NotificationService] Push token:', token);
      
      // Save token locally
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      
      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }
      
      return token;
    } catch (error) {
      console.error('[NotificationService] Failed to register for push:', error);
      return null;
    }
  },

  /**
   * Get saved push token
   */
  async getPushToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    } catch (error) {
      console.error('[NotificationService] Failed to get push token:', error);
      return null;
    }
  },

  /**
   * Set up Android notification channels
   */
  async setupAndroidChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    // Price alerts channel
    await Notifications.setNotificationChannelAsync('price-alerts', {
      name: 'Cảnh báo giá',
      description: 'Thông báo khi giá đạt mục tiêu',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f59e0b',
      sound: 'default',
    });

    // Daily summary channel
    await Notifications.setNotificationChannelAsync('daily-summary', {
      name: 'Tóm tắt hàng ngày',
      description: 'Báo cáo giá mỗi ngày',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });

    // General channel
    await Notifications.setNotificationChannelAsync('general', {
      name: 'Chung',
      description: 'Thông báo chung từ ứng dụng',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  },

  /**
   * Send a local notification
   */
  async sendLocalNotification(notification: LocalNotificationData): Promise<string> {
    const settings = await this.getSettings();
    
    const notificationContent: Notifications.NotificationContentInput = {
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      sound: settings.sound ? 'default' : undefined,
      badge: notification.badge,
    };

    // Add category for iOS
    if (notification.categoryId) {
      notificationContent.categoryIdentifier = notification.categoryId;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: null, // Immediate
    });

    console.log('[NotificationService] Local notification sent:', id);
    return id;
  },

  /**
   * Send price alert notification
   */
  async sendPriceAlertNotification(params: {
    productName: string;
    condition: 'above' | 'below';
    targetPrice: number;
    currentPrice: number;
  }): Promise<string | null> {
    const settings = await this.getSettings();
    
    if (!settings.enabled || !settings.priceAlerts) {
      console.log('[NotificationService] Price alerts disabled');
      return null;
    }

    const conditionText = params.condition === 'above' ? 'vượt trên' : 'xuống dưới';
    
    return await this.sendLocalNotification({
      title: '🔔 Cảnh báo giá vàng!',
      body: `${params.productName} đã ${conditionText} ${params.targetPrice.toLocaleString('vi-VN')}đ\nGiá hiện tại: ${params.currentPrice.toLocaleString('vi-VN')}đ`,
      data: {
        type: 'price_alert',
        productName: params.productName,
        condition: params.condition,
        targetPrice: params.targetPrice,
        currentPrice: params.currentPrice,
      },
      categoryId: 'price-alerts',
    });
  },

  /**
   * Schedule daily summary notification
   */
  async scheduleDailySummary(hour: number = 8, minute: number = 0): Promise<string> {
    // Cancel existing daily summary
    await this.cancelScheduledNotification('daily-summary');

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Tóm tắt giá vàng hôm nay',
        body: 'Nhấn để xem chi tiết giá vàng hôm nay',
        data: { type: 'daily_summary' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
      identifier: 'daily-summary',
    });

    console.log('[NotificationService] Daily summary scheduled:', id);
    return id;
  },

  /**
   * Cancel a scheduled notification
   */
  async cancelScheduledNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log('[NotificationService] Cancelled notification:', identifier);
  },

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[NotificationService] All notifications cancelled');
  },

  /**
   * Get notification settings
   */
  async getSettings(): Promise<NotificationSettings> {
    try {
      const saved = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('[NotificationService] Failed to get settings:', error);
    }
    return DEFAULT_SETTINGS;
  },

  /**
   * Save notification settings
   */
  async saveSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
      console.log('[NotificationService] Settings saved');
    } catch (error) {
      console.error('[NotificationService] Failed to save settings:', error);
      throw error;
    }
  },

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Add notification response listener (when user taps notification)
   */
  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  /**
   * Handle notification response (for deep linking)
   */
  handleNotificationResponse(response: Notifications.NotificationResponse): {
    type: string;
    data: Record<string, unknown>;
  } | null {
    const data = response.notification.request.content.data as Record<string, unknown>;
    
    if (!data?.type) {
      return null;
    }

    return {
      type: data.type as string,
      data,
    };
  },

  /**
   * Get last notification response (for app launch from notification)
   */
  async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    return await Notifications.getLastNotificationResponseAsync();
  },

  /**
   * Set badge count (iOS only)
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  },

  /**
   * Clear badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  },
};

export default notificationService;
