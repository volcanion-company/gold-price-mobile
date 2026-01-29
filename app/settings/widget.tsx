import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useWidgetStore } from '../../src/stores';
import { usePrices } from '../../src/hooks';
import { GOLD_CODES } from '../../src/utils/constants';

type WidgetSize = 'small' | 'medium' | 'large';

export default function WidgetSettingsScreen() {
  const { prices } = usePrices();
  const {
    selectedCodes,
    widgetSize,
    showChange,
    showLastUpdate,
    setSelectedCodes,
    setWidgetSize,
    setShowChange,
    setShowLastUpdate,
  } = useWidgetStore();

  const maxCodes = widgetSize === 'small' ? 1 : widgetSize === 'medium' ? 3 : 5;

  const handleCodeToggle = (code: string) => {
    if (selectedCodes.includes(code)) {
      setSelectedCodes(selectedCodes.filter((c) => c !== code));
    } else if (selectedCodes.length < maxCodes) {
      setSelectedCodes([...selectedCodes, code]);
    }
  };

  const handleSizeChange = (size: WidgetSize) => {
    setWidgetSize(size);
    // Trim selected codes if exceeding new max
    const newMax = size === 'small' ? 1 : size === 'medium' ? 3 : 5;
    if (selectedCodes.length > newMax) {
      setSelectedCodes(selectedCodes.slice(0, newMax));
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Cài đặt Widget',
          headerBackTitle: 'Quay lại',
        }}
      />
      
      <SafeAreaView className="flex-1 bg-gray-100" edges={['bottom']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Widget Preview */}
          <View className="mx-4 mt-4 p-4 bg-white rounded-2xl">
            <Text className="text-sm font-medium text-gray-500 mb-3">
              Xem trước Widget
            </Text>
            <View className={`bg-gray-900 rounded-xl p-3 ${
              widgetSize === 'small' ? 'h-[100px]' : 
              widgetSize === 'medium' ? 'h-[150px]' : 'h-[200px]'
            }`}>
              <Text className="text-gold-400 text-xs font-semibold">💰 Giá Vàng</Text>
              {selectedCodes.slice(0, maxCodes).map((code) => {
                const price = prices.find((p) => p.code === code);
                return (
                  <View key={code} className="flex-row justify-between items-center mt-2">
                    <Text className="text-white text-sm">
                      {GOLD_CODES[code] || code}
                    </Text>
                    <Text className="text-gold-400 font-semibold">
                      {price ? `${(price.sellPrice / 1000000).toFixed(2)}M` : '---'}
                    </Text>
                  </View>
                );
              })}
              {selectedCodes.length === 0 && (
                <Text className="text-gray-500 text-sm mt-2">
                  Chọn mã vàng để hiển thị
                </Text>
              )}
              {showLastUpdate && (
                <Text className="text-gray-500 text-xs mt-auto">
                  Cập nhật: 10:30
                </Text>
              )}
            </View>
          </View>

          {/* Widget Size */}
          <View className="mx-4 mt-4 p-4 bg-white rounded-2xl">
            <Text className="text-sm font-medium text-gray-500 mb-3">
              Kích thước Widget
            </Text>
            <View className="flex-row gap-2">
              {(['small', 'medium', 'large'] as WidgetSize[]).map((size) => (
                <Pressable
                  key={size}
                  className={`flex-1 py-3 rounded-xl border ${
                    widgetSize === size
                      ? 'bg-gold-400 border-gold-400'
                      : 'bg-gray-100 border-gray-200'
                  }`}
                  onPress={() => handleSizeChange(size)}
                >
                  <Text className={`text-center font-medium ${
                    widgetSize === size ? 'text-white' : 'text-gray-600'
                  }`}>
                    {size === 'small' ? 'Nhỏ (1)' : 
                     size === 'medium' ? 'Vừa (3)' : 'Lớn (5)'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Select Codes */}
          <View className="mx-4 mt-4 p-4 bg-white rounded-2xl">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-medium text-gray-500">
                Chọn mã vàng
              </Text>
              <Text className="text-sm text-gray-400">
                {selectedCodes.length}/{maxCodes}
              </Text>
            </View>
            
            <View className="flex-row flex-wrap gap-2">
              {prices.slice(0, 15).map((price) => {
                const isSelected = selectedCodes.includes(price.code);
                const isDisabled = !isSelected && selectedCodes.length >= maxCodes;
                
                return (
                  <Pressable
                    key={price.code}
                    className={`px-3 py-2 rounded-full border ${
                      isSelected
                        ? 'bg-gold-400 border-gold-400'
                        : isDisabled
                        ? 'bg-gray-100 border-gray-100 opacity-50'
                        : 'bg-gray-100 border-gray-200'
                    }`}
                    onPress={() => !isDisabled && handleCodeToggle(price.code)}
                    disabled={isDisabled}
                  >
                    <Text className={`text-sm ${
                      isSelected ? 'text-white font-semibold' : 'text-gray-600'
                    }`}>
                      {GOLD_CODES[price.code] || price.code}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Display Options */}
          <View className="mx-4 mt-4 mb-6 p-4 bg-white rounded-2xl">
            <Text className="text-sm font-medium text-gray-500 mb-3">
              Tùy chọn hiển thị
            </Text>
            
            <Pressable
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
              onPress={() => setShowChange(!showChange)}
            >
              <Text className="text-base text-gray-800">Hiển thị biến động</Text>
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                showChange ? 'bg-gold-400 border-gold-400' : 'border-gray-300'
              }`}>
                {showChange && <Text className="text-white text-xs">✓</Text>}
              </View>
            </Pressable>
            
            <Pressable
              className="flex-row items-center justify-between py-3"
              onPress={() => setShowLastUpdate(!showLastUpdate)}
            >
              <Text className="text-base text-gray-800">Hiển thị thời gian cập nhật</Text>
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                showLastUpdate ? 'bg-gold-400 border-gold-400' : 'border-gray-300'
              }`}>
                {showLastUpdate && <Text className="text-white text-xs">✓</Text>}
              </View>
            </Pressable>
          </View>

          {/* Instructions */}
          <View className="mx-4 mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <Text className="text-sm font-medium text-blue-800 mb-2">
              📱 Cách thêm Widget
            </Text>
            <Text className="text-sm text-blue-600">
              1. Nhấn giữ màn hình chính{'\n'}
              2. Chọn "+" hoặc "Widgets"{'\n'}
              3. Tìm "Giá Vàng"{'\n'}
              4. Kéo widget vào màn hình
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
