import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Modal } from '../common';
import { COLORS } from '../../utils/constants';
import type { Alert, GoldPrice } from '../../types';

type AlertCondition = 'above' | 'below';
type PriceType = 'buy' | 'sell';

interface AlertFormData {
  productName: string;
  providerId: string;
  providerName: string;
  targetPrice: number;
  condition: AlertCondition;
  priceType: PriceType;
  note?: string;
}

interface AlertFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: AlertFormData) => void;
  editingAlert?: Alert | null;
  selectedProduct?: GoldPrice | null;
  loading?: boolean;
}

export const AlertForm: React.FC<AlertFormProps> = ({
  visible,
  onClose,
  onSubmit,
  editingAlert,
  selectedProduct,
  loading = false,
}) => {
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [priceType, setPriceType] = useState<PriceType>('buy');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingAlert) {
      setTargetPrice(editingAlert.targetPrice.toString());
      setCondition(editingAlert.condition);
      setPriceType(editingAlert.priceType);
      setNote(editingAlert.note || '');
    } else if (selectedProduct) {
      // Set default price slightly above/below current price
      const currentPrice = selectedProduct.buy;
      setTargetPrice(Math.round(currentPrice * 1.01).toString());
    } else {
      resetForm();
    }
  }, [editingAlert, selectedProduct, visible]);

  const resetForm = () => {
    setTargetPrice('');
    setCondition('above');
    setPriceType('buy');
    setNote('');
    setError('');
  };

  const handleSubmit = () => {
    // Validation
    const price = parseFloat(targetPrice.replace(/[,.]/g, ''));
    if (isNaN(price) || price <= 0) {
      setError('Vui lòng nhập giá hợp lệ');
      return;
    }

    if (!selectedProduct && !editingAlert) {
      setError('Vui lòng chọn sản phẩm');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    onSubmit({
      productName: editingAlert?.productName || selectedProduct?.type || '',
      providerId: editingAlert?.providerId || selectedProduct?.providerId || '',
      providerName: editingAlert?.providerName || selectedProduct?.brand || '',
      targetPrice: price,
      condition,
      priceType,
      note: note.trim() || undefined,
    });

    resetForm();
    onClose();
  };

  const formatPriceInput = (text: string) => {
    // Remove non-numeric characters
    const numericText = text.replace(/[^0-9]/g, '');
    // Format with thousand separators
    const formatted = numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setTargetPrice(formatted);
  };

  const currentPrice = editingAlert?.targetPrice || selectedProduct?.buy || 0;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={editingAlert ? 'Sửa cảnh báo' : 'Tạo cảnh báo mới'}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Product Info */}
          {(selectedProduct || editingAlert) && (
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <Text className="text-sm text-gray-500 mb-1">Sản phẩm</Text>
              <Text className="text-base font-semibold text-gray-900">
                {editingAlert?.productName || selectedProduct?.type}
              </Text>
              <Text className="text-sm text-gray-600">
                {editingAlert?.providerName || selectedProduct?.brand}
              </Text>
              {currentPrice > 0 && (
                <Text className="text-sm mt-2" style={{ color: COLORS.primary }}>
                  Giá hiện tại: {currentPrice.toLocaleString('vi-VN')}đ
                </Text>
              )}
            </View>
          )}

          {/* Condition Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Điều kiện</Text>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCondition('above');
                }}
                className={`flex-1 py-3 rounded-xl mr-2 items-center flex-row justify-center ${
                  condition === 'above' ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                <Ionicons 
                  name="trending-up" 
                  size={20} 
                  color={condition === 'above' ? '#22c55e' : '#9ca3af'} 
                />
                <Text className={`ml-2 font-medium ${
                  condition === 'above' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  Vượt trên
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCondition('below');
                }}
                className={`flex-1 py-3 rounded-xl items-center flex-row justify-center ${
                  condition === 'below' ? 'bg-red-100' : 'bg-gray-100'
                }`}
              >
                <Ionicons 
                  name="trending-down" 
                  size={20} 
                  color={condition === 'below' ? '#ef4444' : '#9ca3af'} 
                />
                <Text className={`ml-2 font-medium ${
                  condition === 'below' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  Xuống dưới
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Type Selection */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Loại giá</Text>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPriceType('buy');
                }}
                className={`flex-1 py-3 rounded-xl mr-2 items-center ${
                  priceType === 'buy' ? 'bg-primary' : 'bg-gray-100'
                }`}
                style={priceType === 'buy' ? { backgroundColor: COLORS.primary } : undefined}
              >
                <Text className={`font-medium ${
                  priceType === 'buy' ? 'text-white' : 'text-gray-500'
                }`}>
                  Giá mua
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPriceType('sell');
                }}
                className={`flex-1 py-3 rounded-xl items-center ${
                  priceType === 'sell' ? 'bg-primary' : 'bg-gray-100'
                }`}
                style={priceType === 'sell' ? { backgroundColor: COLORS.primary } : undefined}
              >
                <Text className={`font-medium ${
                  priceType === 'sell' ? 'text-white' : 'text-gray-500'
                }`}>
                  Giá bán
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Target Price Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Giá mục tiêu</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4">
              <TextInput
                value={targetPrice}
                onChangeText={formatPriceInput}
                placeholder="Nhập giá mục tiêu"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="flex-1 py-4 text-base text-gray-900"
              />
              <Text className="text-gray-500">đ</Text>
            </View>
          </View>

          {/* Note Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Ghi chú (tùy chọn)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Thêm ghi chú..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-900"
              textAlignVertical="top"
            />
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 rounded-xl p-3 mb-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="py-4 rounded-xl items-center mb-4"
            style={{ backgroundColor: COLORS.primary, opacity: loading ? 0.6 : 1 }}
          >
            <Text className="text-white font-bold text-base">
              {loading ? 'Đang lưu...' : editingAlert ? 'Cập nhật' : 'Tạo cảnh báo'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};
