import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../utils/constants';
import { useThemeContext } from '../../contexts';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBackground?: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  // For toggle type
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  // For danger type
  danger?: boolean;
  // Disabled state
  disabled?: boolean;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconColor = COLORS.primary,
  iconBackground,
  title,
  subtitle,
  value,
  onPress,
  showArrow = true,
  isToggle = false,
  toggleValue = false,
  onToggle,
  danger = false,
  disabled = false,
}) => {
  const { colors } = useThemeContext();

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handleToggle = (newValue: boolean) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle?.(newValue);
  };

  const actualIconColor = danger ? '#ef4444' : iconColor;
  const bgColor = iconBackground || (danger ? '#fee2e2' : `${COLORS.primary}15`);

  return (
    <TouchableOpacity
      onPress={!isToggle ? handlePress : undefined}
      disabled={disabled || isToggle}
      activeOpacity={isToggle ? 1 : 0.7}
      className="flex-row items-center py-3 px-4"
      style={{ 
        backgroundColor: colors.card,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {/* Icon */}
      <View 
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: bgColor }}
      >
        <Ionicons name={icon} size={20} color={actualIconColor} />
      </View>

      {/* Text Content */}
      <View className="flex-1">
        <Text 
          className="text-base font-medium"
          style={{ color: danger ? '#ef4444' : colors.text }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Side */}
      {isToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: COLORS.primaryLight }}
          thumbColor={toggleValue ? COLORS.primary : '#f4f3f4'}
          ios_backgroundColor={colors.border}
          disabled={disabled}
        />
      ) : (
        <View className="flex-row items-center">
          {value && (
            <Text className="text-sm mr-2" style={{ color: colors.textSecondary }}>
              {value}
            </Text>
          )}
          {showArrow && (
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
