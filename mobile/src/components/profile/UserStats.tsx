// Example: Updated UserStats.tsx using Expo Vector Icons

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import FollowListModal from '@/components/profile/FollowListModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserStatsProps {
  userId: number;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  className?: string;
  onFollowChange?: (newFollowersCount: number, newFollowingCount: number) => void;
}

const UserStats = ({ 
  userId, 
  postsCount, 
  followersCount, 
  followingCount,
  className = "",
  onFollowChange
}: UserStatsProps) => {
  const [activeModal, setActiveModal] = useState<'followers' | 'following' | null>(null);
  const [currentPostsCount, setCurrentPostsCount] = useState(postsCount);
  
  // Listen for post count updates
  useEffect(() => {
    // Initialize from props
    setCurrentPostsCount(postsCount);
    
    // Check AsyncStorage for a user-specific post count
    const getUserPostCount = async () => {
      try {
        const userSpecificCount = await AsyncStorage.getItem(`user_${userId}_userPostsCount`);
        if (userSpecificCount) {
          setCurrentPostsCount(parseInt(userSpecificCount, 10));
        }
      } catch (error) {
        console.error('Error reading post count from storage:', error);
      }
    };
    
    getUserPostCount();
    
    // Listen for updates (polling every 2 seconds)
    const pollInterval = setInterval(async () => {
      try {
        const userSpecificCount = await AsyncStorage.getItem(`user_${userId}_userPostsCount`);
        if (userSpecificCount) {
          const count = parseInt(userSpecificCount, 10);
          if (count !== currentPostsCount) {
            setCurrentPostsCount(count);
          }
        }
      } catch (error) {
        console.error('Error polling post count:', error);
      }
    }, 2000);
    
    return () => clearInterval(pollInterval);
  }, [postsCount, userId, currentPostsCount]);
  
  // Update when props change
  useEffect(() => {
    setCurrentPostsCount(postsCount);
  }, [postsCount]);
  
  // Update counts when follows change within modal
  const handleFollowUpdate = (isFollowing: boolean, newFollowersCount: number, newFollowingCount: number) => {
    if (onFollowChange) {
      onFollowChange(newFollowersCount, newFollowingCount);
    }
  };
  
  return (
    <View className={`flex-row items-center justify-around ${className}`}>
      {/* Posts Count */}
      <View className="items-center">
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="chat-bubble-outline" size={16} color="#6b7280" />
        </View>
        <Text className="text-lg font-bold text-black dark:text-white">{currentPostsCount}</Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400">Posts</Text>
      </View>
      
      {/* Followers Count (Clickable) */}
      <Pressable 
        onPress={() => setActiveModal('followers')}
        className="items-center"
      >
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="group" size={16} color="#6b7280" />
        </View>
        <Text className="text-lg font-bold text-black dark:text-white">{followersCount}</Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400">Followers</Text>
      </Pressable>
      
      {/* Following Count (Clickable) */}
      <Pressable 
        onPress={() => setActiveModal('following')}
        className="items-center"
      >
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="person" size={16} color="#6b7280" />
        </View>
        <Text className="text-lg font-bold text-black dark:text-white">{followingCount}</Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400">Following</Text>
      </Pressable>
      
      {/* Followers Modal */}
      <FollowListModal
        userId={userId}
        listType="followers"
        isOpen={activeModal === 'followers'}
        onClose={() => setActiveModal(null)}
        title={`Followers (${followersCount})`}
      />
      
      {/* Following Modal */}
      <FollowListModal
        userId={userId}
        listType="following"
        isOpen={activeModal === 'following'}
        onClose={() => setActiveModal(null)}
        title={`Following (${followingCount})`}
      />
    </View>
  );
};

export default UserStats;