// src/components/profile/UserBadges.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { getBadgeById } from '@/types/badges';
import BadgeSelector from './BadgeSelector';
import { clearBadges } from '@/redux/slices/badgeSlice';
import { getUserBadges } from '@/api/badges';

interface UserBadgesProps {
  userId?: number;
  isCurrentUser?: boolean;
  badges?: string[];
  className?: string;
}

const UserBadges: React.FC<UserBadgesProps> = ({ 
  userId, 
  isCurrentUser = false,
  badges: propBadges,
  className = ""
}) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const userBadges = useSelector((state: RootState) => state.badges.badges);
  const [displayBadges, setDisplayBadges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const currentUserId = useSelector((state: RootState) => state.user.id);
  
  // Reset badges when user changes
  useEffect(() => {
    if (isCurrentUser && userId && currentUserId && userId !== currentUserId) {
      console.log('Current user changed, clearing badges');
      dispatch(clearBadges());
    }
  }, [userId, currentUserId, isCurrentUser, dispatch]);
  
  // Fetch badges for non-current users
  useEffect(() => {
    async function fetchUserBadges() {
      if (!userId || (isCurrentUser && userId === currentUserId)) {
        return;
      }
      
      try {
        setIsLoading(true);
        console.log(`Fetching badges for user ${userId}`);
        const badges = await getUserBadges(userId);
        setDisplayBadges(badges);
      } catch (error) {
        console.error(`Error fetching badges for user ${userId}:`, error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (!propBadges && userId) {
      fetchUserBadges();
    }
  }, [userId, propBadges, isCurrentUser, currentUserId]);
  
  // Determine which badges to display
  useEffect(() => {
    if (propBadges) {
      setDisplayBadges(propBadges);
    } else if (isCurrentUser && userId === currentUserId) {
      setDisplayBadges(userBadges);
    }
  }, [propBadges, userBadges, isCurrentUser, userId, currentUserId]);
  
  // If no badges and still loading, show loading state
  if (isLoading) {
    return (
      <View className="mt-4">
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Loading badges...
        </Text>
      </View>
    );
  }
  
  // If no badges and not current user's profile, don't render anything
  if (displayBadges.length === 0 && !isCurrentUser) {
    return null;
  }
  
  const Badge = ({ badgeId }: { badgeId: string }) => {
    const badge = getBadgeById(badgeId);
    if (!badge) return null;
    
    return (
      <View className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 mr-2 mb-2">
        <Text className="text-sm text-gray-700 dark:text-gray-300">{badge.name}</Text>
      </View>
    );
  };
  
  return (
    <View className={className}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        <View className="flex-row flex-wrap">
          {displayBadges.length > 0 ? (
            displayBadges.map(badgeId => (
              <Badge key={badgeId} badgeId={badgeId} />
            ))
          ) : isCurrentUser ? (
            <Text className="text-sm text-gray-600 dark:text-gray-400 italic py-2">
              No badges selected yet.
            </Text>
          ) : null}
        </View>
      </ScrollView>
      
      {isCurrentUser && userId === currentUserId && (
        <Pressable 
          onPress={() => setIsSelectorOpen(true)}
          className="mt-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          style={{ alignSelf: 'flex-start' }}
        >
          <Text className="text-gray-700 dark:text-gray-300 font-medium">
            {displayBadges.length > 0 ? 'Edit Badges' : 'Add Badges'}
          </Text>
        </Pressable>
      )}
      
      <BadgeSelector 
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        selectedBadges={displayBadges}
      />
    </View>
  );
};

export default UserBadges;