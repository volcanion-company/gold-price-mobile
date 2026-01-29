import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, Linking, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as Application from 'expo-application';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SettingItem, SettingsSection, AppInfo } from '../../src/components/settings';
import { useTheme, useAuth } from '../../src/hooks';
import { useLanguage } from '../../src/contexts';
import { storageService } from '../../src/services';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, themePreference, setTheme, colors } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState({
    push: true,
    priceAlerts: true,
    dailySummary: false,
  });
  const [cacheSize, setCacheSize] = useState(t('common.loading'));

  // Calculate cache size on mount
  React.useEffect(() => {
    const calculateCache = async () => {
      const { sizeFormatted } = await storageService.getStorageSize();
      setCacheSize(sizeFormatted);
    };
    calculateCache();
  }, []);

  const getThemeLabel = () => {
    return isDark ? t('settings.themeDark') : t('settings.themeLight');
  };

  const handleThemeToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(value ? 'dark' : 'light');
  };

  const handleLanguageChange = async (lang: 'vi' | 'en') => {
    if (lang === language) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(lang);
  };

  const handleClearCache = () => {
    Alert.alert(
      t('settings.clearCache'),
      t('settings.clearCacheConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: async () => {
            await storageService.clearCache();
            setCacheSize('0 B');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      ]
    );
  };

  const handleCheckUpdate = () => {
    Alert.alert(
      t('settings.checkUpdate'),
      t('settings.upToDate'),
      [{ text: 'OK' }]
    );
  };

  const handleRateApp = async () => {
    // Replace with actual App Store / Play Store links
    const url = 'https://apps.apple.com';
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const handleShareApp = async () => {
    // Implement share functionality
    Alert.alert(t('settings.shareApp'), t('settings.shareInDev'));
  };

  const handleFeedback = async () => {
    const email = 'feedback@goldprice.app';
    const subject = 'Góp ý - Gold Price App';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open email:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView 
      edges={['top']} 
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View className="px-4 py-3">
        <Text 
          className="text-2xl font-bold"
          style={{ color: colors.text }}
        >
          {t('settings.title')}
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <SettingsSection title={t('settings.appearance')}>
          <SettingItem
            icon="moon-outline"
            title={t('settings.darkMode')}
            isToggle
            toggleValue={isDark}
            onToggle={handleThemeToggle}
          />
          
          {/* Language Selector - Inline */}
          <View 
            className="flex-row items-center py-3 px-4"
            style={{ backgroundColor: colors.card }}
          >
            <View 
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: `${colors.primary}15` }}
            >
              <Ionicons name="language-outline" size={20} color={colors.primary} />
            </View>
            
            <Text 
              className="flex-1 text-base font-medium"
              style={{ color: colors.text }}
            >
              {t('settings.language')}
            </Text>
            
            {/* Language Toggle Buttons */}
            <View 
              className="flex-row rounded-lg overflow-hidden"
              style={{ backgroundColor: colors.cardSecondary }}
            >
              <Pressable
                onPress={() => handleLanguageChange('vi')}
                className="px-3 py-1.5"
                style={{ 
                  backgroundColor: language === 'vi' ? colors.primary : 'transparent',
                }}
              >
                <Text 
                  className="text-sm font-medium"
                  style={{ color: language === 'vi' ? '#fff' : colors.textSecondary }}
                >
                  🇻🇳 VI
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleLanguageChange('en')}
                className="px-3 py-1.5"
                style={{ 
                  backgroundColor: language === 'en' ? colors.primary : 'transparent',
                }}
              >
                <Text 
                  className="text-sm font-medium"
                  style={{ color: language === 'en' ? '#fff' : colors.textSecondary }}
                >
                  🇺🇸 EN
                </Text>
              </Pressable>
            </View>
          </View>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title={t('settings.notifications')}>
          <SettingItem
            icon="notifications-outline"
            title={t('settings.pushNotifications')}
            isToggle
            toggleValue={notifications.push}
            onToggle={(value) => setNotifications(prev => ({ ...prev, push: value }))}
          />
          <SettingItem
            icon="trending-up-outline"
            title={t('settings.priceAlerts')}
            subtitle={t('settings.priceAlertsDesc')}
            isToggle
            toggleValue={notifications.priceAlerts}
            onToggle={(value) => setNotifications(prev => ({ ...prev, priceAlerts: value }))}
          />
          <SettingItem
            icon="newspaper-outline"
            title={t('settings.dailySummary')}
            subtitle={t('settings.dailySummaryDesc')}
            isToggle
            toggleValue={notifications.dailySummary}
            onToggle={(value) => setNotifications(prev => ({ ...prev, dailySummary: value }))}
          />
        </SettingsSection>

        {/* Data */}
        <SettingsSection title={t('settings.data')}>
          <SettingItem
            icon="refresh-outline"
            title={t('settings.refreshInterval')}
            value={t('settings.realtime')}
            onPress={() => {}}
            showArrow={false}
          />
          <SettingItem
            icon="file-tray-outline"
            title={t('settings.cacheSize')}
            value={cacheSize}
            showArrow={false}
          />
          <SettingItem
            icon="trash-outline"
            title={t('settings.clearCache')}
            iconColor="#ef4444"
            iconBackground="#fee2e2"
            onPress={handleClearCache}
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title={t('settings.account')}>
          {isAuthenticated ? (
            <>
              {/* User Profile Card */}
              <Pressable
                className="flex-row items-center p-4 mb-2 rounded-xl"
                style={{ backgroundColor: colors.card }}
                onPress={() => router.push('/settings/profile')}
              >
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.primary + '20' }}
                >
                  <Text className="text-2xl">👤</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: colors.text }}>
                    {user?.name}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    {user?.email}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>
              
              <SettingItem
                icon="log-out-outline"
                iconColor="#ef4444"
                iconBackground="#fee2e2"
                title={t('auth.logout')}
                onPress={handleLogout}
              />
            </>
          ) : (
            <>
              <SettingItem
                icon="log-in-outline"
                iconColor="#3b82f6"
                iconBackground="#dbeafe"
                title={t('auth.login')}
                subtitle={t('settings.loginDesc')}
                onPress={() => router.push('/auth/login')}
              />
              <SettingItem
                icon="person-add-outline"
                iconColor="#10b981"
                iconBackground="#d1fae5"
                title={t('auth.register')}
                subtitle={t('auth.noAccount')}
                onPress={() => router.push('/auth/register')}
              />
            </>
          )}
          <SettingItem
            icon="diamond-outline"
            iconColor="#8b5cf6"
            iconBackground="#ede9fe"
            title={t('settings.upgradePremium')}
            subtitle={t('settings.premiumDesc')}
            onPress={() => {}}
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title={t('settings.about')}>
          <SettingItem
            icon="star-outline"
            iconColor="#f59e0b"
            iconBackground="#fef3c7"
            title={t('settings.rateApp')}
            onPress={handleRateApp}
          />
          <SettingItem
            icon="share-social-outline"
            title={t('settings.shareApp')}
            onPress={handleShareApp}
          />
          <SettingItem
            icon="chatbubble-outline"
            title={t('settings.feedback')}
            onPress={handleFeedback}
          />
        </SettingsSection>

        {/* App Info */}
        <AppInfo
          version={Application.nativeApplicationVersion || '1.0.0'}
          buildNumber={Application.nativeBuildVersion || '1'}
          onCheckUpdate={handleCheckUpdate}
        />

        {/* Bottom Spacing */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
