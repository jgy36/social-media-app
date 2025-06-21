// components/ui/dropdown-menu.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "center" | "start" | "end";
  sideOffset?: number;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuShortcutProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuGroupProps {
  children: React.ReactNode;
}

interface DropdownMenuCheckboxItemProps {
  children: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

interface DropdownMenuRadioItemProps {
  children: React.ReactNode;
  value: string;
  onSelect?: () => void;
  className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return <>{children}</>;
};

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ children }) => {
  return <>{children}</>;
};

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  children, 
  className 
}) => (
  <Modal
    visible={true}
    transparent={true}
    animationType="fade"
    onRequestClose={() => {}}
  >
    <TouchableOpacity 
      className="flex-1 bg-black/50"
      activeOpacity={1}
      onPress={() => {}}
    >
      <View className="flex-1 items-center justify-center p-4">
        <View className={cn(
          "bg-white rounded-md border border-gray-200 p-1 min-w-32 shadow-lg",
          className
        )}>
          {children}
        </View>
      </View>
    </TouchableOpacity>
  </Modal>
);

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  children, 
  onPress, 
  disabled,
  className 
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={cn(
      "relative flex flex-row items-center gap-2 rounded-sm px-2 py-1.5 text-sm active:bg-gray-100",
      disabled && "opacity-50",
      className
    )}
  >
    {children}
  </TouchableOpacity>
);

const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({ className }) => (
  <View className={cn("-mx-1 my-1 h-px bg-gray-200", className)} />
);

const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({ children, className }) => (
  <View className={cn("px-2 py-1.5", className)}>
    <Text className="text-sm font-semibold text-gray-900">{children}</Text>
  </View>
);

const DropdownMenuShortcut: React.FC<DropdownMenuShortcutProps> = ({ children, className }) => (
  <Text className={cn("ml-auto text-xs tracking-widest text-gray-500", className)}>
    {children}
  </Text>
);

const DropdownMenuGroup: React.FC<DropdownMenuGroupProps> = ({ children }) => (
  <View>{children}</View>
);

const DropdownMenuCheckboxItem: React.FC<DropdownMenuCheckboxItemProps> = ({ 
  children, 
  checked, 
  onCheckedChange,
  className 
}) => (
  <TouchableOpacity
    onPress={() => onCheckedChange?.(!checked)}
    className={cn(
      "relative flex flex-row items-center rounded-sm py-1.5 pl-8 pr-2 text-sm active:bg-gray-100",
      className
    )}
  >
    <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked && <Ionicons name="checkmark" size={16} color="#3b82f6" />}
    </View>
    {children}
  </TouchableOpacity>
);

const DropdownMenuRadioItem: React.FC<DropdownMenuRadioItemProps> = ({ 
  children, 
  value,
  onSelect,
  className 
}) => (
  <TouchableOpacity
    onPress={onSelect}
    className={cn(
      "relative flex flex-row items-center rounded-sm py-1.5 pl-8 pr-2 text-sm active:bg-gray-100",
      className
    )}
  >
    <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <View className="h-2 w-2 rounded-full bg-blue-500" />
    </View>
    {children}
  </TouchableOpacity>
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
};