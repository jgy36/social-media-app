// components/ui/tabs.tsx
import React, { createContext, useContext, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { cn } from "@/lib/utils";

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ children, value, onValueChange, defaultValue, className }) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const currentValue = value !== undefined ? value : internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <View className={className}>
        {children}
      </View>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<TabsListProps> = ({ children, className }) => (
  <View 
    className={cn(
      "flex-row h-10 items-center justify-center rounded-md bg-gray-100 p-1",
      className
    )}
  >
    {children}
  </View>
);

const TabsTrigger: React.FC<TabsTriggerProps> = ({ children, value, disabled, className }) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }

  const { value: currentValue, onValueChange } = context;
  const isActive = currentValue === value;

  return (
    <TouchableOpacity
      onPress={() => onValueChange(value)}
      disabled={disabled}
      className={cn(
        "flex-1 items-center justify-center rounded-sm px-3 py-1.5",
        isActive && "bg-white shadow-sm",
        disabled && "opacity-50",
        className
      )}
    >
      <Text
        className={cn(
          "text-sm font-medium",
          isActive ? "text-gray-900" : "text-gray-600"
        )}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const TabsContent: React.FC<TabsContentProps> = ({ children, value, className }) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component");
  }

  const { value: currentValue } = context;

  if (currentValue !== value) {
    return null;
  }

  return (
    <View className={cn("mt-2", className)}>
      {children}
    </View>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };