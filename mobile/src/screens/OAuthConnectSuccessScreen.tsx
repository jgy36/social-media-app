// src/screens/OAuthConnectSuccessScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const OAuthConnectSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { provider } = route.params as { provider?: string };

  useEffect(() => {
    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    // Navigate back to settings
    navigation.navigate('Settings' as never);
  };

  return (
    <View className="flex-1 bg-gray-50 items-center justify-center p-8">
      <View className="bg-white rounded-lg p-8 max-w-sm w-full shadow-md items-center">
        <MaterialIcons name="check-circle" size={64} color="#10B981" />
        
        <Text className="text-2xl font-bold text-gray-900 mt-4 text-center">
          Account Connected!
        </Text>
        
        <Text className="text-gray-600 text-center mt-2 mb-6">
          Your {provider || 'account'} has been connected successfully.
        </Text>
        
        <TouchableOpacity
          onPress={handleClose}
          className="bg-blue-500 px-6 py-3 rounded-lg w-full"
        >
          <Text className="text-white font-medium text-center">Close</Text>
        </TouchableOpacity>

        <Text className="text-xs text-gray-500 text-center mt-4">
          You will be redirected to settings in a few seconds...
        </Text>
      </View>
    </View>
  );
};

export default OAuthConnectSuccessScreen;