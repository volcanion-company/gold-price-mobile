import apiClient from './client';
import * as SecureStore from 'expo-secure-store';
import { User, AuthTokens, LoginRequest, RegisterRequest } from '../../types';

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    };
  };
}

export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    const { user, tokens } = response.data.data;
    
    // Store tokens securely
    await SecureStore.setItemAsync('accessToken', tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
    
    return { user, tokens };
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    const { user, tokens } = response.data.data;
    
    // Store tokens securely
    await SecureStore.setItemAsync('accessToken', tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
    
    return { user, tokens };
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear tokens regardless of API response
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return response.data.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: {
    name?: string;
    avatar?: string;
    preferences?: {
      language?: string;
      currency?: string;
      darkMode?: boolean;
      notifications?: {
        push?: boolean;
        email?: boolean;
      };
    };
  }): Promise<User> {
    const response = await apiClient.put<{ success: boolean; data: User }>('/auth/profile', data);
    return response.data.data;
  },

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put('/auth/password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    await apiClient.delete('/auth/me');
    // Clear tokens
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('accessToken');
    return !!token;
  },
};
