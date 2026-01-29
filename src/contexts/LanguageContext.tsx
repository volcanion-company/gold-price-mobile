import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

type Language = 'vi' | 'en';

const LANGUAGE_KEY = '@app_language';

interface LanguageContextType {
  language: Language;
  isLoading: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, options?: object) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('vi');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage && ['vi', 'en'].includes(savedLanguage)) {
          setLanguageState(savedLanguage as Language);
          i18n.locale = savedLanguage;
        }
      } catch (error) {
        console.error('Failed to load language:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLanguage();
  }, []);

  // Set language and save to storage
  const setLanguage = useCallback(async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      i18n.locale = lang;
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to save language:', error);
      throw error;
    }
  }, []);

  // Translate function that uses current language
  const t = useCallback((key: string, options?: object): string => {
    return i18n.t(key, options);
  }, [language]); // Re-create when language changes

  return (
    <LanguageContext.Provider value={{ language, isLoading, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export { LanguageContext };
