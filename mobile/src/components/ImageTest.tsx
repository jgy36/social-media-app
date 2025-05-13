// components/ImageTest.tsx - Use this to verify image loading
import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';

const BACKEND_URL = "http://localhost:8080";

const ImageTest = () => {
  const imagePath = "/images/tulsi_gabbard.jpg";
  const fullUrl = `${BACKEND_URL}${imagePath}`;
  
  const handleImageTest = async () => {
    try {
      const response = await fetch(fullUrl);
      const contentType = response.headers.get('content-type');
      console.log(`Response status: ${response.status}`);
      console.log(`Content-Type: ${contentType}`);
      console.log(`Response OK: ${response.ok}`);
      
      if (response.ok) {
        Alert.alert('Success', `✅ Image accessible! Content-Type: ${contentType}`);
      } else {
        Alert.alert('Error', `❌ Image not accessible. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      Alert.alert('Error', `❌ Error fetching image: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <View className="p-6 border rounded-lg">
      <Text className="text-xl font-bold mb-4">Image Loading Test</Text>
      
      <View className="mb-6">
        <Text className="font-bold">Backend Image</Text>
        <Text className="mb-2">Image URL: {fullUrl}</Text>
        <Image 
          source={{ uri: fullUrl }}
          className="h-24 w-24 rounded-full border"
          onError={() => {
            console.error(`Failed to load image from ${fullUrl}`);
          }}
        />
      </View>
      
      <View className="mb-6">
        <Text className="font-bold">Direct Fetch Test</Text>
        <TouchableOpacity 
          className="px-4 py-2 bg-blue-500 rounded"
          onPress={handleImageTest}
        >
          <Text className="text-white">Test Image URL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ImageTest;