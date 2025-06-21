// src/components/auth/RegisterForm.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';;
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRegister } from '@/hooks/useApi';
import { validateUsername } from '@/utils/usernameUtils';
import debounce from 'lodash/debounce';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
  const { loading, error, execute: register } = useRegister();
  const navigation = useNavigation();

  const debouncedCheckUsername = debounce(async (username: string) => {
    // Username checking logic
  }, 500);

  useEffect(() => {
    if (username.trim().length >= 3) {
      debouncedCheckUsername(username);
    }
  }, [username]);

  const handleSubmit = async () => {
    // Validation logic
    if (!displayName.trim()) {
      setDisplayNameError('Please enter your name');
      return;
    }

    try {
      const result = await register({ username, email, password, displayName });
      
      if (result?.success) {
        Alert.alert('Success', 'Please check your email to verify your account.');
        navigation.navigate('verify-email');
      }
    } catch (err) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  return (
    <View className="space-y-4 p-4">
      {/* Display Name Field */}
      <View className="space-y-2">
        <Text className="text-sm font-medium">Full Name</Text>
        <Input
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your full name"
          error={!!displayNameError}
        />
        {displayNameError && (
          <Text className="text-sm text-red-500">{displayNameError}</Text>
        )}
      </View>
      
      {/* Username Field */}
      <View className="space-y-2">
        <Text className="text-sm font-medium">Username</Text>
        <Input
          value={username}
          onChangeText={setUsername}
          placeholder="Choose a unique username"
          error={!!usernameError}
        />
        {usernameError && (
          <Text className="text-sm text-red-500">{usernameError}</Text>
        )}
        {usernameAvailable === true && (
          <Text className="text-sm text-green-500">Username is available</Text>
        )}
      </View>
      
      {/* Email Field */}
      <View className="space-y-2">
        <Text className="text-sm font-medium">Email</Text>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={!!emailError}
        />
        {emailError && (
          <Text className="text-sm text-red-500">{emailError}</Text>
        )}
      </View>
      
      {/* Password Field */}
      <View className="space-y-2">
        <Text className="text-sm font-medium">Password</Text>
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Password (min 8 characters)"
          secureTextEntry
          error={!!passwordError}
        />
        {passwordError && (
          <Text className="text-sm text-red-500">{passwordError}</Text>
        )}
      </View>
      
      <Button 
        onPress={handleSubmit} 
        disabled={loading || checkingUsername || usernameAvailable === false}
      >
        <Text>{loading ? 'Registering...' : 'Register'}</Text>
      </Button>
      
      <TouchableOpacity onPress={() => navigation.navigate('login')}>
        <Text className="text-center text-blue-600">
          Already have an account? Login here
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterForm;
