import React from 'react';
import { Text, Pressable, ActivityIndicator, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  haptic?: boolean;
  style?: ViewStyle;
}

const VARIANT_CLASSES = {
  primary: {
    container: 'bg-gold-500 active:bg-gold-600',
    text: 'text-white',
    disabled: 'bg-gray-300',
  },
  secondary: {
    container: 'bg-gray-100 active:bg-gray-200',
    text: 'text-gray-800',
    disabled: 'bg-gray-100',
  },
  outline: {
    container: 'border-2 border-gold-500 bg-transparent active:bg-gold-50',
    text: 'text-gold-600',
    disabled: 'border-gray-300',
  },
  ghost: {
    container: 'bg-transparent active:bg-gray-100',
    text: 'text-gold-600',
    disabled: 'bg-transparent',
  },
  danger: {
    container: 'bg-red-500 active:bg-red-600',
    text: 'text-white',
    disabled: 'bg-gray-300',
  },
};

const SIZE_CLASSES = {
  small: {
    container: 'px-3 py-2 rounded-lg',
    text: 'text-sm',
  },
  medium: {
    container: 'px-4 py-3 rounded-xl',
    text: 'text-base',
  },
  large: {
    container: 'px-6 py-4 rounded-xl',
    text: 'text-lg',
  },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  haptic = true,
  style,
}) => {
  const variantStyle = VARIANT_CLASSES[variant];
  const sizeStyle = SIZE_CLASSES[size];

  const handlePress = () => {
    if (disabled || loading) return;
    
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress();
  };

  const containerClasses = [
    'flex-row items-center justify-center',
    sizeStyle.container,
    disabled ? variantStyle.disabled : variantStyle.container,
    fullWidth ? 'w-full' : '',
  ].join(' ');

  const textClasses = [
    'font-semibold',
    sizeStyle.text,
    disabled ? 'text-gray-400' : variantStyle.text,
  ].join(' ');

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={containerClasses}
      style={style}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      accessibilityHint={loading ? "Đang xử lý" : undefined}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={disabled ? '#9CA3AF' : variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#E6B800'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Text className="mr-2">{icon}</Text>
          )}
          <Text className={textClasses}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Text className="ml-2">{icon}</Text>
          )}
        </>
      )}
    </Pressable>
  );
};
