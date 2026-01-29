import React, { Component, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center p-6 bg-gray-50">
          <View className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-sm">
            <Text className="text-red-500 text-4xl text-center mb-4">⚠️</Text>
            <Text className="text-lg font-semibold text-gray-800 text-center mb-2">
              Đã xảy ra lỗi
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-4">
              {this.state.error?.message || 'Có lỗi không xác định'}
            </Text>
            <Pressable
              onPress={this.handleRetry}
              className="bg-gold-500 rounded-xl py-3 px-6 active:opacity-80"
            >
              <Text className="text-white font-semibold text-center">
                Thử lại
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
