// src/screens/DebugScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigation } from '@react-navigation/native';

const DebugScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Debug Information
        </Text>
        
        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            User State:
          </Text>
          <View className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
            <Text className="text-sm text-gray-700 dark:text-gray-300 font-mono">
              {JSON.stringify(user, null, 2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-blue-500 p-3 rounded-lg items-center"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default DebugScreen;