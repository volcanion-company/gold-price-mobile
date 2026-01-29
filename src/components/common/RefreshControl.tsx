import React, { useCallback } from 'react';
import { RefreshControl as RNRefreshControl, RefreshControlProps } from 'react-native';
import { COLORS } from '../../utils/constants';
import { haptics } from '../../utils/haptics';

export interface CustomRefreshControlProps extends Omit<RefreshControlProps, 'colors' | 'tintColor'> {
  refreshing: boolean;
  onRefresh: () => void;
}

export const CustomRefreshControl: React.FC<CustomRefreshControlProps> = ({
  refreshing,
  onRefresh,
  ...props
}) => {
  const handleRefresh = useCallback(() => {
    haptics.medium();
    onRefresh();
  }, [onRefresh]);

  return (
    <RNRefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={COLORS.gold[500]}
      colors={[COLORS.gold[500], COLORS.gold[600]]}
      progressBackgroundColor="#FFFFFF"
      {...props}
    />
  );
};
