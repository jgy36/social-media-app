// src/hooks/useCommunity.ts
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import {
  joinCommunity as joinCommunityAction,
  leaveCommunity as leaveCommunityAction,
} from "@/redux/slices/communitySlice";
import {
  getCommunityBySlug,
  getCommunityPosts,
  joinCommunity,
  leaveCommunity,
  createCommunityPost,
} from "@/api/communities";
import { 
  setNotificationPreference,
  updatePreferenceFromServer
} from "@/redux/slices/notificationPreferencesSlice";
import useSWR from "swr";
import axios from "axios";
import { CommunityData, CommunityMembershipResponse } from "@/types/community";
import { PostType } from "@/types/post";

// Return type for the hook
type UseCommunityReturn = {
  community: CommunityData | null;
  posts: PostType[];
  isLoading: boolean;
  error: string | null;
  isJoined: boolean;
  memberCount: number;
  handleToggleMembership: () => Promise<void>;
  handlePostCreated: () => Promise<void>;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Simple fetcher function for community data
const fetchCommunity = async (url: string): Promise<CommunityData> => {
  try {
    // Add cache-busting timestamp
    const timestamp = Date.now();
    const urlWithTimestamp = `${url}${url.includes('?') ? '&' : '?'}t=${timestamp}`;
    
    const response = await axios.get(urlWithTimestamp, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    const data = response.data;
    console.log("Community data received from API:", data);
    
    // Transform the response to match our type
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      members: data.members,
      created: data.created,
      rules: data.rules || [],
      moderators: data.moderators || [],
      banner: data.banner,
      color: data.color,
      isJoined: data.isJoined,
      isNotificationsOn: !!data.isNotificationsOn, // Convert to boolean
    };
  } catch (error) {
    console.error(`Error fetching community:`, error);
    throw error;
  }
};

// Fetcher for posts
const fetchPosts = async (url: string): Promise<PostType[]> => {
  try {
    const response = await axios.get(url);
    return response.data as PostType[];
  } catch (error) {
    console.error(`Error fetching posts:`, error);
    throw error;
  }
};

export const useCommunity = (
  communityId: string,
  initialCommunityData?: CommunityData,
  initialPosts?: PostType[],
  serverError?: string
): UseCommunityReturn => {
  // Component state
  const [community, setCommunity] = useState<CommunityData | null>(
    initialCommunityData || null
  );
  const [posts, setPosts] = useState<PostType[]>(initialPosts || []);
  const [isLoading, setIsLoading] = useState(!initialCommunityData);
  const [error, setError] = useState<string | null>(serverError || null);
  const [memberCount, setMemberCount] = useState(
    initialCommunityData?.members || 0
  );

  // Redux hooks
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!currentUser.token;
  const joinedCommunityIds = useSelector(
    (state: RootState) => state.communities.joinedCommunities
  );
  
  // Get notification state from Redux
  const notificationState = useSelector(
    (state: RootState) => 
      communityId ? state.notificationPreferences.communityPreferences[communityId] : undefined
  );
  
  // Check if user is joined based on Redux state
  const isJoined = communityId ? joinedCommunityIds.includes(communityId) : false;

  // SWR data fetching (only if communityId exists)
  const { 
    data: swrCommunityData, 
    error: swrError, 
    mutate: mutateCommunity 
  } = useSWR<CommunityData>(
    communityId ? `${API_BASE_URL}/communities/${communityId}` : null,
    communityId ? fetchCommunity : null,
    {
      fallbackData: initialCommunityData,
      revalidateOnFocus: false,  // Don't revalidate on focus
      dedupingInterval: 5000,    // 5 second deduping interval
      revalidateOnMount: true,   // Always revalidate when component mounts
    }
  );

  // SWR for fetching posts
  const { data: swrPosts, mutate: mutatePosts } = useSWR<PostType[]>(
    communityId ? `${API_BASE_URL}/communities/${communityId}/posts` : null,
    communityId ? fetchPosts : null,
    {
      fallbackData: initialPosts,
      revalidateOnFocus: false,
    }
  );

  // Update state from SWR data - focus on keeping notification state in sync
  useEffect(() => {
    if (swrCommunityData) {
      console.log("Updating community state from SWR data:", swrCommunityData);
      setCommunity(swrCommunityData);
      setMemberCount(swrCommunityData.members || 0);
      
      // Handle notification state updates from server - always sync with server
      if (communityId && swrCommunityData.isNotificationsOn !== undefined) {
        const serverNotificationState = Boolean(swrCommunityData.isNotificationsOn);
        
        // Always update the Redux store with the server state
        // Using updatePreferenceFromServer which will only update if different
        dispatch(updatePreferenceFromServer({
          communityId,
          enabled: serverNotificationState
        }));
        
        console.log(`Synced notification state from server: ${communityId} => ${serverNotificationState}`);
      }
    }

    if (swrError) {
      console.error("SWR error loading community:", swrError);
      setError("Failed to load community data");
    }

    setIsLoading(false);
  }, [swrCommunityData, swrError, dispatch, communityId]);

  // Update posts from SWR data
  useEffect(() => {
    if (swrPosts) {
      setPosts(swrPosts);
    }
  }, [swrPosts]);

  // Handle joining/leaving the community
  const handleToggleMembership = async () => {
    if (!isAuthenticated || !community) return;

    console.log(`Toggling membership for ${community.id} - Current state: ${isJoined}`);
    
    // Update member count optimistically
    setMemberCount((prevCount) => (isJoined ? prevCount - 1 : prevCount + 1));

    try {
      let response: CommunityMembershipResponse;

      if (isJoined) {
        // Leave community
        response = await leaveCommunity(community.id);
        console.log("Leave community response:", response);

        // Update Redux store if operation was successful
        if (response.success) {
          dispatch(leaveCommunityAction(community.id));
        }
      } else {
        // Join community
        response = await joinCommunity(community.id);
        console.log("Join community response:", response);

        // Update Redux store if operation was successful
        if (response.success) {
          dispatch(joinCommunityAction(community.id));
        }
      }

      if (!response.success) {
        console.error("API call failed:", response.message);
        // Revert if API call failed
        setMemberCount((prevCount) =>
          isJoined ? prevCount + 1 : prevCount - 1
        );
      }
    } catch (error) {
      console.error("Error toggling community membership:", error);

      // Revert UI state on error
      setMemberCount((prevCount) => (isJoined ? prevCount + 1 : prevCount - 1));
    }
  };

  // Refresh posts after creating a new one
  const handlePostCreated = async () => {
    if (!communityId) return;

    try {
      // Fetch the latest posts
      console.log("Refreshing posts after new post created");
      const freshPosts = await getCommunityPosts(communityId);
      setPosts(freshPosts);

      // Update SWR cache
      if (mutatePosts) {
        mutatePosts(freshPosts);
      }
    } catch (error) {
      console.error("Error refreshing posts:", error);
    }
  };

  return {
    community,
    posts,
    isLoading,
    error,
    isJoined,
    memberCount,
    handleToggleMembership,
    handlePostCreated,
  };
};