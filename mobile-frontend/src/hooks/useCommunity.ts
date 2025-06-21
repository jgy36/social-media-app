// hooks/useCommunity.ts
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
  updatePreferenceFromServer,
} from "@/redux/slices/notificationPreferencesSlice";
import { CommunityData, CommunityMembershipResponse } from "@/types/community";
import { PostType } from "@/types/post";
import { Alert } from "react-native";

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
  refreshCommunity: () => Promise<void>;
  refreshPosts: () => Promise<void>;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.137.1:8080/api";

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
  const notificationState = useSelector((state: RootState) =>
    communityId
      ? state.notificationPreferences.communityPreferences[communityId]
      : undefined
  );

  // Check if user is joined based on Redux state
  const isJoined = communityId
    ? joinedCommunityIds.includes(communityId)
    : false;

  // Refs for managing fetch operations
  const isFetching = useRef(false);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch community data
  const fetchCommunityData = async () => {
    if (!communityId || isFetching.current) return;

    isFetching.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Add cache-busting timestamp
      const timestamp = Date.now();
      const response = await fetch(
        `${API_BASE_URL}/communities/${communityId}?t=${timestamp}`,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
            ...(currentUser.token && {
              Authorization: `Bearer ${currentUser.token}`,
            }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Community data received from API:", data);

      if (!isMounted.current) return;

      // Transform the response to match our type
      const communityData: CommunityData = {
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
        isNotificationsOn: !!data.isNotificationsOn,
      };

      setCommunity(communityData);
      setMemberCount(communityData.members || 0);

      // Handle notification state updates from server
      if (communityData.isNotificationsOn !== undefined) {
        const serverNotificationState = Boolean(
          communityData.isNotificationsOn
        );

        // Always update the Redux store with the server state
        dispatch(
          updatePreferenceFromServer({
            communityId,
            enabled: serverNotificationState,
          })
        );

        console.log(
          `Synced notification state from server: ${communityId} => ${serverNotificationState}`
        );
      }
    } catch (error) {
      console.error("Error fetching community:", error);
      if (isMounted.current) {
        setError("Failed to load community data");
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
      isFetching.current = false;
    }
  };

  // Fetch posts
  const fetchPosts = async () => {
    if (!communityId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/communities/${communityId}/posts`,
        {
          headers: {
            ...(currentUser.token && {
              Authorization: `Bearer ${currentUser.token}`,
            }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (isMounted.current) {
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Initial load
  useEffect(() => {
    if (communityId && !initialCommunityData) {
      fetchCommunityData();
    }
    if (communityId && !initialPosts) {
      fetchPosts();
    }
  }, [communityId]);

  // Handle joining/leaving the community
  const handleToggleMembership = async () => {
    if (!isAuthenticated || !community) return;

    console.log(
      `Toggling membership for ${community.id} - Current state: ${isJoined}`
    );

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

        Alert.alert("Error", response.message || "Failed to update membership");
      }
    } catch (error) {
      console.error("Error toggling community membership:", error);

      // Revert UI state on error
      setMemberCount((prevCount) => (isJoined ? prevCount + 1 : prevCount - 1));

      Alert.alert("Error", "Failed to update membership. Please try again.");
    }
  };

  // Refresh posts after creating a new one
  const handlePostCreated = async () => {
    if (!communityId) return;

    console.log("Refreshing posts after new post created");
    await fetchPosts();
  };

  // Manual refresh functions
  const refreshCommunity = async () => {
    await fetchCommunityData();
  };

  const refreshPosts = async () => {
    await fetchPosts();
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
    refreshCommunity,
    refreshPosts,
  };
};
