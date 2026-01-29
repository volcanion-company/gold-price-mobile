import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores';
import { useThemeContext, useLanguage } from '../../contexts';
import { authApi } from '../../services/api';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard component that requires authentication to view content.
 * Shows login prompt if user is not authenticated.
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { isDark, colors } = useThemeContext();
  const { t } = useLanguage();
  const { isAuthenticated, setUser, setLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasToken = await authApi.isAuthenticated();
        if (hasToken) {
          // Verify token is still valid by fetching profile
          const user = await authApi.getProfile();
          setUser(user);
        }
      } catch (error) {
        // Token invalid or expired, user needs to login
        console.log('Auth check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    if (!isAuthenticated) {
      checkAuth();
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, setUser]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If authenticated, show children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default login prompt
  return (
    <View 
      className="flex-1 items-center justify-center p-6"
      style={{ backgroundColor: colors.background }}
    >
      <View className="items-center mb-8">
        <View 
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }}
        >
          <Ionicons name="lock-closed" size={40} color={colors.primary} />
        </View>
        <Text 
          className="text-xl font-bold text-center mb-2"
          style={{ color: colors.text }}
        >
          {t('auth.loginRequired')}
        </Text>
        <Text 
          className="text-center"
          style={{ color: colors.textSecondary }}
        >
          {t('auth.loginRequiredDesc')}
        </Text>
      </View>

      <Pressable
        className="w-full py-4 rounded-xl items-center mb-3"
        style={{ backgroundColor: colors.primary }}
        onPress={() => router.push('/auth/login')}
      >
        <Text className="text-white font-semibold text-base">
          {t('auth.login')}
        </Text>
      </Pressable>

      <Pressable
        className="w-full py-4 rounded-xl items-center border"
        style={{ borderColor: colors.border }}
        onPress={() => router.push('/auth/register')}
      >
        <Text className="font-semibold text-base" style={{ color: colors.text }}>
          {t('auth.register')}
        </Text>
      </Pressable>
    </View>
  );
}
