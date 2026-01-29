import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Modal } from '../common';
import { useThemeContext, useLanguage } from '../../contexts';
import { COLORS } from '../../utils/constants';
import { formatPrice } from '../../utils/formatters';
import type { GoldPrice } from '../../types';

type AlertCondition = 'above' | 'below';
type PriceType = 'buy' | 'sell';

interface CreateAlertModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    productCode: string;
    productName: string;
    providerId: string;
    providerName: string;
    targetPrice: number;
    condition: AlertCondition;
    priceType: PriceType;
    note?: string;
  }) => void;
  products: GoldPrice[];
  loading?: boolean;
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  visible,
  onClose,
  onSubmit,
  products,
  loading = false,
}) => {
  const { isDark } = useThemeContext();
  const { t } = useLanguage();
  const [step, setStep] = useState<'product' | 'config'>('product');
  const [selectedProduct, setSelectedProduct] = useState<GoldPrice | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [priceType, setPriceType] = useState<PriceType>('buy');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = useCallback(() => {
    setStep('product');
    setSelectedProduct(null);
    setTargetPrice('');
    setCondition('above');
    setPriceType('buy');
    setNote('');
    setError('');
    setSearchQuery('');
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectProduct = (product: GoldPrice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProduct(product);
    setTargetPrice(Math.round(product.buy * 1.01).toString());
    setStep('config');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('product');
  };

  const handleSubmit = () => {
    if (!selectedProduct) {
      setError(t('alerts.selectGoldType'));
      return;
    }

    const price = parseFloat(targetPrice.replace(/[,.]/g, ''));
    if (isNaN(price) || price <= 0) {
      setError(t('alerts.enterTargetPrice'));
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    onSubmit({
      productCode: selectedProduct.code,
      productName: selectedProduct.name,
      providerId: selectedProduct.providerId || '',
      providerName: selectedProduct.provider || '',
      targetPrice: price,
      condition,
      priceType,
      note: note.trim() || undefined,
    });

    handleClose();
  };

  const filteredProducts = products.filter(
    p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentPrice = selectedProduct 
    ? (priceType === 'buy' ? selectedProduct.buy : selectedProduct.sell)
    : 0;

  return (
    <Modal visible={visible} onClose={handleClose} title={t('alerts.createAlert')}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {step === 'product' ? (
          <View className="flex-1">
            {/* Search */}
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2 mb-4">
              <Ionicons name="search" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <TextInput
                className="flex-1 ml-2 text-gray-900 dark:text-gray-100"
                placeholder={t('compare.searchPlaceholder')}
                placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Product list */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {filteredProducts.map((product) => (
                <TouchableOpacity
                  key={`${product.code}-${product.providerId}`}
                  onPress={() => handleSelectProduct(product)}
                  className="flex-row items-center py-3 px-2 border-b border-gray-100 dark:border-gray-700"
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 items-center justify-center mr-3">
                    <Ionicons name="cube" size={20} color={COLORS.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {product.name}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {product.provider || product.code}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-medium text-amber-600">
                      {formatPrice(product.buy)}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {t('home.buy')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Selected product info */}
            <TouchableOpacity
              onPress={handleBack}
              className="flex-row items-center mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl"
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
              <View className="flex-1 ml-2">
                <Text className="text-base font-semibold text-amber-700 dark:text-amber-500">
                  {selectedProduct?.name}
                </Text>
                <Text className="text-sm text-amber-600/70 dark:text-amber-400/70">
                  {t('alerts.currentPrice')}: {formatPrice(currentPrice)}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Condition selector */}
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t('alerts.condition')}
            </Text>
            <View className="flex-row mb-4">
              <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCondition('above'); }}
                className={`flex-1 py-3 rounded-l-xl items-center ${
                  condition === 'above' 
                    ? 'bg-green-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={condition === 'above' ? 'text-white font-semibold' : 'text-gray-600 dark:text-gray-400'}>
                  ↑ {t('alerts.above')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCondition('below'); }}
                className={`flex-1 py-3 rounded-r-xl items-center ${
                  condition === 'below' 
                    ? 'bg-red-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={condition === 'below' ? 'text-white font-semibold' : 'text-gray-600 dark:text-gray-400'}>
                  ↓ {t('alerts.below')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Price type selector */}
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t('alerts.priceType')}
            </Text>
            <View className="flex-row mb-4">
              <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPriceType('buy'); }}
                className={`flex-1 py-3 rounded-l-xl items-center ${
                  priceType === 'buy' 
                    ? 'bg-amber-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={priceType === 'buy' ? 'text-white font-semibold' : 'text-gray-600 dark:text-gray-400'}>
                  {t('alerts.buyPrice')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPriceType('sell'); }}
                className={`flex-1 py-3 rounded-r-xl items-center ${
                  priceType === 'sell' 
                    ? 'bg-amber-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text className={priceType === 'sell' ? 'text-white font-semibold' : 'text-gray-600 dark:text-gray-400'}>
                  {t('alerts.sellPrice')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Target price input */}
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t('alerts.targetPrice')} (VNĐ)
            </Text>
            <TextInput
              className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"
              placeholder={t('alerts.targetPricePlaceholder')}
              placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
              value={targetPrice}
              onChangeText={(text) => {
                setTargetPrice(text.replace(/[^0-9]/g, ''));
                setError('');
              }}
              keyboardType="numeric"
            />

            {/* Note input */}
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t('alerts.note')} ({t('portfolio.noteOptional').split('(')[1]}
            </Text>
            <TextInput
              className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 mb-4"
              placeholder={t('portfolio.notePlaceholder')}
              placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={2}
            />

            {/* Error message */}
            {error ? (
              <Text className="text-red-500 text-center mb-4">{error}</Text>
            ) : null}

            {/* Submit button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className={`py-4 rounded-xl items-center ${
                loading ? 'bg-gray-400' : 'bg-amber-500'
              }`}
            >
              <Text className="text-white font-semibold text-lg">
                {loading ? t('common.loading') : t('alerts.createAlertButton')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateAlertModal;
