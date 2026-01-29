import { useCallback } from 'react';
import { useAuthStore } from '../stores';
import { authApi } from '../services/api';
import { LoginRequest, RegisterRequest } from '../types';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: logoutStore } = useAuthStore();

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    try {
      const { user } = await authApi.login(credentials);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    try {
      const { user } = await authApi.register(data);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.logout();
      logoutStore();
    } catch (error) {
      // Still logout locally even if API fails
      logoutStore();
    } finally {
      setLoading(false);
    }
  }, [logoutStore, setLoading]);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  const updateProfile = useCallback(async (data: { name?: string; avatar?: string }) => {
    setLoading(true);
    try {
      const updatedUser = await authApi.updateProfile(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const deleteAccount = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.deleteAccount();
      logoutStore();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [logoutStore, setLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
    changePassword,
    deleteAccount,
  };
}
