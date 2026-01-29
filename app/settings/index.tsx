import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useSettingsStore, useAuthStore } from '../../src/stores';

type SettingItem = {
  icon: string;
  title: string;
  subtitle?: string;
  type: 'link' | 'switch' | 'value';
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    pushNotifications,
    priceAlertSound,
    priceAlertVibration,
    setPushNotifications,
    setPriceAlertSound,
    setPriceAlertVibration,
  } = useSettingsStore();

  const accountSection: SettingItem[] = isAuthenticated
    ? [
        {
          icon: '👤',
          title: user?.name || 'Người dùng',
          subtitle: user?.email,
          type: 'link',
          onPress: () => {},
        },
        {
          icon: '🔐',
          title: 'Đổi mật khẩu',
          type: 'link',
          onPress: () => {},
        },
      ]
    : [
        {
          icon: '🔑',
          title: 'Đăng nhập / Đăng ký',
          subtitle: 'Đăng nhập để đồng bộ dữ liệu',
          type: 'link',
          onPress: () => router.push('/auth/login'),
        },
      ];

  const notificationSection: SettingItem[] = [
    {
      icon: '🔔',
      title: 'Thông báo',
      subtitle: 'Nhận thông báo đẩy',
      type: 'switch',
      value: pushNotifications,
      onToggle: setPushNotifications,
    },
    {
      icon: '🔊',
      title: 'Âm thanh',
      subtitle: 'Phát âm thanh khi có thông báo',
      type: 'switch',
      value: priceAlertSound,
      onToggle: setPriceAlertSound,
    },
    {
      icon: '📳',
      title: 'Rung',
      subtitle: 'Rung khi có thông báo',
      type: 'switch',
      value: priceAlertVibration,
      onToggle: setPriceAlertVibration,
    },
  ];

  const widgetSection: SettingItem[] = [
    {
      icon: '📱',
      title: 'Cài đặt Widget',
      subtitle: 'Tùy chỉnh widget màn hình chính',
      type: 'link',
      onPress: () => router.push('/settings/widget'),
    },
  ];

  const appSection: SettingItem[] = [
    {
      icon: '⭐',
      title: 'Đánh giá ứng dụng',
      type: 'link',
      onPress: () => {
        // Open app store rating
      },
    },
    {
      icon: '📤',
      title: 'Chia sẻ ứng dụng',
      type: 'link',
      onPress: () => {
        // Share app
      },
    },
    {
      icon: '📞',
      title: 'Liên hệ hỗ trợ',
      type: 'link',
      onPress: () => Linking.openURL('mailto:support@goldprice.vn'),
    },
    {
      icon: '📜',
      title: 'Điều khoản sử dụng',
      type: 'link',
      onPress: () => Linking.openURL('https://goldprice.vn/terms'),
    },
    {
      icon: '🔒',
      title: 'Chính sách bảo mật',
      type: 'link',
      onPress: () => Linking.openURL('https://goldprice.vn/privacy'),
    },
  ];

  const aboutSection: SettingItem[] = [
    {
      icon: 'ℹ️',
      title: 'Phiên bản',
      type: 'value',
      value: '1.0.0',
    },
  ];

  const renderSection = (title: string, items: SettingItem[]) => (
    <View className="mb-6">
      <Text className="px-4 mb-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
        {title}
      </Text>
      <View className="bg-white rounded-xl mx-4">
        {items.map((item, index) => (
          <Pressable
            key={item.title}
            className={`flex-row items-center px-4 py-3 ${
              index < items.length - 1 ? 'border-b border-gray-100' : ''
            }`}
            onPress={item.onPress}
            disabled={item.type === 'switch' || item.type === 'value'}
          >
            <Text className="text-2xl mr-3">{item.icon}</Text>
            <View className="flex-1">
              <Text className="text-base text-gray-800">{item.title}</Text>
              {item.subtitle && (
                <Text className="text-sm text-gray-500 mt-0.5">
                  {item.subtitle}
                </Text>
              )}
            </View>
            
            {item.type === 'switch' && item.onToggle && (
              <Switch
                value={item.value as boolean}
                onValueChange={item.onToggle}
                trackColor={{ false: '#D1D5DB', true: '#FCD34D' }}
                thumbColor={item.value ? '#E6B800' : '#9CA3AF'}
              />
            )}
            
            {item.type === 'value' && (
              <Text className="text-gray-500">{item.value}</Text>
            )}
            
            {item.type === 'link' && (
              <Text className="text-gray-400">›</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Cài đặt',
        }}
      />
      
      <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}>
        <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>
          {renderSection('Tài khoản', accountSection)}
          {renderSection('Thông báo', notificationSection)}
          {renderSection('Widget', widgetSection)}
          {renderSection('Ứng dụng', appSection)}
          {renderSection('Thông tin', aboutSection)}
          
          {isAuthenticated && (
            <Pressable
              className="mx-4 mb-6 py-3 bg-red-50 rounded-xl border border-red-200"
              onPress={() => {
                logout();
                router.replace('/');
              }}
            >
              <Text className="text-center text-red-600 font-semibold">
                🚪 Đăng xuất
              </Text>
            </Pressable>
          )}
          
          <View className="items-center pb-8">
            <Text className="text-xs text-gray-400">Made with ❤️ in Vietnam</Text>
            <Text className="text-xs text-gray-400 mt-1">© 2024 Gold Price App</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
