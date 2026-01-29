import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, Link } from 'expo-router';
import { useAuth, useTheme } from '../../src/hooks';
import { useLanguage } from '../../src/contexts';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.passwordMinLength'));
      return;
    }

    try {
      await register({ name: name.trim(), email: email.trim(), password });
      Alert.alert(t('common.success'), t('auth.registerSuccess'), [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (error: any) {
      Alert.alert(t('auth.registerFailed'), error.message || t('common.retry'));
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('auth.register'),
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
          <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="items-center mb-6">
              <Text className="text-5xl mb-4">💰</Text>
              <Text 
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {t('auth.createAccount')}
              </Text>
              <Text 
                className="mt-2"
                style={{ color: colors.textSecondary }}
              >
                {t('auth.registerDesc')}
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <View>
                <Text 
                  className="text-sm font-medium mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  {t('auth.name')}
                </Text>
                <TextInput
                  className="px-4 py-3.5 rounded-xl"
                  style={{ 
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                  }}
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View className="mt-4">
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
                    placeholder={t('auth.passwordPlaceholder')}
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

              <View className="mt-4">
                <Text 
                  className="text-sm font-medium mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  {t('auth.confirmPassword')}
                </Text>
                <TextInput
                  className="px-4 py-3.5 rounded-xl"
                  style={{ 
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                  }}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            {/* Terms */}
            <Text 
              className="text-xs mt-6 text-center"
              style={{ color: colors.textTertiary }}
            >
              {t('auth.termsPrefix')}{' '}
              <Text style={{ color: colors.primary }}>{t('auth.termsOfService')}</Text> {t('common.and')}{' '}
              <Text style={{ color: colors.primary }}>{t('auth.privacyPolicy')}</Text>
            </Text>

            {/* Register Button */}
            <Pressable
              className="mt-6 py-4 rounded-xl"
              style={{ 
                backgroundColor: isLoading ? colors.border : colors.primary,
              }}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text className="text-center text-white text-lg font-bold">
                {isLoading ? t('common.loading') : t('auth.register')}
              </Text>
            </Pressable>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6 pb-6">
              <Text style={{ color: colors.textSecondary }}>
                {t('auth.hasAccount')}{' '}
              </Text>
              <Link href="/auth/login" asChild>
                <Pressable>
                  <Text className="font-semibold" style={{ color: colors.primary }}>
                    {t('auth.login')}
                  </Text>
                </Pressable>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
