import React from 'react';
import { View, Text, Pressable, Modal as RNModal, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'small' | 'medium' | 'large' | 'full';
}

const SIZE_CLASSES = {
  small: 'max-w-xs',
  medium: 'max-w-sm',
  large: 'max-w-md',
  full: 'max-w-full mx-4',
};

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = 'medium',
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          onPress={onClose}
          className="flex-1 justify-center items-center"
        >
          <BlurView intensity={20} tint="dark" className="absolute inset-0" />
          
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className={`bg-white rounded-2xl w-full ${SIZE_CLASSES[size]} shadow-xl overflow-hidden`}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
                <Text className="text-lg font-semibold text-gray-800 flex-1">
                  {title || ''}
                </Text>
                {showCloseButton && (
                  <Pressable
                    onPress={onClose}
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                  >
                    <Text className="text-gray-500 text-lg">✕</Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* Content */}
            <View className="p-5">
              {children}
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </RNModal>
  );
};
