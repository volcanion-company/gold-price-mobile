import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Modal } from '../common';
import { useThemeContext, useLanguage } from '../../contexts';
import { COLORS } from '../../utils/constants';
import { formatPrice } from '../../utils/formatters';

interface PortfolioHolding {
  id: string;
  productCode: string;
  productName: string;
  providerId: string;
  providerName: string;
  quantity: number;
  unit: 'gram' | 'ounce' | 'luong';
  buyPrice: number;
  buyDate: string;
  note?: string;
}

interface EditHoldingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<PortfolioHolding>) => void;
  onDelete?: () => void;
  holding: PortfolioHolding | null;
  loading?: boolean;
}

export const EditHoldingModal: React.FC<EditHoldingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onDelete,
  holding,
  loading = false,
}) => {
  const { isDark } = useThemeContext();
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [note, setNote] = useState('');
  const [unit, setUnit] = useState<'gram' | 'ounce' | 'luong'>('luong');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (holding && visible) {
      setQuantity(holding.quantity.toString());
      setBuyPrice(holding.buyPrice.toString());
      setNote(holding.note || '');
      setUnit(holding.unit);
      setError('');
      setShowDeleteConfirm(false);
    }
  }, [holding, visible]);

  const handleSubmit = () => {
    const qty = parseFloat(quantity);
    const price = parseFloat(buyPrice.replace(/[,.]/g, ''));

    if (isNaN(qty) || qty <= 0) {
      setError(t('portfolio.enterQuantity'));
      return;
    }

    if (isNaN(price) || price <= 0) {
      setError(t('portfolio.enterBuyPrice'));
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    onSubmit({
      quantity: qty,
      buyPrice: price,
      unit,
      note: note.trim() || undefined,
    });

    onClose();
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete?.();
    onClose();
  };

  if (!holding) return null;

  return (
    <Modal visible={visible} onClose={onClose} title={t('portfolio.editHolding')}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Product info */}
          <View className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl mb-4">
            <Text className="text-lg font-semibold text-amber-700 dark:text-amber-500">
              {holding.productName}
            </Text>
            <Text className="text-sm text-amber-600/70 dark:text-amber-400/70">
              {holding.providerName}
            </Text>
          </View>

          {/* Quantity input */}
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {t('portfolio.quantity')}
          </Text>
          <View className="flex-row items-center mb-4">
            <TextInput
              className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-l-xl px-4 py-3 text-lg font-semibold text-gray-900 dark:text-gray-100"
              value={quantity}
              onChangeText={(text) => {
                setQuantity(text.replace(/[^0-9.]/g, ''));
                setError('');
              }}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
            />
            {/* Unit selector */}
            <View className="flex-row bg-gray-200 dark:bg-gray-600 rounded-r-xl">
              {(['gram', 'luong', 'ounce'] as const).map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setUnit(u); }}
                  className={`px-3 py-3 ${
                    unit === u ? 'bg-amber-500' : ''
                  } ${u === 'gram' ? 'rounded-l-xl' : ''} ${u === 'ounce' ? 'rounded-r-xl' : ''}`}
                >
                  <Text className={unit === u ? 'text-white font-medium' : 'text-gray-600 dark:text-gray-400'}>
                    {t(`portfolio.unit.${u}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Buy price input */}
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {t('portfolio.buyPrice')} (VNĐ/{t(`portfolio.unit.${unit}`)})
          </Text>
          <TextInput
            className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"
            value={buyPrice}
            onChangeText={(text) => {
              setBuyPrice(text.replace(/[^0-9]/g, ''));
              setError('');
            }}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
          />

          {/* Note input */}
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {t('portfolio.noteOptional')}
          </Text>
          <TextInput
            className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 mb-4"
            value={note}
            onChangeText={setNote}
            placeholder={t('portfolio.notePlaceholder')}
            placeholderTextColor={isDark ? '#9ca3af' : '#9ca3af'}
            multiline
            numberOfLines={2}
          />

          {/* Error message */}
          {error ? (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          ) : null}

          {/* Action buttons */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`py-4 rounded-xl items-center mb-3 ${
              loading ? 'bg-gray-400' : 'bg-amber-500'
            }`}
          >
            <Text className="text-white font-semibold text-lg">
              {loading ? t('common.loading') : t('common.save')}
            </Text>
          </TouchableOpacity>

          {/* Delete button */}
          {onDelete && (
            <>
              {showDeleteConfirm ? (
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 rounded-xl items-center bg-gray-200 dark:bg-gray-700"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-medium">
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDelete}
                    className="flex-1 py-3 rounded-xl items-center bg-red-500"
                  >
                    <Text className="text-white font-medium">
                      {t('common.confirm')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowDeleteConfirm(true);
                  }}
                  className="py-3 rounded-xl items-center border border-red-500"
                >
                  <Text className="text-red-500 font-medium">
                    {t('portfolio.deleteInvestment')}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditHoldingModal;
