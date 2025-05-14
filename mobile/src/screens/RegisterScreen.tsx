// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { registerUser } from '@/redux/slices/userSlice';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.username || !formData.email || !formData.password || !formData.displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
 
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Use Redux action like the web version
      await dispatch(registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
      })).unwrap();

      Alert.alert('Success', 'Account created successfully!');
      // Navigate to main app screen after successful registration
      (navigation as any).navigate('Feed');
    } catch (error) {
      Alert.alert('Registration Failed', error as string || 'An error occurred during registration');
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
          placeholder="Display Name"
          value={formData.displayName}
          onChangeText={(text) => setFormData({...formData, displayName: text})}
          autoCapitalize="words"
        />
        
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
          onPress={() => (navigation as any).navigate('Login')}
        >
          <Text className="text-blue-600">Already have an account? Sign In</Text>
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

export default RegisterScreen;