// hooks/useTheme.ts - Updated to work with ThemeContext
import { useContext, useEffect } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Appearance, AppState } from "react-native";

export function useTheme() {
  // Use the centralized ThemeContext
  const { theme, setTheme, isDark, actualTheme } = useContext(ThemeContext);
  
  // Handle system appearance changes on React Native
  useEffect(() => {
    // Set up listener for appearance changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === 'system') {
        // Only log if we're in system mode (the context already handles the update)
        console.log('System appearance changed to:', colorScheme);
      }
    });

    // Handle app state changes to pick up appearance changes when app becomes active
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && theme === 'system') {
        // Refresh system theme when app becomes active
        const currentColorScheme = Appearance.getColorScheme();
        console.log('App became active, current system theme:', currentColorScheme);
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      appStateSubscription?.remove();
    };
  }, [theme]);

  // Helper function to get appropriate status bar style
  const getStatusBarStyle = () => {
    return actualTheme === 'dark' ? 'light' : 'dark';
  };

  return { 
    theme, 
    setTheme,
    actualTheme,
    statusBarStyle: getStatusBarStyle(),
    isDark
  };
}