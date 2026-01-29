import React, { useState } from 'react';
import { View, Text, TextInput as RNTextInput, TextInputProps, Pressable } from 'react-native';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  showPasswordToggle,
  secureTextEntry,
  containerClassName = '',
  ...textInputProps
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;
  const isPassword = showPasswordToggle || secureTextEntry;

  const borderColor = hasError
    ? 'border-red-500'
    : isFocused
    ? 'border-gold-500'
    : 'border-gray-200';

  const handleTogglePassword = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View className={containerClassName}>
      {/* Label */}
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View
        className={`flex-row items-center bg-white border-2 rounded-xl px-4 ${borderColor}`}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View className="mr-3">
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <RNTextInput
          {...textInputProps}
          secureTextEntry={isPassword ? !isPasswordVisible : secureTextEntry}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          className="flex-1 py-3 text-base text-gray-800"
          placeholderTextColor="#9CA3AF"
          accessibilityLabel={label || textInputProps.placeholder}
          accessibilityHint={hint}
          accessibilityState={{ disabled: textInputProps.editable === false }}
        />

        {/* Password Toggle */}
        {showPasswordToggle && (
          <Pressable
            onPress={handleTogglePassword}
            className="ml-2 p-1"
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            accessibilityHint="Chuyển đổi hiển thị mật khẩu"
          >
            <Text className="text-gray-400 text-lg">
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </Pressable>
        )}

        {/* Right Icon */}
        {rightIcon && !showPasswordToggle && (
          <View className="ml-3">
            {rightIcon}
          </View>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text className="text-sm text-red-500 mt-1.5">
          {error}
        </Text>
      )}

      {/* Hint */}
      {hint && !error && (
        <Text className="text-sm text-gray-400 mt-1.5">
          {hint}
        </Text>
      )}
    </View>
  );
};
