import { MaterialIcons } from '@expo/vector-icons';
// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { useNavigation } from '@react-navigation/native';

import UserBadges from '../components/profile/UserBadges';
import UserStats from '../components/profile/UserStats';
import ProfilePosts from '../components/profile/ProfilePosts';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(false);

  const navigateToSettings = () => {
    navigation.navigate('Settings' as never);
  };

  // Handle the case where user.id might be null
  const userId = user.id || undefined;

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-white shadow-sm">
        <View className="flex-row justify-between items-center p-4">
          <Text className="text-xl font-bold">Profile</Text>
          <TouchableOpacity onPress={navigateToSettings}>
            <MaterialIcons name="settings" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Section */}
      <View className="bg-white m-4 rounded-xl shadow-sm p-6">
        <View className="items-center">
          {/* Avatar */}
          <Image
            source={{
              uri: user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
            }}
            className="w-24 h-24 rounded-full border-2 border-primary/20"
          />
          
          {/* User Info */}
          <Text className="text-2xl font-bold mt-4">
            {user.displayName || user.username}
          </Text>
          <Text className="text-muted-foreground">@{user.username}</Text>
          
          {user.bio && (
            <Text className="text-center mt-2 text-foreground">{user.bio}</Text>
          )}

          {/* User Badges - Only render if userId is valid */}
          {userId && <UserBadges userId={userId} isCurrentUser={true} />}

          {/* User Stats - Only render if userId is valid */}
          {userId && (
            <UserStats
              userId={userId}
              postsCount={(user as any).postsCount || 0}
              followersCount={(user as any).followersCount || 0}
              followingCount={(user as any).followingCount || 0}
              className="mt-4"
            />
          )}

          {/* Join Date */}
          <View className="flex-row items-center mt-4">
            <MaterialIcons name="calendar-today" size={16} color="#6b7280" />
            <Text className="ml-2 text-muted-foreground">
              Joined {(user as any).joinDate ? new Date((user as any).joinDate).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>
        </View>
      </View>

      {/* Posts Section */}
      <ProfilePosts />
    </ScrollView>
  );
};

export default ProfileScreen; 