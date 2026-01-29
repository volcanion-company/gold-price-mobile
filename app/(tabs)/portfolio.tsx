import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrices, useCurrency } from '../../src/hooks';
import { useThemeContext, useLanguage } from '../../src/contexts';
import { LoadingSpinner } from '../../src/components/common';
import { AuthGuard } from '../../src/components/auth';
import { formatPrice, formatPriceChange, formatPercent } from '../../src/utils/formatters';
import { GOLD_CODES } from '../../src/utils/constants';
import { useAuthStore } from '../../src/stores';

interface PortfolioItem {
  id: string;
  code: string;
  quantity: number; // weight in grams or ounces
  unit: 'gram' | 'ounce' | 'luong';
  buyPrice: number;
  buyDate: Date;
  note?: string;
}

// Demo portfolio
const DEMO_PORTFOLIO: PortfolioItem[] = [
  {
    id: '1',
    code: 'SJL1L10',
    quantity: 2,
    unit: 'luong',
    buyPrice: 7800000,
    buyDate: new Date('2024-01-15'),
    note: 'Mua tại SJC quận 1',
  },
  {
    id: '2',
    code: 'XAUUSD',
    quantity: 1,
    unit: 'ounce',
    buyPrice: 2250,
    buyDate: new Date('2024-06-01'),
    note: 'Mua online',
  },
];

const UNIT_LABELS: Record<string, string> = {
  gram: 'gram',
  ounce: 'ounce',
  luong: 'lượng',
};

export default function PortfolioScreen() {
  return (
    <AuthGuard>
      <PortfolioContent />
    </AuthGuard>
  );
}

function PortfolioContent() {
  const { prices, isLoading } = usePrices();
  const { usdToVnd } = useCurrency();
  const { isAuthenticated } = useAuthStore();
  const { isDark } = useThemeContext();
  const { t } = useLanguage();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEMO_PORTFOLIO);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [selectedCode, setSelectedCode] = useState('SJL1L10');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'gram' | 'ounce' | 'luong'>('luong');
  const [buyPrice, setBuyPrice] = useState('');
  const [note, setNote] = useState('');

  const portfolioStats = useMemo(() => {
    let totalInvested = 0;
    let totalCurrentValue = 0;
    
    portfolio.forEach((item) => {
      const currentPrice = prices.find((p) => p.code === item.code);
      if (!currentPrice) return;
      
      // Calculate invested amount
      let investedAmount = item.buyPrice * item.quantity;
      
      // Calculate current value (using sell price)
      let currentValue = currentPrice.sellPrice * item.quantity;
      
      // Adjust for unit if needed
      if (item.code === 'XAUUSD') {
        // XAU is per ounce, convert to VND using dynamic exchange rate
        totalInvested += investedAmount * usdToVnd;
        totalCurrentValue += currentValue * usdToVnd;
      } else {
        totalInvested += investedAmount;
        totalCurrentValue += currentValue;
      }
    });
    
    const profit = totalCurrentValue - totalInvested;
    const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
    
    return { totalInvested, totalCurrentValue, profit, profitPercent };
  }, [portfolio, prices, usdToVnd]);

  const handleDeleteItem = useCallback((id: string) => {
    Alert.alert(
      t('portfolio.deleteInvestment'),
      t('portfolio.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => setPortfolio((prev) => prev.filter((p) => p.id !== id)),
        },
      ]
    );
  }, []);

  const handleAddItem = useCallback(() => {
    if (!quantity || !buyPrice) {
      Alert.alert(t('common.error'), t('portfolio.enterFullInfo'));
      return;
    }

    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      code: selectedCode,
      quantity: Number(quantity),
      unit,
      buyPrice: Number(buyPrice.replace(/[^\d]/g, '')),
      buyDate: new Date(),
      note: note || undefined,
    };

    setPortfolio((prev) => [newItem, ...prev]);
    setShowAddModal(false);
    setQuantity('');
    setBuyPrice('');
    setNote('');
    Alert.alert(t('common.success'), t('portfolio.addedSuccess'));
  }, [selectedCode, quantity, unit, buyPrice, note]);

  const renderPortfolioItem = (item: PortfolioItem) => {
    const currentPrice = prices.find((p) => p.code === item.code);
    const current = currentPrice?.sellPrice || 0;
    const profit = (current - item.buyPrice) * item.quantity;
    const profitPercent = item.buyPrice > 0 
      ? ((current - item.buyPrice) / item.buyPrice) * 100 
      : 0;

    return (
      <View
        key={item.id}
        className={`mx-4 mb-3 p-4 rounded-xl border ${isDark ? 'bg-dark-card border-dark-border' : 'bg-white border-gray-100'}`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {GOLD_CODES[item.code] || item.code}
            </Text>
            <Text className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {item.quantity} {UNIT_LABELS[item.unit]}
            </Text>
          </View>
          
          <View className={`px-3 py-1.5 rounded-lg ${
            profit >= 0 
              ? isDark ? 'bg-green-900/40' : 'bg-green-100' 
              : isDark ? 'bg-red-900/40' : 'bg-red-100'
          }`}>
            <Text className={`text-sm font-semibold ${
              profit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {profit >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View className={`flex-row mt-3 pt-3 border-t ${isDark ? 'border-dark-border' : 'border-gray-100'}`}>
          <View className="flex-1">
            <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('portfolio.buyPrice')}</Text>
            <Text className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {formatPrice(item.buyPrice)}
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('portfolio.currentPrice')}</Text>
            <Text className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {formatPrice(current)}
            </Text>
          </View>
          <View className="flex-1 items-end">
            <Text className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('portfolio.profitLoss')}</Text>
            <Text className={`text-sm font-bold ${
              profit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {profit >= 0 ? '+' : ''}{formatPrice(profit)}
            </Text>
          </View>
        </View>

        {item.note && (
          <Text className={`text-xs mt-2 italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            📝 {item.note}
          </Text>
        )}

        <Pressable
          className="mt-3 py-2 items-center"
          onPress={() => handleDeleteItem(item.id)}
        >
          <Text className="text-sm text-red-500">🗑️ {t('common.delete')}</Text>
        </Pressable>
      </View>
    );
  };

  if (isLoading && prices.length === 0) {
    return <LoadingSpinner fullScreen text={t('common.loading')} />;
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-gray-50'}`} edges={[]}>
      {/* Summary Card */}
      <View className="mx-4 mt-4 p-4 bg-gradient-to-br from-gold-400 to-gold-500 rounded-2xl shadow-lg">
        <Text className="text-gold-100 text-sm">{t('portfolio.totalValue')}</Text>
        <Text className="text-white text-3xl font-bold mt-1">
          {formatPrice(portfolioStats.totalCurrentValue)}
        </Text>
        
        <View className="flex-row items-center mt-2">
          <View className={`px-2 py-1 rounded-full ${
            portfolioStats.profit >= 0 ? 'bg-green-500/30' : 'bg-red-500/30'
          }`}>
            <Text className="text-white text-sm font-semibold">
              {portfolioStats.profit >= 0 ? '📈 +' : '📉 '}
              {portfolioStats.profitPercent.toFixed(1)}%
            </Text>
          </View>
          <Text className="text-gold-100 text-sm ml-2">
            ({portfolioStats.profit >= 0 ? '+' : ''}{formatPrice(portfolioStats.profit)})
          </Text>
        </View>

        <View className="flex-row mt-4 pt-3 border-t border-gold-300/30">
          <View className="flex-1">
            <Text className="text-gold-100 text-xs">{t('portfolio.invested')}</Text>
            <Text className="text-white text-lg font-semibold">
              {formatPrice(portfolioStats.totalInvested)}
            </Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-gold-100 text-xs">{t('portfolio.items')}</Text>
            <Text className="text-white text-lg font-semibold">
              {portfolio.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Add Button */}
      <Pressable
        className={`mx-4 mt-4 py-3 rounded-xl border border-dashed border-gold-400 ${isDark ? 'bg-dark-card' : 'bg-white'}`}
        onPress={() => setShowAddModal(true)}
      >
        <Text className="text-center text-gold-500 font-semibold">
          + {t('portfolio.addNewInvestment')}
        </Text>
      </Pressable>

      {/* Add Modal */}
      {showAddModal && (
        <View className="absolute inset-0 bg-black/50 z-50 justify-end">
          <View className={`rounded-t-3xl p-6 max-h-[80%] ${isDark ? 'bg-dark-surface' : 'bg-white'}`}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {t('portfolio.addHolding')}
              </Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Text className={`text-2xl ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Code Selector */}
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('portfolio.selectGoldType')}
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

              {/* Quantity */}
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('portfolio.quantity')}
              </Text>
              <View className="flex-row gap-2 mb-4">
                <TextInput
                  className={`flex-1 px-4 py-3 rounded-xl ${isDark ? 'bg-dark-card text-white' : 'bg-gray-100 text-gray-800'}`}
                  placeholder={t('portfolio.enterQuantity')}
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
                <View className={`flex-row rounded-xl p-1 ${isDark ? 'bg-dark-card' : 'bg-gray-100'}`}>
                  {(['luong', 'gram', 'ounce'] as const).map((u) => (
                    <Pressable
                      key={u}
                      className={`px-3 py-2 rounded-lg ${
                        unit === u ? isDark ? 'bg-dark-surface' : 'bg-white' : ''
                      }`}
                      onPress={() => setUnit(u)}
                    >
                      <Text className={`text-sm ${
                        unit === u ? 'text-gold-500 font-semibold' : isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {UNIT_LABELS[u]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Buy Price */}
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('portfolio.buyPrice')} (VNĐ/{UNIT_LABELS[unit]})
              </Text>
              <TextInput
                className={`px-4 py-3 rounded-xl mb-4 ${isDark ? 'bg-dark-card text-white' : 'bg-gray-100 text-gray-800'}`}
                placeholder={t('portfolio.enterBuyPrice')}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                keyboardType="numeric"
                value={buyPrice}
                onChangeText={setBuyPrice}
              />

              {/* Note */}
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('portfolio.noteOptional')}
              </Text>
              <TextInput
                className={`px-4 py-3 rounded-xl mb-6 ${isDark ? 'bg-dark-card text-white' : 'bg-gray-100 text-gray-800'}`}
                placeholder={t('portfolio.notePlaceholder')}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={note}
                onChangeText={setNote}
              />

              {/* Add Button */}
              <Pressable
                className="bg-gold-400 py-4 rounded-xl mb-4"
                onPress={handleAddItem}
              >
                <Text className="text-center text-white text-lg font-bold">
                  ✓ {t('portfolio.addToPortfolio')}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Portfolio List */}
      <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-2">
          <Text className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            📊 {t('portfolio.portfolioList')} ({portfolio.length})
          </Text>
        </View>
        
        {portfolio.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-6xl mb-4">💰</Text>
            <Text className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('portfolio.noHoldings')}
            </Text>
            <Text className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('portfolio.noHoldingsDesc')}
            </Text>
          </View>
        ) : (
          portfolio.map(renderPortfolioItem)
        )}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
