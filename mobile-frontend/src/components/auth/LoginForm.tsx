// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';;
import { useDispatch } from 'react-redux';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLogin } from '@/hooks/useApi';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [isTwoFARequired, setIsTwoFARequired] = useState(false);
  const [tempToken, setTempToken] = useState('');
  
  const { loading, error, execute: login } = useLogin();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      const result = await login({ email, password });
      
      if (result?.requires2FA) {
        setTempToken(result.tempToken || '');
        setIsTwoFARequired(true);
        return;
      }

      if (result?.token) {
        navigation.navigate('feed');
      }
    } catch (err) {
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  if (isTwoFARequired) {
    return (
      <View className="space-y-4 p-4">
        <Text className="text-lg font-medium">Two-Factor Authentication</Text>
        
        <View className="space-y-2">
          <Text className="text-sm font-medium">Verification Code</Text>
          <Input
            value={twoFACode}
            onChangeText={setTwoFACode}
            placeholder="Enter your 6-digit code"
            keyboardType="numeric"
            maxLength={6}
          />
        </View>
        
        <Button onPress={() => {}} disabled={loading}>
          <Text>{loading ? 'Verifying...' : 'Verify'}</Text>
        </Button>
        
        <Button variant="outline" onPress={() => setIsTwoFARequired(false)}>
          <Text>Back to login</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="space-y-4 p-4">
      {error && (
        <View className="bg-red-100 p-3 rounded-md">
          <Text className="text-red-800 text-sm">{error.message}</Text>
        </View>
      )}
      
      <View className="space-y-2">
        <Text className="text-sm font-medium">Email</Text>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View className="space-y-2">
        <Text className="text-sm font-medium">Password</Text>
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />
      </View>
      
      <Button onPress={handleSubmit} disabled={loading}>
        <Text>{loading ? 'Logging in...' : 'Login'}</Text>
      </Button>
      
      <Button variant="outline" onPress={() => navigation.navigate('register')}>
        <Text>Don't have an account? Register here</Text>
      </Button>
    </View>
  );
};

export default LoginForm;
