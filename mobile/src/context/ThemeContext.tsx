// ThemeContext.tsx - React Native version with NativeWind and System Theme Support

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { useColorScheme } from 'nativewind';

// Define available themes - now includes system
export type ThemeType = "light" | "dark" | "system";

// Define Theme Context Type
interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
  actualTheme: "light" | "dark";
}

// Create Context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {}, // Default function (empty)
  isDark: false,
  actualTheme: "light",
});

// Custom hook to use the Theme Context
export const useTheme = () => useContext(ThemeContext);

// Theme Provider Component
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  
  // Initialize state from AsyncStorage if available, otherwise default to system
  const [theme, setThemeState] = useState<ThemeType>("system");
  const [isInitialized, setIsInitialized] = useState(false);

  // Helper function to get the actual theme being used
  const getActualTheme = (currentTheme: ThemeType): "light" | "dark" => {
    if (currentTheme === 'system') {
      return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
    }
    return currentTheme;
  };

  // Load theme from AsyncStorage on component mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme") as ThemeType;
        const initialTheme = (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") 
          ? savedTheme 
          : "system";
        setThemeState(initialTheme);
        
        // Set the actual theme for NativeWind
        const actualTheme = getActualTheme(initialTheme);
        setColorScheme(actualTheme);
      } catch (error) {
        console.error('Error loading theme from AsyncStorage:', error);
        // Default to system theme if there's an error
        setThemeState("system");
        const systemTheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
        setColorScheme(systemTheme);
      } finally {
        setIsInitialized(true);
      }
    };

    loadTheme();
  }, [setColorScheme]);

  // Listen for system appearance changes when theme is set to system
  useEffect(() => {
    if (theme !== 'system') return;

    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      const actualTheme = newColorScheme === 'dark' ? 'dark' : 'light';
      setColorScheme(actualTheme);
    });

    return () => subscription?.remove();
  }, [theme, setColorScheme]);

  // Update theme function
  const setTheme = async (newTheme: ThemeType) => {
    try {
      setThemeState(newTheme);
      
      // Set the actual theme for NativeWind
      const actualTheme = getActualTheme(newTheme);
      setColorScheme(actualTheme);
      
      await AsyncStorage.setItem("theme", newTheme);
    } catch (error) {
      console.error('Error saving theme to AsyncStorage:', error);
    }
  };

  // Don't render children until theme is initialized to prevent flash
  if (!isInitialized) {
    return null;
  }

  const actualTheme = getActualTheme(theme);

  const value = {
    theme,
    setTheme,
    isDark: actualTheme === "dark",
    actualTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext };