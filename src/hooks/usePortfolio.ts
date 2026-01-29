import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HoldingItem, Transaction } from '../types';

const HOLDINGS_STORAGE_KEY = '@gold_price_holdings';
const TRANSACTIONS_STORAGE_KEY = '@gold_price_transactions';

export const usePortfolio = () => {
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data from storage
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [holdingsStored, transactionsStored] = await Promise.all([
        AsyncStorage.getItem(HOLDINGS_STORAGE_KEY),
        AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY),
      ]);

      if (holdingsStored) {
        setHoldings(JSON.parse(holdingsStored));
      }
      if (transactionsStored) {
        setTransactions(JSON.parse(transactionsStored));
      }
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save holdings to storage
  const saveHoldings = useCallback(async (newHoldings: HoldingItem[]) => {
    try {
      await AsyncStorage.setItem(HOLDINGS_STORAGE_KEY, JSON.stringify(newHoldings));
      setHoldings(newHoldings);
    } catch (error) {
      console.error('Failed to save holdings:', error);
      throw error;
    }
  }, []);

  // Save transactions to storage
  const saveTransactions = useCallback(async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      console.error('Failed to save transactions:', error);
      throw error;
    }
  }, []);

  // Add new holding
  const addHolding = useCallback(async (holdingData: Omit<HoldingItem, 'id'>) => {
    const newHolding: HoldingItem = {
      ...holdingData,
      id: Date.now().toString(),
    };

    const newHoldings = [...holdings, newHolding];
    await saveHoldings(newHoldings);

    // Also add as transaction
    const transaction: Transaction = {
      id: Date.now().toString() + '_tx',
      productName: holdingData.productName,
      type: 'buy',
      quantity: holdingData.quantity,
      price: holdingData.buyPrice,
      date: holdingData.buyDate,
      note: holdingData.note,
    };
    await saveTransactions([...transactions, transaction]);

    return newHolding;
  }, [holdings, transactions, saveHoldings, saveTransactions]);

  // Update holding
  const updateHolding = useCallback(async (id: string, updates: Partial<HoldingItem>) => {
    const newHoldings = holdings.map(holding =>
      holding.id === id ? { ...holding, ...updates } : holding
    );
    await saveHoldings(newHoldings);
  }, [holdings, saveHoldings]);

  // Delete holding
  const deleteHolding = useCallback(async (id: string) => {
    return new Promise<void>((resolve) => {
      Alert.alert(
        'Xác nhận xóa',
        'Bạn có chắc muốn xóa giao dịch này?',
        [
          { text: 'Hủy', style: 'cancel', onPress: () => resolve() },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              const newHoldings = holdings.filter(holding => holding.id !== id);
              await saveHoldings(newHoldings);
              resolve();
            },
          },
        ]
      );
    });
  }, [holdings, saveHoldings]);

  // Sell holding (add sell transaction)
  const sellHolding = useCallback(async (
    holdingId: string,
    quantity: number,
    sellPrice: number
  ) => {
    const holding = holdings.find(h => h.id === holdingId);
    if (!holding) throw new Error('Holding not found');

    if (quantity > holding.quantity) {
      throw new Error('Sell quantity exceeds holding quantity');
    }

    // Update or remove holding
    if (quantity === holding.quantity) {
      // Remove holding completely
      const newHoldings = holdings.filter(h => h.id !== holdingId);
      await saveHoldings(newHoldings);
    } else {
      // Reduce quantity
      await updateHolding(holdingId, { quantity: holding.quantity - quantity });
    }

    // Add sell transaction
    const transaction: Transaction = {
      id: Date.now().toString() + '_sell',
      productName: holding.productName,
      type: 'sell',
      quantity,
      price: sellPrice,
      date: new Date().toISOString(),
    };
    await saveTransactions([...transactions, transaction]);
  }, [holdings, transactions, updateHolding, saveHoldings, saveTransactions]);

  // Calculate total portfolio value
  const calculateTotalValue = useCallback((getCurrentPrice: (productName: string) => number) => {
    return holdings.reduce((total, holding) => {
      const currentPrice = getCurrentPrice(holding.productName) || holding.buyPrice;
      return total + holding.quantity * currentPrice;
    }, 0);
  }, [holdings]);

  // Calculate total invested
  const totalInvested = holdings.reduce(
    (total, holding) => total + holding.quantity * holding.buyPrice,
    0
  );

  // Calculate profit/loss
  const calculateProfitLoss = useCallback((getCurrentPrice: (productName: string) => number) => {
    const currentValue = calculateTotalValue(getCurrentPrice);
    return currentValue - totalInvested;
  }, [calculateTotalValue, totalInvested]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    holdings,
    transactions,
    loading,
    totalInvested,
    loadData,
    addHolding,
    updateHolding,
    deleteHolding,
    sellHolding,
    calculateTotalValue,
    calculateProfitLoss,
  };
};
