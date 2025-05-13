// components/ui/label.tsx
import React from "react";
import { Text } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none"
);

interface LabelProps extends VariantProps<typeof labelVariants> {
  children: React.ReactNode;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ children, className }) => (
  <Text className={cn(labelVariants(), className)}>
    {children}
  </Text>
);

export { Label };