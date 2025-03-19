import { createContext, useEffect, useState } from "react";

// Define available themes
export type ThemeType = "light" | "dark";

// Define Theme Context Type
interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

// Create Context with default values
export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {}, // Default function (empty)
});

// Theme Provider Component
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize state from localStorage if available, otherwise default to light
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as ThemeType;
      return savedTheme === "dark" ? "dark" : "light";
    }
    return "light";
  });

  // Apply theme changes to document and localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Update localStorage
    localStorage.setItem("theme", theme);
    
    // Update document class
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};