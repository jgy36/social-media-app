import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { CommunityData } from '@/types/community';
import NotificationToggle from './NotificationToggle';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface CommunityHeaderProps {
  community: CommunityData;
  isJoined: boolean;
  memberCount: number;
  onToggleMembership: () => void;
}

const CommunityHeader = ({
  community,
  isJoined,
  memberCount,
  onToggleMembership
}: CommunityHeaderProps) => {
  const notificationState = useSelector(
    (state: RootState) => 
      state.notificationPreferences.communityPreferences[community.id]
  );
  
  const isNotificationsOn = notificationState !== undefined 
    ? notificationState
    : community.isNotificationsOn;

  return (
    <View className="bg-card rounded-lg shadow-sm border border-border p-4 mx-4 my-2">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center flex-wrap gap-2">
            <Text className="text-2xl font-bold text-foreground">{community.name}</Text>
            <View className="bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
              <Text className="text-primary text-sm font-medium">
                {memberCount.toLocaleString()} members
              </Text>
            </View>
          </View>
          <Text className="text-muted-foreground mt-1">{community.description}</Text>
        </View>
      </View>

      <View className="flex-row gap-2 mt-4">
        <Button
          variant={isJoined ? 'outline' : 'default'}
          className={isJoined ? 'border-primary/50' : ''}
          onPress={onToggleMembership}
        >
          <View className="flex-row items-center gap-2">
            <Users size={16} color={isJoined ? '#6366f1' : 'white'} />
            <Text className={isJoined ? 'text-primary' : 'text-white'}>
              {isJoined ? 'Joined' : 'Join'}
            </Text>
          </View>
        </Button>

        {isJoined && (
          <NotificationToggle 
            communityId={community.id} 
            initialState={isNotificationsOn}
          />
        )}
      </View>

      <View className="flex-row items-center mt-4">
        <Calendar size={16} color="#6b7280" />
        <Text className="text-muted-foreground ml-1 text-sm">
          Created {new Date(community.created).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

export default CommunityHeader;