import { usePriceStore } from '../../src/stores/priceStore';
import { GoldPrice } from '../../src/types';

const mockPrice: GoldPrice = {
  code: 'XAUUSD',
  name: 'Vàng Thế Giới (XAU/USD)',
  type: 'gold',
  brand: 'international',
  providerId: 'world',
  buy: 2000,
  sell: 2001,
  buyPrice: 2000,
  sellPrice: 2001,
  change: 10,
  changePercent: 0.5,
  currency: 'USD',
  updatedAt: '2026-01-30T10:00:00Z',
};

const mockPrice2: GoldPrice = {
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

describe('priceStore', () => {
  beforeEach(() => {
    // Reset store before each test
    usePriceStore.getState().reset();
  });

  it('should have initial state', () => {
    const state = usePriceStore.getState();
    
    expect(state.prices).toEqual([]);
    expect(state.lastUpdated).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set prices', () => {
    const { setPrices } = usePriceStore.getState();
    
    setPrices([mockPrice, mockPrice2]);
    
    const state = usePriceStore.getState();
    expect(state.prices).toHaveLength(2);
    expect(state.prices[0].code).toBe('XAUUSD');
    expect(state.prices[1].code).toBe('SJC_1L');
    expect(state.lastUpdated).not.toBeNull();
    expect(state.error).toBeNull();
  });

  it('should update a single price', () => {
    const { setPrices, updatePrice } = usePriceStore.getState();
    
    setPrices([mockPrice, mockPrice2]);
    
    const updatedPrice = {
      ...mockPrice,
      buyPrice: 2100,
      sellPrice: 2101,
    };
    
    updatePrice(updatedPrice);
    
    const state = usePriceStore.getState();
    expect(state.prices[0].buyPrice).toBe(2100);
    expect(state.prices[0].sellPrice).toBe(2101);
    // Other price should remain unchanged
    expect(state.prices[1].buyPrice).toBe(82000000);
  });

  it('should set loading state', () => {
    const { setLoading } = usePriceStore.getState();
    
    setLoading(true);
    expect(usePriceStore.getState().isLoading).toBe(true);
    
    setLoading(false);
    expect(usePriceStore.getState().isLoading).toBe(false);
  });

  it('should set error state', () => {
    const { setError } = usePriceStore.getState();
    
    setError('Network error');
    
    const state = usePriceStore.getState();
    expect(state.error).toBe('Network error');
    expect(state.isLoading).toBe(false);
  });

  it('should clear error when setting prices', () => {
    const { setError, setPrices } = usePriceStore.getState();
    
    setError('Previous error');
    expect(usePriceStore.getState().error).toBe('Previous error');
    
    setPrices([mockPrice]);
    expect(usePriceStore.getState().error).toBeNull();
  });

  it('should reset store to initial state', () => {
    const { setPrices, setLoading, setError, reset } = usePriceStore.getState();
    
    setPrices([mockPrice]);
    setLoading(true);
    setError('Some error');
    
    reset();
    
    const state = usePriceStore.getState();
    expect(state.prices).toEqual([]);
    expect(state.lastUpdated).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});
