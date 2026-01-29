import apiClient from './client';

// Types for portfolio
export interface Holding {
  id: string;
  goldType: string;
  goldTypeName: string;
  weight: number; // in grams or lượng
  weightUnit: 'gram' | 'luong' | 'ounce';
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  holdingId: string;
  type: 'buy' | 'sell';
  weight: number;
  weightUnit: 'gram' | 'luong' | 'ounce';
  price: number;
  totalAmount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface CreateHoldingDto {
  goldType: string;
  goldTypeName: string;
  weight: number;
  weightUnit: 'gram' | 'luong' | 'ounce';
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
}

export interface UpdateHoldingDto {
  weight?: number;
  weightUnit?: 'gram' | 'luong' | 'ounce';
  purchasePrice?: number;
  purchaseDate?: string;
  notes?: string;
}

export interface AddTransactionDto {
  holdingId: string;
  type: 'buy' | 'sell';
  weight: number;
  weightUnit: 'gram' | 'luong' | 'ounce';
  price: number;
  date: string;
  notes?: string;
}

export interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercent: number;
  totalWeight: number;
  holdingsCount: number;
  lastUpdated: string;
}

export interface PortfolioSummary {
  holdings: Holding[];
  stats: PortfolioStats;
  transactions: Transaction[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Portfolio API endpoints
export const portfolioApi = {
  /**
   * Get complete portfolio summary
   */
  getPortfolio: async (): Promise<PortfolioSummary> => {
    try {
      const response = await apiClient.get<ApiResponse<PortfolioSummary>>('/portfolio');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  },

  /**
   * Get all holdings
   */
  getHoldings: async (): Promise<Holding[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Holding[]>>('/portfolio/holdings');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching holdings:', error);
      throw error;
    }
  },

  /**
   * Get a single holding by ID
   */
  getHolding: async (id: string): Promise<Holding> => {
    try {
      const response = await apiClient.get<ApiResponse<Holding>>(`/portfolio/holdings/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching holding:', error);
      throw error;
    }
  },

  /**
   * Add a new holding
   */
  addHolding: async (data: CreateHoldingDto): Promise<Holding> => {
    try {
      const response = await apiClient.post<ApiResponse<Holding>>('/portfolio/holdings', data);
      return response.data.data;
    } catch (error) {
      console.error('Error adding holding:', error);
      throw error;
    }
  },

  /**
   * Update an existing holding
   */
  updateHolding: async (id: string, data: UpdateHoldingDto): Promise<Holding> => {
    try {
      const response = await apiClient.put<ApiResponse<Holding>>(`/portfolio/holdings/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating holding:', error);
      throw error;
    }
  },

  /**
   * Delete a holding
   */
  deleteHolding: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/portfolio/holdings/${id}`);
    } catch (error) {
      console.error('Error deleting holding:', error);
      throw error;
    }
  },

  /**
   * Get portfolio statistics
   */
  getStats: async (): Promise<PortfolioStats> => {
    try {
      const response = await apiClient.get<ApiResponse<PortfolioStats>>('/portfolio/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching portfolio stats:', error);
      throw error;
    }
  },

  /**
   * Get all transactions
   */
  getTransactions: async (params?: {
    holdingId?: string;
    type?: 'buy' | 'sell';
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ transactions: Transaction[]; total: number; page: number; limit: number }> => {
    try {
      const response = await apiClient.get<ApiResponse<{
        transactions: Transaction[];
        total: number;
        page: number;
        limit: number;
      }>>('/portfolio/transactions', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  /**
   * Add a transaction to a holding
   */
  addTransaction: async (data: AddTransactionDto): Promise<Transaction> => {
    try {
      const response = await apiClient.post<ApiResponse<Transaction>>('/portfolio/transactions', data);
      return response.data.data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  /**
   * Delete a transaction
   */
  deleteTransaction: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/portfolio/transactions/${id}`);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  /**
   * Get portfolio value history for charts
   */
  getValueHistory: async (period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'): Promise<{
    date: string;
    value: number;
    invested: number;
    profitLoss: number;
  }[]> => {
    try {
      const response = await apiClient.get<ApiResponse<{
        date: string;
        value: number;
        invested: number;
        profitLoss: number;
      }[]>>('/portfolio/history', { params: { period } });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching portfolio history:', error);
      throw error;
    }
  },

  /**
   * Export portfolio data
   */
  exportPortfolio: async (format: 'csv' | 'pdf'): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/portfolio/export`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting portfolio:', error);
      throw error;
    }
  },

  /**
   * Calculate portfolio value with current prices
   */
  calculateValue: async (priceCode: string): Promise<{
    currentValue: number;
    profitLoss: number;
    profitLossPercent: number;
  }> => {
    try {
      const response = await apiClient.post<ApiResponse<{
        currentValue: number;
        profitLoss: number;
        profitLossPercent: number;
      }>>('/portfolio/calculate', { priceCode });
      return response.data.data;
    } catch (error) {
      console.error('Error calculating portfolio value:', error);
      throw error;
    }
  },
};

export default portfolioApi;
