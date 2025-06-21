// components/ui/popover.tsx
import React from "react";
import { View, Modal, TouchableOpacity } from "react-native";
import { cn } from "@/lib/utils";

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "center" | "start" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

const Popover: React.FC<PopoverProps> = ({ children }) => {
  return <>{children}</>;
};

const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children }) => {
  return <>{children}</>;
};

const PopoverContent: React.FC<PopoverContentProps> = ({ 
  children, 
  className,
  align = "center",
  side = "bottom",
  sideOffset = 4 
}) => (
  <Modal
    visible={true}
    transparent={true}
    animationType="fade"
    onRequestClose={() => {}}
  >
    <TouchableOpacity 
      className="flex-1 bg-black/10"
      activeOpacity={1}
      onPress={() => {}}
    >
      <View className="flex-1 items-center justify-center p-4">
        <View className={cn(
          "bg-white rounded-md border border-gray-200 p-4 shadow-lg",
          "w-72",
          className
        )}>
          {children}
        </View>
      </View>
    </TouchableOpacity>
  </Modal>
);

export { Popover, PopoverTrigger, PopoverContent };