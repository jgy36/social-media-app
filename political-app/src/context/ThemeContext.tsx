import { createContext, useContext, useEffect, useState } from "react";

// Define available themes
const themes = {
  light: "light",
  dark: "dark",
  premiumGold: "premium-gold",
  premiumBlue: "premium-blue",
  premiumRed: "premium-red",
};

// Define Theme Context Type
interface ThemeContextType {
  theme: string;
  toggleTheme: (theme: string) => void;
}

// Create Context
const ThemeContext = createContext<ThemeContextType>({
  theme: themes.light,
  toggleTheme: () => {}, // Default function (empty)
});

// Theme Provider Component
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(themes.light);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme && Object.values(themes).includes(storedTheme)) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ✅ Fix: Now `_theme` is actually used
  const toggleTheme = (newTheme: string) => {
    if (Object.values(themes).includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook
export const useTheme = () => useContext(ThemeContext);
