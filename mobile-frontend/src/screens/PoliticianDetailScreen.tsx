// src/screens/PoliticianDetailScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Linking, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { Politician } from "@/types/politician";
import { getPoliticianById } from "@/api/politicians";

const PoliticianDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };

  const [politician, setPolitician] = useState<Politician | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolitician = async () => {
      try {
        setIsLoading(true);
        const data = await getPoliticianById(id);
        setPolitician(data);
      } catch (err) {
        console.error("Error fetching politician:", err);
        setError("Failed to load politician details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPolitician();
    }
  }, [id]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleWebsitePress = (url: string) => {
    Linking.openURL(url);
  };

  const handleSocialPress = (platform: string, handle: string) => {
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/${handle}`;
        break;
      case 'facebook':
        url = `https://facebook.com/${handle}`;
        break;
      case 'instagram':
        url = `https://instagram.com/${handle}`;
        break;
    }
    if (url) {
      Linking.openURL(url);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">
          Loading politician details...
        </Text>
      </View>
    );
  }

  if (error || !politician) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color="gray" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Politician</Text>
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <MaterialIcons name="error-outline" size={64} color="#EF4444" />
          <Text className="text-red-500 text-center text-lg font-medium mt-4">
            {error || "Politician not found"}
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            className="mt-4 bg-blue-500 px-6 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 pt-12 pb-4 px-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color="gray" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {politician.name}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
          <View className="items-center">
            {/* Photo */}
            <View className="mb-4">
              {politician.photoUrl ? (
                <Image
                  source={{ uri: politician.photoUrl }}
                  className="w-32 h-32 rounded-full border-2 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <View className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
                  <MaterialIcons name="person" size={64} color="#6B7280" />
                </View>
              )}
            </View>

            {/* Name and Position */}
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center">
              {politician.name}
            </Text>
            <Text className="text-lg text-blue-600 dark:text-blue-400 text-center mt-1">
              {politician.position}
            </Text>

            {/* Party Badge */}
            {politician.party && (
              <View className="mt-3 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                <Text className="text-blue-800 dark:text-blue-200 font-medium">
                  {politician.party}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Details Section */}
        <View className="bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Details
          </Text>

          {/* State */}
          {politician.state && (
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="location-on" size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-700 dark:text-gray-300">
                <Text className="font-medium">State: </Text>
                {politician.state}
              </Text>
            </View>
          )}

          {/* County */}
          {politician.county && (
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="place" size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-700 dark:text-gray-300">
                <Text className="font-medium">County: </Text>
                {politician.county}
              </Text>
            </View>
          )}

          {/* Years Served */}
          {politician.yearsServed !== undefined && (
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="schedule" size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-700 dark:text-gray-300">
                <Text className="font-medium">Years Served: </Text>
                {politician.yearsServed}
              </Text>
            </View>
          )}

          {/* Age */}
          {politician.age && (
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="cake" size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-700 dark:text-gray-300">
                <Text className="font-medium">Age: </Text>
                {politician.age}
              </Text>
            </View>
          )}
        </View>

        {/* Contact Information */}
        <View className="bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Contact Information
          </Text>

          {/* Website */}
          {politician.website && (
            <TouchableOpacity
              onPress={() => handleWebsitePress(politician.website!)}
              className="flex-row items-center mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <MaterialIcons name="language" size={20} color="#3B82F6" />
              <Text className="ml-3 text-blue-600 dark:text-blue-400 flex-1">
                Official Website
              </Text>
              <MaterialIcons name="open-in-new" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}

          {/* Email */}
          {politician.email && (
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${politician.email}`)}
              className="flex-row items-center mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <MaterialIcons name="email" size={20} color="#3B82F6" />
              <Text className="ml-3 text-blue-600 dark:text-blue-400 flex-1">
                {politician.email}
              </Text>
              <MaterialIcons name="open-in-new" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}

          {/* Phone */}
          {politician.phone && (
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${politician.phone}`)}
              className="flex-row items-center mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <MaterialIcons name="phone" size={20} color="#3B82F6" />
              <Text className="ml-3 text-blue-600 dark:text-blue-400 flex-1">
                {politician.phone}
              </Text>
              <MaterialIcons name="open-in-new" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Social Media */}
        <View className="bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Social Media
          </Text>

          {/* Twitter */}
          {politician.twitter && (
            <TouchableOpacity
              onPress={() => handleSocialPress('twitter', politician.twitter!)}
              className="flex-row items-center mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <MaterialIcons name="link" size={20} color="#1DA1F2" />
              <Text className="ml-3 text-blue-600 dark:text-blue-400 flex-1">
                @{politician.twitter}
              </Text>
              <MaterialIcons name="open-in-new" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}

          {/* Facebook */}
          {politician.facebook && (
            <TouchableOpacity
              onPress={() => handleSocialPress('facebook', politician.facebook!)}
              className="flex-row items-center mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <MaterialIcons name="link" size={20} color="#4267B2" />
              <Text className="ml-3 text-blue-600 dark:text-blue-400 flex-1">
                Facebook
              </Text>
              <MaterialIcons name="open-in-new" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}

          {/* Instagram */}
          {politician.instagram && (
            <TouchableOpacity
              onPress={() => handleSocialPress('instagram', politician.instagram!)}
              className="flex-row items-center mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <MaterialIcons name="link" size={20} color="#E4405F" />
              <Text className="ml-3 text-blue-600 dark:text-blue-400 flex-1">
                @{politician.instagram}
              </Text>
              <MaterialIcons name="open-in-new" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}

          {!politician.twitter && !politician.facebook && !politician.instagram && (
            <Text className="text-gray-500 dark:text-gray-400 text-center py-4">
              No social media information available
            </Text>
          )}
        </View>

        {/* Bio/Description */}
        {politician.bio && (
          <View className="bg-white dark:bg-gray-900 p-6">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Biography
            </Text>
            <Text className="text-gray-700 dark:text-gray-300 leading-6">
              {politician.bio}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PoliticianDetailScreen;