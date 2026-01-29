import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PriceRow } from '../../src/components/common/PriceRow';
import { GoldPrice } from '../../src/types';

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

describe('PriceRow', () => {
  it('should render correctly with price data', () => {
    render(<PriceRow price={mockPrice} />);
    
    expect(screen.getByText('SJC 1 Lượng')).toBeTruthy();
  });

  it('should display buy and sell prices', () => {
    render(<PriceRow price={mockPrice} />);
    
    // Check for price text patterns
    expect(screen.getByText(/82\.00M/)).toBeTruthy();
    expect(screen.getByText(/84\.00M/)).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPressMock = jest.fn();
    render(<PriceRow price={mockPrice} onPress={onPressMock} />);
    
    const row = screen.getByText('SJC 1 Lượng').parent?.parent;
    if (row) {
      fireEvent.press(row);
      expect(onPressMock).toHaveBeenCalledTimes(1);
    }
  });

  it('should show change indicator when showChange is true', () => {
    render(<PriceRow price={mockPrice} showChange={true} />);
    
    // Should contain up arrow indicator for positive change
    expect(screen.getByText(/▲/)).toBeTruthy();
  });

  it('should hide change indicator when showChange is false', () => {
    render(<PriceRow price={mockPrice} showChange={false} />);
    
    // Should not contain arrow indicators
    expect(screen.queryByText(/▲/)).toBeNull();
    expect(screen.queryByText(/▼/)).toBeNull();
  });

  it('should show negative change indicator', () => {
    const negativePrice = {
      ...mockPrice,
      change: -300000,
      changePercent: -0.37,
    };
    render(<PriceRow price={negativePrice} showChange={true} />);
    
    expect(screen.getByText(/▼/)).toBeTruthy();
  });

  it('should use getGoldName when name is not provided', () => {
    const priceWithoutName = {
      ...mockPrice,
      name: '',
    };
    render(<PriceRow price={priceWithoutName} />);
    
    // Should fallback to code or mapped name
    expect(screen.getByText(/SJC/)).toBeTruthy();
  });
});
