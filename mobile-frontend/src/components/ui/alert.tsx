// components/ui/alert.tsx
import React from "react";
import { View, Text } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200",
        destructive: "bg-red-50 border-red-200 text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps extends VariantProps<typeof alertVariants> {
  children: React.ReactNode;
  className?: string;
}

interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ children, variant, className }) => (
  <View className={cn(alertVariants({ variant }), className)}>
    {children}
  </View>
);

const AlertTitle: React.FC<AlertTitleProps> = ({ children, className }) => (
  <Text className={cn("mb-1 font-medium leading-none tracking-tight", className)}>
    {children}
  </Text>
);

const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className }) => (
  <Text className={cn("text-sm", className)}>
    {children}
  </Text>
);

export { Alert, AlertTitle, AlertDescription };