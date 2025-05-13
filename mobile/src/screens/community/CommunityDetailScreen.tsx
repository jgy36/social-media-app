// src/screens/community/CommunityDetailScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ImageBackground } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/card";
import BackButton from "@/components/navigation/BackButton";
import LoadingState from "@/components/ui/LoadingState";

// Import community-specific components
import CommunityHeader from "@/components/community/CommunityHeader";
import CommunityPostForm from "@/components/community/CommunityPostForm";
import CommunityTabs from "@/components/community/CommunityTabs";
import CommunityInfo from "@/components/community/CommunityInfo";

// Import types and hooks
import { Community } from "@/api/types";
import { CommunityData } from "@/types/community";
import { PostType } from "@/types/post";
import { useCommunity } from "@/hooks/useCommunity";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const CommunityDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Use our custom hook to manage community data
  // Pass undefined instead of null for optional parameters
  const {
    community,
    posts,
    error,
    isLoading,
    isJoined,
    memberCount,
    handleToggleMembership,
    handlePostCreated
  } = useCommunity(id, undefined, undefined, undefined);

  // Error state
  if (error || (!isLoading && !community)) {
    return (
      <View className="flex-1 bg-background">
        <View className="max-w-5xl mx-auto p-4">
          <BackButton fallbackUrl="/community" className="mb-4" />
          
          <Card className="shadow-md">
            <View className="p-6">
              <Text className="text-foreground">
                {error || `The community "${id}" doesn't exist or may have been removed.`}
              </Text>
              <TouchableOpacity 
                onPress={() => router.push("/community")} 
                className="mt-4 px-4 py-2 bg-primary rounded-lg"
              >
                <Text className="text-primary-foreground">Back to Communities</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </View>
    );
  }

  // Loading state
  if (isLoading || !community) {
    return (
      <View className="flex-1 bg-background">
        <View className="max-w-5xl mx-auto p-6">
          <LoadingState message="Loading community..." />
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Community Banner */}
      {community.banner ? (
        <ImageBackground 
          source={{ uri: community.banner }}
          className="w-full h-40"
          style={{ backgroundColor: community.color || '#3b82f6' }}
        >
          <View className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </ImageBackground>
      ) : (
        <View 
          className="w-full h-40" 
          style={{ backgroundColor: community.color || '#3b82f6' }}
        >
          <View className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </View>
      )}

      <View className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        <BackButton fallbackUrl="/community" className="mb-4 bg-background/80 backdrop-blur-sm" />
        
        {/* Community Header Component */}
        <CommunityHeader 
          community={community}
          isJoined={isJoined}
          memberCount={memberCount}
          onToggleMembership={handleToggleMembership}
        />

        {/* Main Content Area */}
        <View className="mt-6 space-y-6">
          {/* Left Column - Posts & Content */}
          <View className="space-y-6">
            {/* Create Post Form Component */}
            <CommunityPostForm 
              communityId={community.id}
              isJoined={isJoined}
              onPostCreated={handlePostCreated}
            />
            
            {/* Community Content Tabs Component */}
            <CommunityTabs posts={posts} />
          </View>

          {/* Right Column - Community Info & Rules */}
          <View className="space-y-6">
            <CommunityInfo 
              community={community} 
              memberCount={memberCount} 
              onJoin={handleToggleMembership} 
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default CommunityDetailScreen;