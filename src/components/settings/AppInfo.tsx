import React from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../utils/constants';

interface AppInfoProps {
  version?: string;
  buildNumber?: string;
  onCheckUpdate?: () => void;
}

export const AppInfo: React.FC<AppInfoProps> = ({
  version = '1.0.0',
  buildNumber = '1',
  onCheckUpdate,
}) => {
  const handleCheckUpdate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCheckUpdate?.();
  };

  const handleOpenLink = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  return (
    <View className="items-center py-8">
      {/* App Icon */}
      <View 
        className="w-20 h-20 rounded-2xl items-center justify-center mb-4 shadow-lg"
        style={{ backgroundColor: COLORS.primary }}
      >
        <Ionicons name="stats-chart" size={40} color="#ffffff" />
      </View>

      {/* App Name */}
      <Text className="text-xl font-bold text-gray-900 mb-1">
        Gold Price Tracker
      </Text>
      
      {/* Version */}
      <Text className="text-sm text-gray-500 mb-4">
        Phiên bản {version} ({buildNumber})
      </Text>

      {/* Check Update Button */}
      {onCheckUpdate && (
        <TouchableOpacity
          onPress={handleCheckUpdate}
          className="flex-row items-center px-4 py-2 rounded-full bg-gray-100"
        >
          <Ionicons name="refresh" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-2">Kiểm tra cập nhật</Text>
        </TouchableOpacity>
      )}

      {/* Links */}
      <View className="flex-row mt-6 space-x-4">
        <TouchableOpacity
          onPress={() => handleOpenLink('https://example.com/privacy')}
          className="flex-row items-center"
        >
          <Text className="text-sm text-primary" style={{ color: COLORS.primary }}>
            Chính sách bảo mật
          </Text>
        </TouchableOpacity>

        <Text className="text-gray-300">|</Text>

        <TouchableOpacity
          onPress={() => handleOpenLink('https://example.com/terms')}
          className="flex-row items-center"
        >
          <Text className="text-sm text-primary" style={{ color: COLORS.primary }}>
            Điều khoản sử dụng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Copyright */}
      <Text className="text-xs text-gray-400 mt-6">
        © {new Date().getFullYear()} Gold Price Tracker. All rights reserved.
      </Text>
    </View>
  );
};
