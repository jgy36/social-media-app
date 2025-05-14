// src/screens/LandingScreen.tsx
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const LandingScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  // Redirect if already logged in
  useEffect(() => {
    if (user.token) {
      navigation.navigate('Feed');
    }
  }, [user.token, navigation]);

  // Google OAuth setup (you'll need to configure this)
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      // Handle Google login response
      console.log('Google login successful', response);
      // You'll need to implement the Google login logic here
    }
  }, [response]);

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  return (
    <View className="flex-1 bg-gray-100 items-center justify-center px-6">
      {/* App Logo or Header */}
      <View className="items-center mb-8">
        <Image
          source={require('@/assets/images/logo.png')} // You'll need to add your logo
          className="w-24 h-24 mb-4"
          resizeMode="contain"
        />
        <Text className="text-4xl font-bold text-gray-800 text-center">
          Join Today
        </Text>
        <Text className="text-lg text-gray-600 text-center mt-2">
          Connect with your political community
        </Text>
      </View>

      {/* Sign Up Options */}
      <View className="w-full max-w-sm space-y-4">
        {/* Google Sign Up */}
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          className="w-full flex-row items-center justify-center bg-white border border-gray-300 px-4 py-3 rounded-lg shadow-sm"
          disabled={!request}
        >
          <MaterialIcons name="google" size={20} color="#DB4437" />
          <Text className="ml-3 text-gray-800 font-medium">
            Sign Up with Google
          </Text>
        </TouchableOpacity>

        {/* Create Account */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          className="w-full bg-blue-600 px-4 py-3 rounded-lg items-center"
        >
          <Text className="text-white font-medium text-lg">
            Create Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign In */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        className="mt-6 w-full max-w-sm bg-gray-600 px-4 py-3 rounded-lg items-center"
      >
        <Text className="text-white font-medium text-lg">
          Sign In
        </Text>
      </TouchableOpacity>

      {/* Terms and Privacy */}
      <Text className="text-xs text-gray-500 text-center mt-8 px-4">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
};

export default LandingScreen;