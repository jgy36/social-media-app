// components/ui/separator.tsx
import React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";

interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

const Separator: React.FC<SeparatorProps> = ({ 
  className, 
  orientation = "horizontal", 
  decorative = true 
}) => (
  <View
    className={cn(
      "shrink-0 bg-gray-200",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    )}
  />
);

export { Separator };