import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrices } from '../../src/hooks';
import { useThemeContext, useLanguage } from '../../src/contexts';
import { LoadingSpinner } from '../../src/components/common';
import { AuthGuard } from '../../src/components/auth';
import { formatPrice } from '../../src/utils/formatters';
import { GOLD_CODES } from '../../src/utils/constants';
import { useAuthStore } from '../../src/stores';

type AlertType = 'above' | 'below';
type AlertPriceType = 'buy' | 'sell';

interface PriceAlert {
  id: string;
  code: string;
  type: AlertType;
  priceType: AlertPriceType;
  targetPrice: number;
  isActive: boolean;
  createdAt: Date;
}

// Demo alerts
const DEMO_ALERTS: PriceAlert[] = [
  {
    id: '1',
    code: 'XAUUSD',
    type: 'above',
    priceType: 'sell',
    targetPrice: 2400,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    code: 'SJL1L10',
    type: 'below',
    priceType: 'buy',
    targetPrice: 8000000,
    isActive: true,
    createdAt: new Date(),
  },
];

export default function AlertsScreen() {
  return (
    <AuthGuard>
      <AlertsContent />
    </AuthGuard>
  );
}

function AlertsContent() {
  const { prices, isLoading } = usePrices();
  const { isAuthenticated } = useAuthStore();
  const { isDark } = useThemeContext();
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<PriceAlert[]>(DEMO_ALERTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form state
  const [selectedCode, setSelectedCode] = useState('XAUUSD');
  const [alertType, setAlertType] = useState<AlertType>('above');
  const [priceType, setPriceType] = useState<AlertPriceType>('sell');
  const [targetPrice, setTargetPrice] = useState('');

  const selectedPrice = prices.find((p) => p.code === selectedCode);

  const handleToggleAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
  }, []);

  const handleDeleteAlert = useCallback((id: string) => {
    Alert.alert(
      t('common.delete'),
      t('alerts.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => setAlerts((prev) => prev.filter((a) => a.id !== id)),
        },
      ]
    );
  }, []);

  const handleCreateAlert = useCallback(() => {
    if (!targetPrice) {
      Alert.alert(t('common.error'), t('alerts.enterTargetPrice'));
      return;
    }

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      code: selectedCode,
      type: alertType,
      priceType,
      targetPrice: Number(targetPrice.replace(/[^\d]/g, '')),
      isActive: true,
      createdAt: new Date(),
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setShowCreateModal(false);
    setTargetPrice('');
    Alert.alert(t('common.success'), t('alerts.alertCreated'));
  }, [selectedCode, alertType, priceType, targetPrice]);

  const renderAlert = (alert: PriceAlert) => {
    const currentPrice = prices.find((p) => p.code === alert.code);
    const current = currentPrice 
      ? (alert.priceType === 'buy' ? currentPrice.buyPrice : currentPrice.sellPrice)
      : 0;
    const diff = alert.targetPrice - current;
    const isTriggered = alert.type === 'above' 
      ? current >= alert.targetPrice 
      : current <= alert.targetPrice;

    return (
      <View
        key={alert.id}
        className={`mx-4 mb-3 p-4 rounded-xl border ${
          isTriggered
            ? isDark ? 'bg-yellow-900/30 border-yellow-600' : 'bg-yellow-50 border-yellow-300'
            : alert.isActive
            ? isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-100'
            : isDark ? 'bg-dark-surface border-dark-border' : 'bg-gray-50 border-gray-100'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className={`text-base font-semibold ${
                alert.isActive 
                  ? isDark ? 'text-white' : 'text-gray-800' 
                  : isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {GOLD_CODES[alert.code] || alert.code}
              </Text>
              {isTriggered && (
                <View className="ml-2 px-2 py-0.5 bg-yellow-400 rounded-full">
                  <Text className="text-xs font-bold text-yellow-900">{t('alerts.triggeredLabel')}</Text>
                </View>
              )}
            </View>
            <Text className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {alert.type === 'above' ? `📈 ${t('alerts.whenAbove')}` : `📉 ${t('alerts.whenBelow')}`}{' '}
              ({alert.priceType === 'buy' ? t('home.buy') : t('home.sell')})
            </Text>
          </View>
          
          <Switch
            value={alert.isActive}
            onValueChange={() => handleToggleAlert(alert.id)}
            trackColor={{ false: isDark ? '#404040' : '#D1D5DB', true: '#FCD34D' }}
            thumbColor={alert.isActive ? '#E6B800' : '#9CA3AF'}
          />
        </View>

        <View className={`flex-row mt-3 pt-3 border-t ${isDark ? 'border-dark-border' : 'border-gray-100'}`}>
          <View className="flex-1">
            <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('alerts.targetPrice')}</Text>
            <Text className={`text-base font-bold ${
              alert.isActive ? 'text-gold-500' : isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {formatPrice(alert.targetPrice)}
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('alerts.currentPrice')}</Text>
            <Text className={`text-base font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {formatPrice(current)}
            </Text>
          </View>
          <View className="flex-1 items-end">
            <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('alerts.difference')}</Text>
            <Text className={`text-base font-semibold ${
              diff > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {diff > 0 ? '+' : ''}{formatPrice(Math.abs(diff))}
            </Text>
          </View>
        </View>

        <Pressable
          className="mt-3 py-2 items-center"
          onPress={() => handleDeleteAlert(alert.id)}
        >
          <Text className="text-sm text-red-500">🗑️ {t('alerts.deleteAlert')}</Text>
        </Pressable>
      </View>
    );
  };

  if (isLoading && prices.length === 0) {
    return <LoadingSpinner fullScreen text={t('common.loading')} />;
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-gray-50'}`} edges={[]}>
      {/* Header */}
      <View className={`flex-row items-center justify-between px-4 py-3 border-b ${isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-gray-100'}`}>
        <View>
          <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('alerts.title')}</Text>
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {alerts.filter((a) => a.isActive).length} {t('alerts.activeCount')}
          </Text>
        </View>
        <Pressable
          className="px-4 py-2 bg-gold-400 rounded-xl"
          onPress={() => setShowCreateModal(true)}
        >
          <Text className="text-white font-semibold">+ {t('alerts.createNew')}</Text>
        </Pressable>
      </View>

      {/* Create Modal */}
      {showCreateModal && (
        <View className="absolute inset-0 bg-black/50 z-50 justify-end">
          <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-dark-surface' : 'bg-white'}`}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {t('alerts.createAlert')}
              </Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <Text className={`text-2xl ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>✕</Text>
              </Pressable>
            </View>

            {/* Code Selector */}
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('alerts.selectGoldType')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {prices.slice(0, 10).map((price) => (
                <Pressable
                  key={price.code}
                  className={`px-4 py-2 mr-2 rounded-full border ${
                    selectedCode === price.code
                      ? 'bg-gold-400 border-gold-400'
                      : isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-100 border-gray-200'
                  }`}
                  onPress={() => setSelectedCode(price.code)}
                >
                  <Text
                    className={`text-sm ${
                      selectedCode === price.code
                        ? 'text-white font-semibold'
                        : isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {GOLD_CODES[price.code] || price.code}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Alert Type */}
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('alerts.alertType')}
            </Text>
            <View className="flex-row gap-3 mb-4">
              <Pressable
                className={`flex-1 p-3 rounded-xl border ${
                  alertType === 'above'
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => setAlertType('above')}
              >
                <Text className={`text-center font-medium ${
                  alertType === 'above' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  📈 {t('alerts.whenAbove')}
                </Text>
              </Pressable>
              <Pressable
                className={`flex-1 p-3 rounded-xl border ${
                  alertType === 'below'
                    ? 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => setAlertType('below')}
              >
                <Text className={`text-center font-medium ${
                  alertType === 'below' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  📉 {t('alerts.whenBelow')}
                </Text>
              </Pressable>
            </View>

            {/* Price Type */}
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('alerts.basedOnPrice')}
            </Text>
            <View className="flex-row gap-3 mb-4">
              <Pressable
                className={`flex-1 p-3 rounded-xl border ${
                  priceType === 'buy'
                    ? isDark ? 'bg-blue-900/40 border-blue-600' : 'bg-blue-50 border-blue-300'
                    : isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => setPriceType('buy')}
              >
                <Text className={`text-center font-medium ${
                  priceType === 'buy' ? 'text-blue-600' : isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  💰 {t('alerts.buyPrice')}
                </Text>
              </Pressable>
              <Pressable
                className={`flex-1 p-3 rounded-xl border ${
                  priceType === 'sell'
                    ? isDark ? 'bg-green-900/40 border-green-600' : 'bg-green-50 border-green-300'
                    : isDark ? 'bg-dark-card border-dark-border' : 'bg-gray-50 border-gray-200'
                }`}
                onPress={() => setPriceType('sell')}
              >
                <Text className={`text-center font-medium ${
                  priceType === 'sell' ? 'text-green-600' : isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  💵 {t('alerts.sellPrice')}
                </Text>
              </Pressable>
            </View>

            {/* Target Price */}
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('alerts.targetPrice')}
            </Text>
            {selectedPrice && (
              <Text className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('alerts.currentPrice')}: {formatPrice(priceType === 'buy' ? selectedPrice.buyPrice : selectedPrice.sellPrice)}
              </Text>
            )}
            <TextInput
              className={`px-4 py-3 rounded-xl text-lg mb-6 ${isDark ? 'bg-dark-card text-white' : 'bg-gray-100 text-gray-800'}`}
              placeholder={t('alerts.targetPricePlaceholder')}
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              keyboardType="numeric"
              value={targetPrice}
              onChangeText={setTargetPrice}
            />

            {/* Create Button */}
            <Pressable
              className="bg-gold-400 py-4 rounded-xl"
              onPress={handleCreateAlert}
            >
              <Text className="text-center text-white text-lg font-bold">
                ✓ {t('alerts.createAlertButton')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Alert List */}
      <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>
        {alerts.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-6xl mb-4">🔔</Text>
            <Text className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('alerts.noAlerts')}
            </Text>
            <Text className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('alerts.noAlertsDesc')}
            </Text>
          </View>
        ) : (
          alerts.map(renderAlert)
        )}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
