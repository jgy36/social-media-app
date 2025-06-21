import { MaterialIcons } from '@expo/vector-icons';
// src/components/community/CommunityInfo.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { CommunityData } from "@/types/community";

interface CommunityInfoProps {
  community: CommunityData;
  memberCount: number;
  onJoin: () => void;
}

const CommunityInfo = ({ community, memberCount }: CommunityInfoProps) => {
  const navigation = useNavigation();
  const { rules, moderators } = community;

  return (
    <View className="space-y-4">
      {/* About Community */}
      <View className="shadow-sm border border-border bg-white dark:bg-gray-800 rounded-lg p-4">
        <View className="pb-2">
          <Text className="text-lg font-bold flex items-center">
            <Info className="h-4 w-4 mr-2" />
            About Community
          </Text>
        </View>
        <View className="space-y-4">
          <Text>{community.description}</Text>

          <View>
            <View className="flex-row items-center mb-1">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              <Text className="font-medium">
                {memberCount.toLocaleString()} members
              </Text>
            </View>

            <View className="flex-row items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <Text>
                Created {new Date(community.created).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Community Rules */}
      <View className="shadow-sm border border-border bg-white dark:bg-gray-800 rounded-lg p-4">
        <View className="pb-2">
          <Text className="text-lg font-bold flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Community Rules
          </Text>
        </View>
        <View>
          <View className="space-y-3">
            {rules && rules.length > 0 ? (
              rules.map((rule, index) => (
                <View key={index} className="pb-2 border-b border-gray-200 last:border-b-0">
                  <Text className="font-medium">
                    {index + 1}. {rule}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-500">
                No specific rules have been set for this community.
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Moderators */}
      <View className="shadow-sm border border-border bg-white dark:bg-gray-800 rounded-lg p-4">
        <View className="pb-2">
          <Text className="text-lg font-bold flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Moderators
          </Text>
        </View>
        <View>
          <View className="space-y-2">
            {moderators && moderators.length > 0 ? (
              moderators.map((mod, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center"
                  onPress={() => navigation.navigate('Profile', { username: mod })}
                >
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <Text className="text-blue-500">
                    {mod}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-gray-500">
                No moderators listed for this community.
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default CommunityInfo;