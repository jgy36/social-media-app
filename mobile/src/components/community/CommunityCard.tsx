// src/components/community/CommunityCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description: string;
    members: number;
    isJoined: boolean;
    color?: string;
  };
  onJoin: (e: any, communityId: string) => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, onJoin }) => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/community/${community.id}`);
  };

  return (
    <TouchableOpacity onPress={handleNavigate}>
      <Card 
        className="mb-3 border-l-4"
        style={{ borderLeftColor: community.color || '#1976d2' }}
      >
        <CardContent className="p-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-base font-medium flex-1 pr-2">{community.name}</Text>
            <Button
              variant={community.isJoined ? 'outline' : 'default'}
              size="sm"
              onPress={(e) => {
                e.stopPropagation();
                onJoin(e, community.id);
              }}
            >
              <Text>{community.isJoined ? 'Joined' : 'Join'}</Text>
            </Button>
          </View>
          
          <Text className="text-sm text-gray-500 mb-3" numberOfLines={2}>
            {community.description}
          </Text>
          
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500">
              🧑‍🤝‍🧑 {community.members.toLocaleString()} members
            </Text>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
};

export default CommunityCard;