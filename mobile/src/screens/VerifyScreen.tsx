// src/screens/VerifyScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiClient } from '@/api/apiClient';

interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

const VerifyScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const response = await apiClient.get<VerifyEmailResponse>(`/auth/verify?token=${token}`);
      
      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigation.navigate('Login' as never);
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage('An error occurred while verifying your email. Please try again.');
    }
  }, [navigation]);

  useEffect(() => {
    const { token } = route.params as { token?: string };
    
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [route.params, verifyEmail]);

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return <ActivityIndicator size={64} color="#3B82F6" />;
      case 'success':
        return <MaterialIcons name="check-circle" size={64} color="#10B981" />;
      case 'error':
        return <MaterialIcons name="error" size={64} color="#EF4444" />;
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
              Verifying your email...
            </Text>
          </>
        );
      case 'success':
        return (
          <>
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">
              Email Verified!
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center">
              {message}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
              Redirecting to login...
            </Text>
          </>
        );
      case 'error':
        return (
          <>
            <Text className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">
              Verification Failed
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {message}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register' as never)}
              className="bg-blue-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">
                Back to Registration
              </Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <View className="flex-1 bg-background items-center justify-center p-6">
      <View className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-sm shadow-lg items-center">
        {renderIcon()}
        {renderContent()}
      </View>
    </View>
  );
};

export default VerifyScreen;