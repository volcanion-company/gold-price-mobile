import apiClient from './client';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  uptime: number;
  timestamp: string;
  services: {
    mongodb: { status: string; latency: number };
    redis: { status: string; latency: number };
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  websocket: {
    connectedClients: number;
  };
}

export const healthApi = {
  /**
   * Get detailed system health status
   */
  async getHealth(): Promise<HealthStatus> {
    const response = await apiClient.get<{
      success: boolean;
      data: HealthStatus;
    }>('/health');
    return response.data.data;
  },

  /**
   * Liveness probe - returns true if server is alive
   */
  async isAlive(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ status: string }>('/health/live');
      return response.data.status === 'alive';
    } catch {
      return false;
    }
  },

  /**
   * Readiness probe - returns true if services are ready
   */
  async isReady(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ status: string }>('/health/ready');
      return response.data.status === 'ready';
    } catch {
      return false;
    }
  },
};
