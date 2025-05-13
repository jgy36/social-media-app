// components/ui/command.tsx
import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";

interface CommandProps {
  children: React.ReactNode;
  className?: string;
}

interface CommandDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CommandInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  className?: string;
}

interface CommandListProps {
  children: React.ReactNode;
  className?: string;
}

interface CommandEmptyProps {
  children: React.ReactNode;
}

interface CommandGroupProps {
  children: React.ReactNode;
  className?: string;
}

interface CommandItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

interface CommandSeparatorProps {
  className?: string;
}

interface CommandShortcutProps {
  children: React.ReactNode;
  className?: string;
}

const Command: React.FC<CommandProps> = ({ children, className }) => (
  <View className={cn("flex flex-col bg-white rounded-md", className)}>
    {children}
  </View>
);

const CommandDialog: React.FC<CommandDialogProps> = ({ children, open, onOpenChange }) => (
  <Modal
    visible={open}
    animationType="fade"
    transparent={true}
    onRequestClose={() => onOpenChange?.(false)}
  >
    <View className="flex-1 bg-black/80 items-center justify-center p-4">
      <View className="bg-white rounded-lg w-full max-w-md max-h-96">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500">
          {children}
        </Command>
      </View>
    </View>
  </Modal>
);

const CommandInput: React.FC<CommandInputProps> = ({ placeholder, value, onChangeText, className }) => (
  <View className="flex-row items-center border-b border-gray-200 px-3">
    <Ionicons name="search" size={16} color="#6b7280" className="mr-2" />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      className={cn("flex-1 h-11 bg-transparent text-sm outline-none", className)}
      placeholderTextColor="#9ca3af"
    />
  </View>
);

const CommandList: React.FC<CommandListProps> = ({ children, className }) => (
  <ScrollView 
    className={cn("max-h-64", className)}
    showsVerticalScrollIndicator={false}
  >
    {children}
  </ScrollView>
);

const CommandEmpty: React.FC<CommandEmptyProps> = ({ children }) => (
  <View className="py-6 text-center">
    <Text className="text-sm text-gray-500">{children}</Text>
  </View>
);

const CommandGroup: React.FC<CommandGroupProps> = ({ children, className }) => (
  <View className={cn("overflow-hidden p-1", className)}>
    {children}
  </View>
);

const CommandSeparator: React.FC<CommandSeparatorProps> = ({ className }) => (
  <View className={cn("h-px bg-gray-200 -mx-1", className)} />
);

const CommandItem: React.FC<CommandItemProps> = ({ children, onPress, className }) => (
  <TouchableOpacity
    onPress={onPress}
    className={cn(
      "relative flex flex-row items-center gap-2 rounded-sm px-2 py-1.5 text-sm active:bg-gray-100",
      className
    )}
  >
    {children}
  </TouchableOpacity>
);

const CommandShortcut: React.FC<CommandShortcutProps> = ({ children, className }) => (
  <Text className={cn("ml-auto text-xs tracking-widest text-gray-500", className)}>
    {children}
  </Text>
);

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};