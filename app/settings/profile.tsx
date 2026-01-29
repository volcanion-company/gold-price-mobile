import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth, useTheme } from '../../src/hooks';
import { useLanguage } from '../../src/contexts';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, changePassword, deleteAccount, logout, isLoading } = useAuth();
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert(t('common.error'), t('auth.nameRequired'));
      return;
    }

    try {
      await updateProfile({ name: newName.trim() });
      setIsEditingName(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('common.success'), t('auth.changeNameSuccess'));
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('errors.unknown'));
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('auth.passwordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordMismatch'));
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('common.success'), t('auth.changePasswordSuccess'));
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('auth.wrongPassword'));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('auth.deleteAccount'),
      t('auth.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              router.replace('/');
            } catch (error: any) {
              Alert.alert(t('common.error'), error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('auth.profile'),
          headerBackTitle: t('common.close'),
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }}
      />
      
      <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View 
            className="rounded-2xl p-4 mb-6"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row items-center mb-4">
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Text className="text-3xl">👤</Text>
              </View>
              <View className="flex-1">
                {isEditingName ? (
                  <View className="flex-row items-center">
                    <TextInput
                      className="flex-1 px-3 py-2 rounded-lg mr-2"
                      style={{ 
                        backgroundColor: colors.cardSecondary,
                        color: colors.text,
                      }}
                      value={newName}
                      onChangeText={setNewName}
                      autoFocus
                    />
                    <Pressable
                      className="p-2"
                      onPress={handleUpdateName}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Ionicons name="checkmark" size={24} color={colors.primary} />
                      )}
                    </Pressable>
                    <Pressable
                      className="p-2"
                      onPress={() => {
                        setIsEditingName(false);
                        setNewName(user?.name || '');
                      }}
                    >
                      <Ionicons name="close" size={24} color={colors.textSecondary} />
                    </Pressable>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Text 
                      className="text-lg font-bold mr-2"
                      style={{ color: colors.text }}
                    >
                      {user?.name}
                    </Text>
                    <Pressable onPress={() => setIsEditingName(true)}>
                      <Ionicons name="pencil" size={18} color={colors.textSecondary} />
                    </Pressable>
                  </View>
                )}
                <Text style={{ color: colors.textSecondary }}>{user?.email}</Text>
              </View>
            </View>

            {user?.isPremium && (
              <View 
                className="flex-row items-center px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#fef3c7' }}
              >
                <Ionicons name="diamond" size={20} color="#f59e0b" />
                <Text className="ml-2 font-medium" style={{ color: '#92400e' }}>
                  Premium Member
                </Text>
              </View>
            )}
          </View>

          {/* Change Password Section */}
          <View 
            className="rounded-2xl p-4 mb-6"
            style={{ backgroundColor: colors.card }}
          >
            <Pressable
              className="flex-row items-center justify-between py-2"
              onPress={() => setIsChangingPassword(!isChangingPassword)}
            >
              <View className="flex-row items-center">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.cardSecondary }}
                >
                  <Ionicons name="key" size={20} color={colors.textSecondary} />
                </View>
                <Text className="font-medium" style={{ color: colors.text }}>
                  {t('auth.changePassword')}
                </Text>
              </View>
              <Ionicons 
                name={isChangingPassword ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.textSecondary} 
              />
            </Pressable>

            {isChangingPassword && (
              <View className="mt-4 space-y-3">
                <TextInput
                  className="px-4 py-3 rounded-xl"
                  style={{ 
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                  }}
                  placeholder={t('auth.currentPassword')}
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TextInput
                  className="px-4 py-3 rounded-xl mt-2"
                  style={{ 
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                  }}
                  placeholder={t('auth.newPassword')}
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TextInput
                  className="px-4 py-3 rounded-xl mt-2"
                  style={{ 
                    backgroundColor: colors.cardSecondary,
                    color: colors.text,
                  }}
                  placeholder={t('auth.confirmNewPassword')}
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <Pressable
                  className="py-3 rounded-xl items-center mt-2"
                  style={{ backgroundColor: colors.primary }}
                  onPress={handleChangePassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold">
                      {t('auth.changePassword')}
                    </Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>

          {/* Logout */}
          <Pressable
            className="rounded-2xl p-4 mb-4 flex-row items-center"
            style={{ backgroundColor: colors.card }}
            onPress={handleLogout}
          >
            <View 
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: '#fee2e2' }}
            >
              <Ionicons name="log-out" size={20} color="#ef4444" />
            </View>
            <Text className="font-medium" style={{ color: '#ef4444' }}>
              {t('auth.logout')}
            </Text>
          </Pressable>

          {/* Delete Account */}
          <Pressable
            className="rounded-2xl p-4 mb-4 flex-row items-center"
            style={{ backgroundColor: colors.card }}
            onPress={handleDeleteAccount}
          >
            <View 
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: '#fee2e2' }}
            >
              <Ionicons name="trash" size={20} color="#dc2626" />
            </View>
            <Text className="font-medium" style={{ color: '#dc2626' }}>
              {t('auth.deleteAccount')}
            </Text>
          </Pressable>

          {/* Account Info */}
          <View className="items-center py-4">
            <Text style={{ color: colors.textTertiary }}>
              {t('settings.account')}: {user?.email}
            </Text>
            <Text style={{ color: colors.textTertiary }}>
              ID: {user?.id}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
