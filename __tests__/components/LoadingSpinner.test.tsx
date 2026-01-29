import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LoadingSpinner } from '../../src/components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render ActivityIndicator', () => {
    const { toJSON } = render(<LoadingSpinner />);

    // Component should render without crashing
    expect(toJSON()).toBeTruthy();
  });

  it('should render with text', () => {
    render(<LoadingSpinner text="Đang tải..." />);
    
    expect(screen.getByText('Đang tải...')).toBeTruthy();
  });

  it('should render without text when not provided', () => {
    render(<LoadingSpinner />);
    
    expect(screen.queryByText('Đang tải...')).toBeNull();
  });

  it('should render fullScreen variant', () => {
    render(<LoadingSpinner fullScreen />);
    
    // Component should render without crashing
    expect(screen.root).toBeTruthy();
  });

  it('should render with custom color', () => {
    render(<LoadingSpinner color="#FF0000" />);
    
    // Component should render without crashing
    expect(screen.root).toBeTruthy();
  });

  it('should render with small size', () => {
    render(<LoadingSpinner size="small" />);
    
    // Component should render without crashing
    expect(screen.root).toBeTruthy();
  });
});
