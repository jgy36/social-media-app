// components/ui/scroll-area.tsx
import React from "react";
import { ScrollView, View } from "react-native";
import { cn } from "@/lib/utils";

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  horizontal?: boolean;
  showsScrollIndicator?: boolean;
}

interface ScrollBarProps {
  orientation?: "vertical" | "horizontal";
  className?: string;
}

const ScrollArea: React.FC<ScrollAreaProps> = ({ 
  children, 
  className,
  horizontal = false,
  showsScrollIndicator = true
}) => (
  <ScrollView
    className={cn("relative", className)}
    horizontal={horizontal}
    showsVerticalScrollIndicator={showsScrollIndicator && !horizontal}
    showsHorizontalScrollIndicator={showsScrollIndicator && horizontal}
  >
    {children}
  </ScrollView>
);

const ScrollBar: React.FC<ScrollBarProps> = ({ orientation = "vertical", className }) => (
  // ScrollBar is handled automatically in React Native ScrollView
  <View className={cn("hidden", className)} />
);

export { ScrollArea, ScrollBar };