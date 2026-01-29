import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeContext } from '../../contexts';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useThemeContext();

  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text 
        className="text-lg font-semibold text-center mb-2"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
      {description && (
        <Text 
          className="text-center mb-6"
          style={{ color: colors.textSecondary }}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Pressable
          className="px-6 py-3 rounded-xl active:opacity-80"
          style={{ backgroundColor: colors.primary }}
          onPress={onAction}
        >
          <Text className="text-white font-semibold">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

// Pre-configured empty states for common use cases
export function NoPricesEmpty({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="📊"
      title="Không có dữ liệu giá"
      description="Không thể tải giá vàng. Vui lòng kiểm tra kết nối mạng."
      actionLabel="Thử lại"
      onAction={onRetry}
    />
  );
}

export function NoAlertsEmpty({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon="🔔"
      title="Chưa có cảnh báo"
      description="Tạo cảnh báo để nhận thông báo khi giá đạt mục tiêu của bạn."
      actionLabel="Tạo cảnh báo"
      onAction={onCreate}
    />
  );
}

export function NoPortfolioEmpty({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon="💰"
      title="Danh mục trống"
      description="Thêm vàng vào danh mục để theo dõi lợi nhuận."
      actionLabel="Thêm vàng"
      onAction={onAdd}
    />
  );
}

export function NoSearchResultsEmpty({ query }: { query?: string }) {
  return (
    <EmptyState
      icon="🔍"
      title="Không tìm thấy kết quả"
      description={query ? `Không tìm thấy kết quả cho "${query}"` : 'Thử tìm kiếm với từ khóa khác.'}
    />
  );
}

export function NoHistoryEmpty() {
  return (
    <EmptyState
      icon="📈"
      title="Chưa có lịch sử"
      description="Lịch sử giá sẽ hiển thị ở đây khi có dữ liệu."
    />
  );
}

export function OfflineEmpty({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="📡"
      title="Không có kết nối"
      description="Vui lòng kiểm tra kết nối mạng và thử lại."
      actionLabel="Thử lại"
      onAction={onRetry}
    />
  );
}
