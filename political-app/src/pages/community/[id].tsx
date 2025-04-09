/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/community/[id].tsx - Refactored version
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import BackButton from "@/components/navigation/BackButton";
import { GetServerSideProps } from "next";
import axios from "axios";
import Navbar from "@/components/navbar/Navbar";

// Import community-specific components
import CommunityHeader from "@/components/community/CommunityHeader";
import CommunityPostForm from "@/components/community/CommunityPostForm";
import CommunityTabs from "@/components/community/CommunityTabs";
import CommunityInfo from "@/components/community/CommunityInfo";

// Import types and hooks
import { Community } from "@/api/types";
import { CommunityData, CommunityMembershipResponse } from "@/types/community";
import { PostType } from "@/types/post";
import { useCommunity } from "@/hooks/useCommunity";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

interface ServerSideProps {
  initialCommunityData?: CommunityData;
  initialPosts?: PostType[];
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const CommunityPage = ({ initialCommunityData, initialPosts, error: serverError }: ServerSideProps) => {
  const router = useRouter();
  const { id } = router.query;
  
  // Use our custom hook to manage community data
  const {
    community,
    posts,
    error,
    isLoading,
    isJoined,
    isNotificationsOn,
    memberCount,
    handleToggleMembership,
    handleToggleNotifications,
    handlePostCreated
  } = useCommunity(id as string, initialCommunityData, initialPosts, serverError);

  // Error state
  if (error || !community) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-5xl mx-auto p-4">
          <BackButton fallbackUrl="/community" className="mb-4" />
          
          <Card className="shadow-md">
            <div className="p-6">
              <p>{error || `The community "${id}" doesn't exist or may have been removed.`}</p>
              <button 
                onClick={() => router.push("/community")} 
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Back to Communities
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-5xl mx-auto p-6">
          <LoadingState message="Loading community..." />
        </div>
      </div>
    );
  }

  if (error) {
    const handleRetry = (): void => {
      // Either refresh the page
      router.reload();
      // Or we could implement a manual refetch if the useCommunity hook provides such functionality
      // For example: refetchCommunity(id as string);
    };

    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-5xl mx-auto p-6">
          <BackButton fallbackUrl="/community" className="mb-4" />
          <ErrorState message={error || "Community not found"} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div 
      key={`community-${id}`} // Add this key prop to force re-renders between communities
      className="min-h-screen bg-background text-foreground"
    >
      <Navbar />

      {/* Community Banner */}
      <div
        className="w-full h-40 bg-gradient-to-r from-primary/80 to-primary/30 relative"
        style={{
          backgroundImage: community.banner ? `url(${community.banner})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: community.color || 'var(--primary)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        <BackButton fallbackUrl="/community" className="mb-4 bg-background/80 backdrop-blur-sm" />
        
        {/* Community Header Component */}
        <CommunityHeader 
          community={community}
          isJoined={isJoined}
          isNotificationsOn={isNotificationsOn}
          memberCount={memberCount}
          onToggleMembership={handleToggleMembership}
          onToggleNotifications={handleToggleNotifications}
        />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Posts & Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Create Post Form Component */}
            <CommunityPostForm 
              communityId={community.id}
              isJoined={isJoined}
              onPostCreated={handlePostCreated}
            />
            
            {/* Community Content Tabs Component */}
            <CommunityTabs posts={posts} />
          </div>

          {/* Right Column - Community Info & Rules */}
          <div className="space-y-6">
            <CommunityInfo community={community} memberCount={memberCount} onJoin={handleToggleMembership} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Server-side rendering to get initial data
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  
  if (!id) {
    return {
      props: {
        error: "No community ID provided"
      }
    };
  }
  
  try {
    console.log(`[SSR] Fetching data for community: ${id}`);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
    
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    
    // Fetch community data
    const communityResponse = await axios.get(`${API_BASE_URL}/communities/${id}?t=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    const communityData = communityResponse.data as Community;
    
    // Transform API response to CommunityData
    const typedCommunityData: CommunityData = {
      id: communityData.id,
      name: communityData.name,
      description: communityData.description,
      members: communityData.members,
      created: communityData.created,
      rules: communityData.rules || [], // Ensure rules is always an array
      moderators: communityData.moderators || [],
      banner: communityData.banner,
      color: communityData.color,
      isJoined: communityData.isJoined || false,
      isNotificationsOn: communityData.isNotificationsOn || false
    };
    
    // Fetch posts
    const postsResponse = await axios.get<PostType[]>(`${API_BASE_URL}/communities/${id}/posts`);
    const posts = postsResponse.data;
    
    console.log(`[SSR] Successfully fetched community data and ${posts.length} posts`);
    
    return {
      props: {
        initialCommunityData: typedCommunityData,
        initialPosts: posts
      }
    };
  } catch (error) {
    console.error(`[SSR] Error fetching data for community ${id}:`, error);
    
    // Return error but don't fail the page load - client will retry
    return {
      props: {
        error: "Failed to load community data"
      }
    };
  }
};

export default CommunityPage;