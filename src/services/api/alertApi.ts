import apiClient from './client';

// Types for alerts
export interface Alert {
  id: string;
  goldType: string;
  goldTypeName: string;
  type: 'above' | 'below';
  targetPrice: number;
  currentPrice?: number;
  isEnabled: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAlertDto {
  goldType: string;
  goldTypeName: string;
  type: 'above' | 'below';
  targetPrice: number;
}

export interface UpdateAlertDto {
  type?: 'above' | 'below';
  targetPrice?: number;
  isEnabled?: boolean;
}

export interface AlertHistory {
  id: string;
  alertId: string;
  goldType: string;
  goldTypeName: string;
  type: 'above' | 'below';
  targetPrice: number;
  actualPrice: number;
  triggeredAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Alert API endpoints
export const alertApi = {
  /**
   * Get all alerts for current user
   */
  getAlerts: async (): Promise<Alert[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Alert[]>>('/alerts');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  /**
   * Get a single alert by ID
   */
  getAlert: async (id: string): Promise<Alert> => {
    try {
      const response = await apiClient.get<ApiResponse<Alert>>(`/alerts/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching alert:', error);
      throw error;
    }
  },

  /**
   * Create a new alert
   */
  createAlert: async (data: CreateAlertDto): Promise<Alert> => {
    try {
      const response = await apiClient.post<ApiResponse<Alert>>('/alerts', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  },

  /**
   * Update an existing alert
   */
  updateAlert: async (id: string, data: UpdateAlertDto): Promise<Alert> => {
    try {
      const response = await apiClient.put<ApiResponse<Alert>>(`/alerts/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating alert:', error);
      throw error;
    }
  },

  /**
   * Delete an alert
   */
  deleteAlert: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/alerts/${id}`);
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  },

  /**
   * Toggle alert enabled/disabled
   */
  toggleAlert: async (id: string, isEnabled: boolean): Promise<Alert> => {
    try {
      const response = await apiClient.patch<ApiResponse<Alert>>(`/alerts/${id}/toggle`, {
        isEnabled,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error toggling alert:', error);
      throw error;
    }
  },

  /**
   * Get alert history (triggered alerts)
   */
  getAlertHistory: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ alerts: AlertHistory[]; total: number; page: number; limit: number }> => {
    try {
      const response = await apiClient.get<ApiResponse<{
        alerts: AlertHistory[];
        total: number;
        page: number;
        limit: number;
      }>>('/alerts/history', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching alert history:', error);
      throw error;
    }
  },

  /**
   * Get active alerts count
   */
  getActiveAlertsCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get<ApiResponse<{ count: number }>>('/alerts/count');
      return response.data.data.count;
    } catch (error) {
      console.error('Error fetching alerts count:', error);
      throw error;
    }
  },

  /**
   * Clear alert history
   */
  clearHistory: async (): Promise<void> => {
    try {
      await apiClient.delete('/alerts/history');
    } catch (error) {
      console.error('Error clearing alert history:', error);
      throw error;
    }
  },

  /**
   * Batch delete alerts
   */
  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      await apiClient.post('/alerts/batch-delete', { ids });
    } catch (error) {
      console.error('Error deleting multiple alerts:', error);
      throw error;
    }
  },

  /**
   * Check alerts against current prices
   * This is typically done server-side, but can be triggered manually
   */
  checkAlerts: async (): Promise<AlertHistory[]> => {
    try {
      const response = await apiClient.post<ApiResponse<AlertHistory[]>>('/alerts/check');
      return response.data.data;
    } catch (error) {
      console.error('Error checking alerts:', error);
      throw error;
    }
  },
};

export default alertApi;
