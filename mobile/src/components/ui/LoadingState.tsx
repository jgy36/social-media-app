// components/ui/LoadingState.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  size = 'large',
  className = ''
}) => {
  return (
    <View className={`flex-1 justify-center items-center p-6 ${className}`}>
      <ActivityIndicator 
        size={size} 
        color="#3b82f6" // Primary blue color - you can adjust this
        className="mb-4"
      />
      <Text className="text-foreground text-center text-base opacity-70">
        {message}
      </Text>
    </View>
  );
};

// Also export as default for backwards compatibility
export default LoadingState;