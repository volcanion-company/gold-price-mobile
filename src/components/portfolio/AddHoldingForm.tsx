import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal } from '../common';
import { COLORS } from '../../utils/constants';
import type { HoldingItem, GoldPrice } from '../../types';

interface HoldingFormData {
  productName: string;
  providerId: string;
  providerName: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  note?: string;
}

interface AddHoldingFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: HoldingFormData) => void;
  editingHolding?: HoldingItem | null;
  selectedProduct?: GoldPrice | null;
  loading?: boolean;
}

export const AddHoldingForm: React.FC<AddHoldingFormProps> = ({
  visible,
  onClose,
  onSubmit,
  editingHolding,
  selectedProduct,
  loading = false,
}) => {
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [buyDate, setBuyDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingHolding) {
      setQuantity(editingHolding.quantity.toString());
      setBuyPrice(editingHolding.buyPrice.toString());
      setBuyDate(new Date(editingHolding.buyDate));
      setNote(editingHolding.note || '');
    } else if (selectedProduct) {
      setBuyPrice(selectedProduct.buy.toString());
    } else {
      resetForm();
    }
  }, [editingHolding, selectedProduct, visible]);

  const resetForm = () => {
    setQuantity('');
    setBuyPrice('');
    setBuyDate(new Date());
    setNote('');
    setError('');
    setShowDatePicker(false);
  };

  const handleSubmit = () => {
    // Validation
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    const price = parseFloat(buyPrice.replace(/[,.]/g, ''));
    if (isNaN(price) || price <= 0) {
      setError('Vui lòng nhập giá hợp lệ');
      return;
    }

    if (!selectedProduct && !editingHolding) {
      setError('Vui lòng chọn sản phẩm');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    onSubmit({
      productName: editingHolding?.productName || selectedProduct?.type || '',
      providerId: editingHolding?.providerId || selectedProduct?.providerId || '',
      providerName: editingHolding?.providerName || selectedProduct?.brand || '',
      quantity: qty,
      buyPrice: price,
      buyDate: buyDate.toISOString(),
      note: note.trim() || undefined,
    });

    resetForm();
    onClose();
  };

  const formatPriceInput = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const formatted = numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setBuyPrice(formatted);
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBuyDate(selectedDate);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={editingHolding ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Product Info */}
          {(selectedProduct || editingHolding) && (
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <Text className="text-sm text-gray-500 mb-1">Sản phẩm</Text>
              <Text className="text-base font-semibold text-gray-900">
                {editingHolding?.productName || selectedProduct?.type}
              </Text>
              <Text className="text-sm text-gray-600">
                {editingHolding?.providerName || selectedProduct?.brand}
              </Text>
            </View>
          )}

          {/* Quantity Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Số lượng (lượng)
            </Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl">
              <TouchableOpacity
                onPress={() => {
                  const val = parseFloat(quantity) || 0;
                  if (val > 0.1) setQuantity((val - 0.1).toFixed(2));
                }}
                className="px-4 py-4"
              >
                <Ionicons name="remove" size={20} color="#6b7280" />
              </TouchableOpacity>
              
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1.00"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
                className="flex-1 py-4 text-center text-base text-gray-900"
              />
              
              <TouchableOpacity
                onPress={() => {
                  const val = parseFloat(quantity) || 0;
                  setQuantity((val + 0.1).toFixed(2));
                }}
                className="px-4 py-4"
              >
                <Ionicons name="add" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Buy Price Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Giá mua</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4">
              <TextInput
                value={buyPrice}
                onChangeText={formatPriceInput}
                placeholder="Nhập giá mua"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="flex-1 py-4 text-base text-gray-900"
              />
              <Text className="text-gray-500">đ/lượng</Text>
            </View>
          </View>

          {/* Buy Date */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Ngày mua</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center justify-between bg-gray-100 rounded-xl px-4 py-4"
            >
              <Text className="text-base text-gray-900">
                {buyDate.toLocaleDateString('vi-VN', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={buyDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
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

          {/* Calculated Total */}
          {quantity && buyPrice && (
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <Text className="text-sm text-gray-500 mb-1">Tổng giá trị</Text>
              <Text 
                className="text-xl font-bold"
                style={{ color: COLORS.primary }}
              >
                {(
                  parseFloat(quantity) * parseFloat(buyPrice.replace(/[,.]/g, ''))
                ).toLocaleString('vi-VN')}đ
              </Text>
            </View>
          )}

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
              {loading ? 'Đang lưu...' : editingHolding ? 'Cập nhật' : 'Thêm giao dịch'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};
