import { useEffect, useCallback, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const PUSH_TOKEN_KEY = '@push_token';

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

interface NotificationSettings {
  enabled: boolean;
  priceAlerts: boolean;
  dailySummary: boolean;
  sound: boolean;
  vibrate: boolean;
}

export const useNotifications = () => {
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [permission, setPermission] = useState<boolean>(false);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Handle notification response (deep linking)
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    console.log('[Notifications] Notification tapped:', data);

    if (!data) return;

    // Handle different notification types
    switch (data.type) {
      case 'price-alert':
        // Navigate to price detail screen
        if (data.code) {
          router.push(`/price/${data.code}`);
        } else {
          router.push('/(tabs)/alerts');
        }
        break;

      case 'price-update':
        // Navigate to home or specific price
        if (data.code) {
          router.push(`/price/${data.code}`);
        } else {
          router.push('/(tabs)');
        }
        break;

      case 'portfolio':
        // Navigate to portfolio
        router.push('/(tabs)/portfolio');
        break;

      case 'daily-summary':
        // Navigate to charts
        router.push('/(tabs)/charts');
        break;

      default:
        // Default: go to home
        router.push('/(tabs)');
        break;
    }
  }, [router]);

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    let token: string | null = null;

    // Check if we're on a physical device
    if (!Constants.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      setPermission(false);
      return null;
    }

    setPermission(true);

    // Get Expo push token
    try {
      const response = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      token = response.data;
      setExpoPushToken(token);
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to get push token:', error);
    }

    // Configure Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4AF37',
      });

      await Notifications.setNotificationChannelAsync('price-alerts', {
        name: 'Cảnh báo giá',
        description: 'Thông báo khi giá vàng đạt mức cảnh báo',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4AF37',
        sound: 'default',
      });
    }

    return token;
  }, []);

  // Schedule local notification
  const scheduleNotification = useCallback(async (
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ) => {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger || null, // null = immediate
    });
  }, []);

  // Send price alert notification
  const sendPriceAlert = useCallback(async (
    productName: string,
    condition: 'above' | 'below',
    targetPrice: number,
    currentPrice: number,
    code?: string
  ) => {
    const conditionText = condition === 'above' ? 'vượt trên' : 'xuống dưới';
    
    await scheduleNotification(
      '🔔 Cảnh báo giá vàng!',
      `${productName} đã ${conditionText} ${targetPrice.toLocaleString('vi-VN')}đ. Giá hiện tại: ${currentPrice.toLocaleString('vi-VN')}đ`,
      { 
        type: 'price-alert', 
        productName, 
        targetPrice, 
        currentPrice,
        code, // Include code for deep linking
      }
    );
  }, [scheduleNotification]);

  // Cancel notification
  const cancelNotification = useCallback(async (identifier: string) => {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }, []);

  // Cancel all notifications
  const cancelAllNotifications = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  // Get badge count
  const getBadgeCount = useCallback(async () => {
    return await Notifications.getBadgeCountAsync();
  }, []);

  // Set badge count
  const setBadgeCount = useCallback(async (count: number) => {
    await Notifications.setBadgeCountAsync(count);
  }, []);

  useEffect(() => {
    registerForPushNotifications();

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [registerForPushNotifications, handleNotificationResponse]);

  return {
    expoPushToken,
    notification,
    permission,
    registerForPushNotifications,
    scheduleNotification,
    sendPriceAlert,
    cancelNotification,
    cancelAllNotifications,
    getBadgeCount,
    setBadgeCount,
    handleNotificationResponse,
  };
};
