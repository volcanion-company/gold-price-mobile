import {
  getGoldName,
  getPriceChangeColor,
  calculateChangePercent,
  delay,
  clamp,
} from '../../src/utils/helpers';

describe('helpers', () => {
  describe('getGoldName', () => {
    it('should return correct name for known codes', () => {
      expect(getGoldName('XAUUSD')).toBe('Vàng Thế Giới (XAU/USD)');
      expect(getGoldName('SJL1L10')).toBe('SJC 9999 (1L-10L)');
    });

    it('should return code itself for unknown codes', () => {
      expect(getGoldName('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getPriceChangeColor', () => {
    it('should return "up" for positive values', () => {
      expect(getPriceChangeColor(100)).toBe('up');
      expect(getPriceChangeColor(0.01)).toBe('up');
    });

    it('should return "down" for negative values', () => {
      expect(getPriceChangeColor(-100)).toBe('down');
      expect(getPriceChangeColor(-0.01)).toBe('down');
    });

    it('should return "neutral" for zero', () => {
      expect(getPriceChangeColor(0)).toBe('neutral');
    });
  });

  describe('calculateChangePercent', () => {
    it('should calculate percentage correctly', () => {
      // currentPrice = 110, change = 10 -> previous = 100
      // (10 / 100) * 100 = 10%
      expect(calculateChangePercent(110, 10)).toBeCloseTo(10);
    });

    it('should handle negative change', () => {
      // currentPrice = 90, change = -10 -> previous = 100
      // (-10 / 100) * 100 = -10%
      expect(calculateChangePercent(90, -10)).toBeCloseTo(-10);
    });

    it('should return 0 for zero current price', () => {
      expect(calculateChangePercent(0, 10)).toBe(0);
    });

    it('should return 0 for zero previous price', () => {
      // currentPrice = 10, change = 10 -> previous = 0
      expect(calculateChangePercent(10, 10)).toBe(0);
    });
  });

  describe('delay', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now();
      await delay(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90); // Allow small margin
    });
  });

  describe('clamp', () => {
    it('should return value if within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('should return min if value is below range', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('should return max if value is above range', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });
});
