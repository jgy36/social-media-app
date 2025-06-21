// components/ui/toast.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg",
  {
    variants: {
      variant: {
        default: "border bg-white text-gray-900",
        destructive: "border-red-500 bg-red-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastViewportProps {
  className?: string;
}

interface ToastProps extends VariantProps<typeof toastVariants> {
  children: React.ReactNode;
  className?: string;
}

interface ToastActionProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

interface ToastCloseProps {
  onPress?: () => void;
  className?: string;
}

interface ToastTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface ToastDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => (
  <>{children}</>
);

const ToastViewport: React.FC<ToastViewportProps> = ({ className }) => (
  <View 
    className={cn(
      "fixed top-16 z-50 flex max-h-screen w-full flex-col-reverse p-4 md:max-w-420px",
      className
    )}
  />
);

const Toast: React.FC<ToastProps> = ({ children, variant, className }) => {
  return (
    <View className={cn(toastVariants({ variant }), className)}>
      {children}
    </View>
  );
};

const ToastAction: React.FC<ToastActionProps> = ({ children, onPress, className }) => (
  <TouchableOpacity
    onPress={onPress}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium",
      className
    )}
  >
    {typeof children === 'string' ? (
      <Text className="text-gray-900">{children}</Text>
    ) : (
      children
    )}
  </TouchableOpacity>
);

const ToastClose: React.FC<ToastCloseProps> = ({ onPress, className }) => (
  <TouchableOpacity
    onPress={onPress}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:text-gray-900",
      className
    )}
  >
    <Ionicons name="close" size={16} />
  </TouchableOpacity>
);

const ToastTitle: React.FC<ToastTitleProps> = ({ children, className }) => (
  <Text className={cn("text-sm font-semibold", className)}>
    {children}
  </Text>
);

const ToastDescription: React.FC<ToastDescriptionProps> = ({ children, className }) => (
  <Text className={cn("text-sm opacity-90", className)}>
    {children}
  </Text>
);

type ToastRootProps = React.ComponentProps<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastRootProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};