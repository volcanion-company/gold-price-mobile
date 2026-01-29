import { create } from 'zustand';
import { GoldPrice } from '../types';

interface PriceState {
  prices: GoldPrice[];
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPrices: (prices: GoldPrice[]) => void;
  updatePrice: (price: GoldPrice) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePriceStore = create<PriceState>((set) => ({
  prices: [],
  lastUpdated: null,
  isLoading: false,
  error: null,

  setPrices: (prices) =>
    set({
      prices,
      lastUpdated: new Date().toISOString(),
      error: null,
    }),

  updatePrice: (price) =>
    set((state) => ({
      prices: state.prices.map((p) =>
        p.code === price.code ? price : p
      ),
      lastUpdated: new Date().toISOString(),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () =>
    set({
      prices: [],
      lastUpdated: null,
      isLoading: false,
      error: null,
    }),
}));
