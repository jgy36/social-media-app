// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { loginUser } from '../redux/slices/userSlice';

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return; 
    }

    setIsLoading(true);
    try {
      // Use the loginUser thunk from redux, matching the web version
      const result = await dispatch(loginUser({ email, password })).unwrap();
      
      // Navigate to the main app screen after successful login
      // You might need to adjust the navigation based on your navigation stack
      (navigation as any).navigate('Feed');
    } catch (error) {
      Alert.alert('Login Failed', error as string || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-background p-6">
      <View className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <Text className="text-2xl font-bold text-center mb-6">Login</Text>
        
        <TextInput
          className="w-full h-12 px-4 mb-4 border border-gray-300 rounded-md"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          className="w-full h-12 px-4 mb-6 border border-gray-300 rounded-md"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          className={`w-full h-12 rounded-md items-center justify-center ${
            isLoading ? 'bg-gray-300' : 'bg-blue-600'
          }`}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text className="text-white font-medium">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="mt-4 items-center"
          onPress={() => (navigation as any).navigate('Register')}
        >
          <Text className="text-blue-600">Don't have an account? Register</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="mt-2 items-center"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-gray-600">Back to Landing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;