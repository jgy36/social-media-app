// components/ui/ErrorState.tsx
import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message, 
  onRetry 
}) => (
  <View className="bg-red-50 border border-red-200 p-4 rounded-md">
    <View className="flex-row items-start">
      <Ionicons name="alert-circle" size={20} color="#dc2626" className="mr-2 mt-0.5" />
      <View className="flex-1">
        <Text className="text-red-700">{message}</Text>
        {onRetry && (
          <Button onPress={onRetry} variant="outline" size="sm" className="mt-2">
            Try Again
          </Button>
        )}
      </View>
    </View>
  </View>
);