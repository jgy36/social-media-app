// components/ui/dialog.tsx
import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DialogCloseProps {
  children?: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

const Dialog: React.FC<DialogProps> = ({ children }) => {
  return <>{children}</>;
};

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children }) => {
  return <>{children}</>;
};

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {}}
    >
      <View className="flex-1 bg-black/80 items-center justify-center p-4">
        <View 
          className={cn(
            "bg-white rounded-lg p-6 w-full max-w-lg shadow-lg",
            className
          )}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
};

const DialogClose: React.FC<DialogCloseProps> = ({ children, onPress, className }) => {
  if (children) {
    return <>{children}</>;
  }
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn("absolute right-4 top-4 rounded-sm", className)}
    >
      <Ionicons name="close" size={16} color="#6b7280" />
    </TouchableOpacity>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className }) => (
  <View className={cn("flex flex-col space-y-1.5", className)}>
    {children}
  </View>
);

const DialogFooter: React.FC<DialogFooterProps> = ({ children, className }) => (
  <View className={cn("flex flex-row justify-end space-x-2 mt-6", className)}>
    {children}
  </View>
);

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => (
  <Text className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
    {children}
  </Text>
);

const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className }) => (
  <Text className={cn("text-sm text-gray-600", className)}>
    {children}
  </Text>
);

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};