import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import vi from './locales/vi';
import en from './locales/en';

const LANGUAGE_KEY = '@app_language';

// Create i18n instance
const i18n = new I18n({
  vi,
  en,
});

// Set default locale to Vietnamese
i18n.defaultLocale = 'vi';
i18n.locale = 'vi'; // Default to Vietnamese, not system
i18n.enableFallback = true;

// Load saved language preference
export const loadLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && ['vi', 'en'].includes(savedLanguage)) {
      i18n.locale = savedLanguage;
      return savedLanguage;
    }
  } catch (error) {
    console.error('Failed to load language:', error);
  }
  return i18n.locale;
};

// Save language preference
export const setLanguage = async (language: 'vi' | 'en'): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    i18n.locale = language;
  } catch (error) {
    console.error('Failed to save language:', error);
    throw error;
  }
};

// Get current language
export const getCurrentLanguage = (): string => {
  return i18n.locale;
};

// Translate function
export const t = (key: string, options?: object): string => {
  return i18n.t(key, options);
};

// Export i18n instance
export default i18n;
