import '../global.css';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ExpoSplashScreen from 'expo-splash-screen';
import Animated, { FadeOut } from 'react-native-reanimated';
import { ThemeProvider, LanguageProvider, useThemeContext } from '../src/contexts';
import { SplashScreen } from '../src/components/common';
import { loadLanguage } from '../src/i18n';

// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)
    },
  },
});

function RootLayoutNav() {
  const { colors, isDark } = useThemeContext();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen 
          name="price/[code]" 
          options={{ 
            headerShown: true,
            headerTitle: 'Chi tiết giá',
            headerBackTitle: 'Quay lại',
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="auth/login" 
          options={{ 
            headerShown: true,
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="auth/register" 
          options={{ 
            headerShown: true,
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="settings/profile" 
          options={{ 
            headerShown: true,
            animation: 'slide_from_right',
          }} 
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Load saved language and hide native splash
    const init = async () => {
      await loadLanguage();
      await ExpoSplashScreen.hideAsync();
      setAppReady(true);
    };
    
    const timer = setTimeout(init, 300);
    return () => clearTimeout(timer);
  }, []);

  // Hide custom splash after animation
  useEffect(() => {
    if (appReady) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2500); // Show splash for 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [appReady]);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <LanguageProvider>
              <RootLayoutNav />
              {showSplash && (
                <Animated.View 
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0,
                    zIndex: 999,
                  }}
                  exiting={FadeOut.duration(500)}
                >
                  <SplashScreen />
                </Animated.View>
              )}
            </LanguageProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
