import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, Link } from 'expo-router';
import { useAuth, useTheme } from '../../src/hooks';
import { useLanguage } from '../../src/contexts';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    try {
      await login({ email: email.trim(), password });
      router.replace('/');
    } catch (error: any) {
      Alert.alert(t('auth.loginFailed'), error.message || t('common.retry'));
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('auth.login'),
          headerBackTitle: t('common.close'),
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }}
      />
      
      <SafeAreaView 
        className="flex-1" 
        style={{ backgroundColor: colors.background }}
        edges={['bottom']}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View className="flex-1 px-6 pt-8">
            {/* Header */}
            <View className="items-center mb-8">
              <Text className="text-5xl mb-4">💰</Text>
              <Text 
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {t('home.title')}
              </Text>
              <Text 
                className="mt-2"
                style={{ color: colors.textSecondary }}
              >
                {t('settings.loginDesc')}
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <View>
                <Text 
                  className="text-sm font-medium mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  {t('auth.email')}
                </Text>
                <TextInput
                  className="px-4 py-3.5 rounded-xl"
                  style={{ 
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                  }}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View className="mt-4">
                <Text 
                  className="text-sm font-medium mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  {t('auth.password')}
                </Text>
                <View className="relative">
                  <TextInput
                    className="px-4 py-3.5 rounded-xl pr-12"
                    style={{ 
                      backgroundColor: colors.cardSecondary,
                      color: colors.text,
                    }}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable
                    className="absolute right-4 top-3.5"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={{ color: colors.textSecondary }}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Forgot Password */}
              <Pressable className="self-end mt-2">
                <Text className="text-sm" style={{ color: colors.primary }}>
                  {t('auth.forgotPassword')}
                </Text>
              </Pressable>
            </View>

            {/* Login Button */}
            <Pressable
              className="mt-8 py-4 rounded-xl"
              style={{ 
                backgroundColor: isLoading ? colors.border : colors.primary,
              }}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-center text-white text-lg font-bold">
                {isLoading ? t('common.loading') : t('auth.login')}
              </Text>
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
              <Text className="mx-4" style={{ color: colors.textTertiary }}>
                {t('common.or', { defaultValue: 'hoặc' })}
              </Text>
              <View className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
            </View>

            {/* Social Login */}
            <View className="flex-row gap-4">
              <Pressable 
                className="flex-1 flex-row items-center justify-center py-3 rounded-xl active:opacity-80"
                style={{ backgroundColor: colors.cardSecondary }}
              >
                <Text className="text-xl mr-2">🔵</Text>
                <Text className="font-medium" style={{ color: colors.text }}>Google</Text>
              </Pressable>
              <Pressable 
                className="flex-1 flex-row items-center justify-center py-3 rounded-xl active:opacity-80"
                style={{ backgroundColor: colors.cardSecondary }}
              >
                <Text className="text-xl mr-2">🍎</Text>
                <Text className="font-medium" style={{ color: colors.text }}>Apple</Text>
              </Pressable>
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center mt-auto pb-4">
              <Text style={{ color: colors.textSecondary }}>
                {t('auth.noAccount')}{' '}
              </Text>
              <Link href="/auth/register" asChild>
                <Pressable>
                  <Text className="font-semibold" style={{ color: colors.primary }}>
                    {t('auth.register')}
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
