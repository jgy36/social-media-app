import { MaterialIcons } from '@expo/vector-icons';
// src/components/profile/MessageButton.tsx
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getOrCreateConversation } from '@/api/messages';

// Define the navigation structure
type RootStackParamList = {
  Messages: {
    screen: 'Chat';
    params: {
      username?: string;
      userId?: number;
      conversationId?: number;
    };
  };
};

interface MessageButtonProps {
  username: string;
  userId?: number;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
}

const MessageButton = ({
  username,
  userId,
  variant = 'outline',
  size = 'default',
  showIcon = true,
  className = '',
  ...props
}: MessageButtonProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const currentUser = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);

  // Prevent messaging yourself
  const isSelf = currentUser.username === username || currentUser.id === userId;

  const handlePress = async () => {
    if (isSelf) return;
    
    setLoading(true);
    
    try {
      // Make sure we have the userId before proceeding
      if (!userId) {
        // If somehow we don't have the userId, fall back to username-based route
        navigation.navigate('Messages', { screen: 'Chat', params: { username } });
        return;
      }
      
      // Try to get or create a conversation first
      try {
        const { conversationId } = await getOrCreateConversation(userId);
        
        // If successful, redirect directly to the conversation
        navigation.navigate('Messages', { 
          screen: 'Chat', 
          params: { conversationId } 
        });
        return;
      } catch (convError) {
        console.error("Error getting/creating conversation:", convError);
        // If that fails, just go to the direct message page
        navigation.navigate('Messages', { 
          screen: 'Chat', 
          params: { userId } 
        });
      }
    } catch (error) {
      console.error("Error in message button:", error);
      // Fall back to user ID based route if any other error occurs
      navigation.navigate('Messages', { 
        screen: 'Chat', 
        params: { userId } 
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSelf) {
    return null; // Don't show message button for own profile
  }

  // Define style variants
  const variantStyles = {
    default: 'bg-blue-500',
    outline: 'border border-gray-300 dark:border-gray-600',
    secondary: 'bg-gray-100 dark:bg-gray-800',
    ghost: '',
  };

  const textStyles = {
    default: 'text-white',
    outline: 'text-gray-700 dark:text-gray-300',
    secondary: 'text-gray-700 dark:text-gray-300',
    ghost: 'text-blue-500',
  };

  const sizeStyles = {
    icon: 'p-2',
    sm: 'px-3 py-2',
    default: 'px-4 py-2',
    lg: 'px-6 py-3',
  };

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading || isSelf}
      className={`${variantStyles[variant]} ${sizeStyles[size]} rounded-lg flex-row items-center justify-center ${
        loading || isSelf ? 'opacity-50' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <View className="flex-row items-center">
          <View className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
          <Text className={textStyles[variant]}>Loading...</Text>
        </View>
      ) : (
        <View className="flex-row items-center">
          {showIcon && (
            <MaterialIcons 
              name="chat" 
              size={iconSize} 
              color={variant === 'default' ? '#ffffff' : variant === 'ghost' ? '#3b82f6' : '#374151'} 
              style={showIcon && size !== 'icon' ? { marginRight: 8 } : {}} 
            />
          )}
          {size !== 'icon' && (
            <Text className={`${textStyles[variant]} font-medium`}>
              Message
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
};

export default MessageButton;