// components/ui/toaster.tsx
import React from "react";
import { View } from "react-native";
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      <View className="absolute top-16 right-4 z-50 max-w-sm">
        {toasts.map(function ({ id, title, description, variant, ...props }) {
          return (
            <Toast 
              key={id} 
              {...props} 
              // Map "success" variant to "default" since Toast doesn't support "success"
              variant={variant === "success" ? "default" : variant}
              className="mb-2"
            >
              <View className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </View>
              <ToastClose />
            </Toast>
          );
        })}
      </View>
      <ToastViewport />
    </ToastProvider>
  );
}