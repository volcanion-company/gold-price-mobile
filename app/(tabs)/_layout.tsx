import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks';
import { useLanguage } from '../../src/contexts';
import { COLORS } from '../../src/utils/constants';
import { haptics } from '../../src/utils/haptics';

type IconName = keyof typeof Ionicons.glyphMap;

function TabBarIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <View className={`items-center justify-center ${focused ? 'opacity-100' : 'opacity-60'}`}>
      <Ionicons 
        name={name} 
        size={22} 
        color={focused ? COLORS.primary : '#9ca3af'} 
      />
    </View>
  );
}

export default function TabLayout() {
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 60 + Math.max(insets.bottom - 8, 0),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.card,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
      screenListeners={{
        tabPress: () => {
          haptics.light();
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabBarIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: t('tabs.compare'),
          headerTitle: t('compare.title'),
          tabBarIcon: ({ focused }) => <TabBarIcon name={focused ? 'git-compare' : 'git-compare-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="charts"
        options={{
          title: t('tabs.charts'),
          headerTitle: t('charts.title'),
          tabBarIcon: ({ focused }) => <TabBarIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: t('tabs.alerts'),
          headerTitle: t('alerts.title'),
          tabBarIcon: ({ focused }) => <TabBarIcon name={focused ? 'notifications' : 'notifications-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: t('tabs.portfolio'),
          headerTitle: t('portfolio.title'),
          tabBarIcon: ({ focused }) => <TabBarIcon name={focused ? 'wallet' : 'wallet-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabBarIcon name={focused ? 'settings' : 'settings-outline'} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
