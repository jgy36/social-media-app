// components/ui/select.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  position?: "item-aligned" | "popper";
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

interface SelectLabelProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectSeparatorProps {
  className?: string;
}

interface SelectGroupProps {
  children: React.ReactNode;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

const Select: React.FC<SelectProps> = ({ children, value, onValueChange, disabled }) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <View>{children}</View>
    </SelectContext.Provider>
  );
};

const SelectGroup: React.FC<SelectGroupProps> = ({ children }) => (
  <View>{children}</View>
);

const SelectValue: React.FC<SelectValueProps> = ({ placeholder, children }) => (
  <Text className="text-gray-900">{children || placeholder}</Text>
);

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className }) => {
  const { open, setOpen } = React.useContext(SelectContext);

  return (
    <TouchableOpacity
      onPress={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2",
        className
      )}
    >
      {children}
      <Ionicons name="chevron-down" size={16} color="#6b7280" />
    </TouchableOpacity>
  );
};

const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  const { open, setOpen } = React.useContext(SelectContext);

  if (!open) return null;

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/10"
        activeOpacity={1}
        onPress={() => setOpen(false)}
      >
        <View className="flex-1 items-center justify-center p-4">
          <View className={cn(
            "bg-white rounded-md border border-gray-200 shadow-lg min-w-32 max-h-96",
            className
          )}>
            <FlatList
              data={React.Children.toArray(children)}
              renderItem={({ item }) => <>{item}</>}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const SelectLabel: React.FC<SelectLabelProps> = ({ children, className }) => (
  <View className={cn("py-1.5 pl-8 pr-2", className)}>
    <Text className="text-sm font-semibold text-gray-900">{children}</Text>
  </View>
);

const SelectItem: React.FC<SelectItemProps> = ({ children, value, disabled, className }) => {
  const { value: selectedValue, onValueChange, setOpen } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <TouchableOpacity
      onPress={() => {
        onValueChange?.(value);
        setOpen(false);
      }}
      disabled={disabled}
      className={cn(
        "relative flex w-full items-center rounded-sm py-1.5 pl-8 pr-2 active:bg-gray-100",
        disabled && "opacity-50",
        className
      )}
    >
      <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Ionicons name="checkmark" size={16} color="#3b82f6" />}
      </View>
      {typeof children === 'string' ? (
        <Text className="text-gray-900">{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const SelectSeparator: React.FC<SelectSeparatorProps> = ({ className }) => (
  <View className={cn("-mx-1 my-1 h-px bg-gray-200", className)} />
);

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};