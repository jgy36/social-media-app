// src/screens/LandingScreen.tsx
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView } from "react-native";
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
      (navigation as any).navigate('MainTabs');
    }
  }, [user.token, navigation]);

  // Google OAuth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      console.log('Google login successful', response);
      // Handle Google login logic here
    }
  }, [response]);

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" backgroundColor="#f3f4f6" />
      
      <View className="flex-1 px-6 justify-center">
        {/* Logo Section */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 bg-blue-600 rounded-full items-center justify-center mb-6 shadow-lg">
            <MaterialIcons name="how-to-vote" size={48} color="white" />
          </View>
          
          <Text className="text-4xl font-bold text-gray-800 text-center mb-2">
            Join Today
          </Text>
          <Text className="text-lg text-gray-600 text-center leading-relaxed">
            Connect with your political community
          </Text>
        </View>

        {/* Buttons Section */}
        <View className="space-y-4">
          {/* Google Sign Up Button */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={!request}
            className="w-full flex-row items-center justify-center bg-white border border-gray-300 px-6 py-4 rounded-lg shadow-sm active:bg-gray-50"
          >
            <View className="w-5 h-5 bg-red-500 rounded-full mr-3 items-center justify-center">
              <Text className="text-white text-xs font-bold">G</Text>
            </View>
            <Text className="text-gray-800 font-semibold text-base">
              Sign Up with Google
            </Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Register')}
            className="w-full bg-blue-600 px-6 py-4 rounded-lg items-center shadow-sm active:bg-blue-700"
          >
            <Text className="text-white font-semibold text-base">
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Login')}
            className="w-full bg-gray-600 px-6 py-4 rounded-lg items-center shadow-sm active:bg-gray-700"
          >
            <Text className="text-white font-semibold text-base">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms and Privacy */}
        <Text className="text-xs text-gray-500 text-center mt-8 px-4 leading-relaxed">
          By signing up, you agree to our{' '}
          <Text className="text-blue-600">Terms of Service</Text>
          {' '}and{' '}
          <Text className="text-blue-600">Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default LandingScreen;