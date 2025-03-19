// political-app/src/hooks/useTheme.ts
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export function useTheme() {
  // Use the centralized ThemeContext instead of maintaining separate state
  const { theme, setTheme } = useContext(ThemeContext);
  
  return { 
    theme, 
    setTheme 
  };
}