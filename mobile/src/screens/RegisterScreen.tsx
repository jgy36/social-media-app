// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { registerUser } from '../api/auth';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
 
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerUser(formData.username, formData.email, formData.password);
      if (result.success) {
        Alert.alert('Success', 'Account created successfully! Please verify your email.');
        navigation.navigate('Login' as never);
      } else {
        Alert.alert('Registration Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-background p-6">
      <View className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <Text className="text-2xl font-bold text-center mb-6">Register</Text>
        
        <TextInput
          className="w-full h-12 px-4 mb-4 border border-gray-300 rounded-md"
          placeholder="Username"
          value={formData.username}
          onChangeText={(text) => setFormData({...formData, username: text})}
          autoCapitalize="none"
        />
        
        <TextInput
          className="w-full h-12 px-4 mb-4 border border-gray-300 rounded-md"
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          className="w-full h-12 px-4 mb-4 border border-gray-300 rounded-md"
          placeholder="Password"
          value={formData.password}
          onChangeText={(text) => setFormData({...formData, password: text})}
          secureTextEntry
        />
        
        <TextInput
          className="w-full h-12 px-4 mb-6 border border-gray-300 rounded-md"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
          secureTextEntry
        />
        
        <TouchableOpacity
          className={`w-full h-12 rounded-md items-center justify-center ${
            isLoading ? 'bg-gray-300' : 'bg-blue-600'
          }`}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text className="text-white font-medium">
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="mt-4 items-center"
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text className="text-blue-600">Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;