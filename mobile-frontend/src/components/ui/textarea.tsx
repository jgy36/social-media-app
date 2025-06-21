// components/ui/textarea.tsx
import React from "react";
import { TextInput } from "react-native";
import { cn } from "@/lib/utils";

interface TextareaProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  maxLength?: number;
  style?: any;
}

const Textarea: React.FC<TextareaProps> = ({ 
  className, 
  multiline = true,
  numberOfLines = 4,
  ...props 
}) => {
  return (
    <TextInput
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      className={cn(
        "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "disabled:opacity-50 min-h-20",
        className
      )}
      {...props}
    />
  );
};

export { Textarea };