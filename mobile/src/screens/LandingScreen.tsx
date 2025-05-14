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
      // You'll need to make sure 'Feed' exists in your navigation stack
      // If it doesn't, replace with the appropriate screen name
      (navigation as any).navigate('Feed');
    }
  }, [user.token, navigation]);

  // Google OAuth setup with proper configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      // Handle Google login response
      console.log('Google login successful', response);
      // You'll need to implement the Google login logic here
      // Example: sendGoogleTokenToBackend(response.authentication?.idToken);
    }
  }, [response]);

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  return (
    <View className="flex-1 bg-gray-100 items-center justify-center px-6">
      {/* App Logo or Header */}
      <View className="items-center mb-8">
        {/* Option 1: If you have a logo file */}
        {/* Uncomment this and comment out the placeholder below */}
        {/* <Image
          source={require('@/assets/images/logo.png')}
          className="w-24 h-24 mb-4"
          resizeMode="contain"
        /> */}
        
        {/* Option 2: Placeholder logo using MaterialIcons */}
        <View className="w-24 h-24 mb-4 bg-blue-600 rounded-full items-center justify-center">
          <MaterialIcons name="how-to-vote" size={48} color="white" />
        </View>
        
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
          {/* Using a custom Google-like icon since MaterialIcons doesn't have 'google' */}
          <View className="w-5 h-5 bg-red-500 rounded mr-3 items-center justify-center">
            <Text className="text-white text-xs font-bold">G</Text>
          </View>
          <Text className="text-gray-800 font-medium">
            Sign Up with Google
          </Text>
        </TouchableOpacity>

        {/* Create Account */}
        <TouchableOpacity
          onPress={() => {
            // Make sure 'Register' screen exists in your navigation stack
            // If it doesn't, replace with the appropriate screen name
            (navigation as any).navigate('Register');
          }}
          className="w-full bg-blue-600 px-4 py-3 rounded-lg items-center"
        >
          <Text className="text-white font-medium text-lg">
            Create Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign In */}
      <TouchableOpacity
        onPress={() => {
          // Make sure 'Login' screen exists in your navigation stack
          // If it doesn't, replace with the appropriate screen name
          (navigation as any).navigate('Login');
        }}
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