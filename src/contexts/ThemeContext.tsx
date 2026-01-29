import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme, ThemeColors, ColorScheme } from '../hooks/useTheme';

interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  themePreference: ColorScheme;
  isDark: boolean;
  isLoading: boolean;
  colors: ThemeColors;
  setTheme: (scheme: ColorScheme) => Promise<void>;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export { ThemeContext };
