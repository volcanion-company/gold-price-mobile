// Jest setup file
// Note: @testing-library/jest-native is deprecated, using built-in matchers

// Setup global fetch mock for tests
global.fetch = jest.fn();

// Mock expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'Giá Vàng',
    slug: 'gold-price',
    version: '1.0.0',
  },
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'mock-token' })),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  Link: 'Link',
  Tabs: {
    Screen: 'Screen',
  },
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'vi' }],
}));

// Mock i18n
jest.mock('./src/i18n', () => ({
  t: (key) => key,
  setLanguage: jest.fn(),
  getCurrentLanguage: () => 'vi',
}));

// Mock i18n-js
jest.mock('i18n-js', () => ({
  I18n: jest.fn().mockImplementation(() => ({
    t: (key) => key,
    locale: 'vi',
    enableFallback: true,
    translations: {},
  })),
}));

// Silence console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('ReactNative')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Global test timeout
jest.setTimeout(10000);
