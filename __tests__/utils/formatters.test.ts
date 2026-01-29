import {
  formatPrice,
  formatPriceFull,
  formatPriceChange,
  formatPercentChange,
  formatPriceShort,
  formatSpread,
} from '../../src/utils/formatters';

describe('formatters', () => {
  describe('formatPrice', () => {
    it('should format VND price correctly', () => {
      expect(formatPrice(1000000, 'VND')).toBe('1.00M');
      expect(formatPrice(500000, 'VND')).toBe('500,000₫');
      expect(formatPrice(82000000, 'VND')).toBe('82.00M');
    });

    it('should format USD price correctly', () => {
      expect(formatPrice(2950.50, 'USD')).toBe('$2,950.50');
      expect(formatPrice(100, 'USD')).toBe('$100.00');
    });

    it('should default to VND', () => {
      expect(formatPrice(1000000)).toBe('1.00M');
    });
  });

  describe('formatPriceFull', () => {
    it('should format VND with full number', () => {
      expect(formatPriceFull(82000000, 'VND')).toBe('82,000,000 ₫');
      expect(formatPriceFull(500000, 'VND')).toBe('500,000 ₫');
    });

    it('should format USD correctly', () => {
      expect(formatPriceFull(2950.50, 'USD')).toBe('$2,950.50');
    });
  });

  describe('formatPriceChange', () => {
    it('should format positive change with plus sign', () => {
      expect(formatPriceChange(500000, 'VND')).toBe('+500K');
      expect(formatPriceChange(1000, 'VND')).toBe('+1K');
    });

    it('should format negative change', () => {
      expect(formatPriceChange(-200000, 'VND')).toBe('-200K');
    });

    it('should format zero change', () => {
      expect(formatPriceChange(0, 'VND')).toBe('+0');
    });

    it('should format USD change', () => {
      expect(formatPriceChange(50.25, 'USD')).toBe('+50.25');
      expect(formatPriceChange(-25.50, 'USD')).toBe('-25.50');
    });
  });

  describe('formatPercentChange', () => {
    it('should format positive percent with plus sign', () => {
      expect(formatPercentChange(2.5)).toBe('+2.50%');
    });

    it('should format negative percent', () => {
      expect(formatPercentChange(-1.25)).toBe('-1.25%');
    });

    it('should format zero percent', () => {
      expect(formatPercentChange(0)).toBe('+0.00%');
    });
  });

  describe('formatPriceShort', () => {
    it('should format billions with B suffix', () => {
      expect(formatPriceShort(1500000000)).toBe('1.5B');
    });

    it('should format millions with M suffix', () => {
      expect(formatPriceShort(82000000)).toBe('82.0M');
      expect(formatPriceShort(5500000)).toBe('5.5M');
    });

    it('should format thousands with K suffix', () => {
      expect(formatPriceShort(5000)).toBe('5.0K');
    });

    it('should format small numbers normally', () => {
      expect(formatPriceShort(500)).toBe('500');
    });
  });

  describe('formatSpread', () => {
    it('should calculate and format spread correctly', () => {
      const buy = 81000000;
      const sell = 82000000;
      expect(formatSpread(buy, sell, 'VND')).toBe('1.00M');
    });

    it('should handle USD spread', () => {
      const buy = 2940;
      const sell = 2950;
      expect(formatSpread(buy, sell, 'USD')).toBe('$10.00');
    });
  });
});
