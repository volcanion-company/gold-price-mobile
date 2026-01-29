import apiClient from './client';

export interface Provider {
  _id: string;
  code: string;
  name: string;
  shortName: string;
  website?: string;
  isActive: boolean;
}

export const providerApi = {
  /**
   * Get all gold providers
   */
  async getAllProviders(): Promise<Provider[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: Provider[];
    }>('/providers');
    return response.data.data;
  },

  /**
   * Get provider by code
   */
  async getProviderByCode(code: string): Promise<Provider> {
    const response = await apiClient.get<{
      success: boolean;
      data: Provider;
    }>(`/providers/${code}`);
    return response.data.data;
  },
};
