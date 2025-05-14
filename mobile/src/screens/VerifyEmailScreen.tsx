// src/screens/VerifyEmailScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const VerifyEmailScreen = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-background items-center justify-center p-6">
      <View className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-sm shadow-lg">
        <View className="items-center">
          <MaterialIcons name="email" size={64} color="#3B82F6" />
          
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-4 text-center">
            Verify Your Email
          </Text>
          
          <Text className="text-gray-600 dark:text-gray-400 text-center mt-4 mb-6">
            We've sent a verification link to your email address. Please check your
            inbox and click the link to verify your account.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login' as never)}
            className="bg-blue-500 px-6 py-3 rounded-lg w-full mb-4"
          >
            <Text className="text-white font-medium text-center">
              Go to Login
            </Text>
          </TouchableOpacity>

          <Text className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Didn't receive the email? Check your spam folder or contact support.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default VerifyEmailScreen;