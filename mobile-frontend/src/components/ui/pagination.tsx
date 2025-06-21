// components/ui/pagination.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface PaginationProps {
  children: React.ReactNode;
  className?: string;
}

interface PaginationContentProps {
  children: React.ReactNode;
  className?: string;
}

interface PaginationItemProps {
  children: React.ReactNode;
  className?: string;
}

interface PaginationLinkProps {
  children: React.ReactNode;
  onPress?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
}

interface PaginationPreviousProps {
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

interface PaginationNextProps {
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
}

interface PaginationEllipsisProps {
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ children, className }) => (
  <View className={cn("flex w-full justify-center", className)}>
    {children}
  </View>
);

const PaginationContent: React.FC<PaginationContentProps> = ({ children, className }) => (
  <View className={cn("flex flex-row items-center gap-1", className)}>
    {children}
  </View>
);

const PaginationItem: React.FC<PaginationItemProps> = ({ children, className }) => (
  <View className={className}>
    {children}
  </View>
);

const PaginationLink: React.FC<PaginationLinkProps> = ({ 
  children, 
  onPress, 
  isActive, 
  disabled,
  className 
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={cn(
      "h-10 px-4 py-2 rounded-md items-center justify-center",
      isActive 
        ? "bg-blue-500 text-white" 
        : "bg-transparent text-gray-700 hover:bg-gray-100",
      disabled && "opacity-50",
      className
    )}
  >
    {typeof children === 'string' ? (
      <Text className={isActive ? "text-white" : "text-gray-700"}>{children}</Text>
    ) : (
      children
    )}
  </TouchableOpacity>
);

const PaginationPrevious: React.FC<PaginationPreviousProps> = ({ 
  onPress, 
  disabled,
  className 
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={cn(
      "gap-1 pl-2.5 h-10 px-4 py-2 rounded-md items-center justify-center flex-row",
      disabled && "opacity-50",
      className
    )}
  >
    <Ionicons name="chevron-back" size={16} color="#374151" />
    <Text>Previous</Text>
  </TouchableOpacity>
);

const PaginationNext: React.FC<PaginationNextProps> = ({ 
  onPress, 
  disabled,
  className 
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={cn(
      "gap-1 pr-2.5 h-10 px-4 py-2 rounded-md items-center justify-center flex-row",
      disabled && "opacity-50",
      className
    )}
  >
    <Text>Next</Text>
    <Ionicons name="chevron-forward" size={16} color="#374151" />
  </TouchableOpacity>
);

const PaginationEllipsis: React.FC<PaginationEllipsisProps> = ({ className }) => (
  <View className={cn("flex h-9 w-9 items-center justify-center", className)}>
    <Ionicons name="ellipsis-horizontal" size={16} color="#6b7280" />
    <Text className="sr-only">More pages</Text>
  </View>
);

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};