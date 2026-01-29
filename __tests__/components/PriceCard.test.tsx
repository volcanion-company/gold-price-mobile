import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PriceCard } from '../../src/components/common/PriceCard';
import { GoldPrice } from '../../src/types';

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

const mockPrice: GoldPrice = {
  code: 'SJC_1L',
  name: 'SJC 1 Lượng',
  type: 'gold',
  brand: 'SJC',
  providerId: 'sjc-provider',
  buy: 82000000,
  sell: 84000000,
  buyPrice: 82000000,
  sellPrice: 84000000,
  change: 500000,
  changePercent: 0.6,
  currency: 'VND',
  updatedAt: '2026-01-30T10:00:00Z',
};

describe('PriceCard', () => {
  it('should render correctly with default variant', () => {
    render(<PriceCard price={mockPrice} />);
    
    expect(screen.getByText('SJC 1 Lượng')).toBeTruthy();
    expect(screen.getByText('82.00M')).toBeTruthy();
    expect(screen.getByText('84.00M')).toBeTruthy();
  });

  it('should render compact variant', () => {
    render(<PriceCard price={mockPrice} variant="compact" />);
    
    expect(screen.getByText('SJC 1 Lượng')).toBeTruthy();
    expect(screen.getByText('82.00M')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPressMock = jest.fn();
    render(<PriceCard price={mockPrice} onPress={onPressMock} />);
    
    const card = screen.getByText('SJC 1 Lượng').parent?.parent;
    if (card) {
      fireEvent.press(card);
      expect(onPressMock).toHaveBeenCalledTimes(1);
    }
  });

  it('should show positive change indicator', () => {
    render(<PriceCard price={mockPrice} variant="compact" />);
    
    // Should contain up arrow indicator for positive change
    expect(screen.getByText(/▲/)).toBeTruthy();
  });

  it('should show negative change indicator', () => {
    const negativePrice = {
      ...mockPrice,
      change: -300000,
      changePercent: -0.37,
    };
    render(<PriceCard price={negativePrice} variant="compact" />);
    
    // Should contain down arrow indicator for negative change
    expect(screen.getByText(/▼/)).toBeTruthy();
  });

  it('should handle zero change gracefully', () => {
    const noChangePrice = {
      ...mockPrice,
      change: 0,
      changePercent: 0,
    };
    render(<PriceCard price={noChangePrice} variant="compact" />);
    
    // Should not show change indicator for zero change
    expect(screen.queryByText(/▲/)).toBeNull();
    expect(screen.queryByText(/▼/)).toBeNull();
  });

  it('should render featured variant', () => {
    render(<PriceCard price={mockPrice} variant="featured" />);
    
    // Featured variant should show the price
    expect(screen.getByText('82.00M')).toBeTruthy();
  });
});
