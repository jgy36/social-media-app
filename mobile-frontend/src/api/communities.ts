// src/api/communities.ts - React Native version
import { apiClient, getErrorMessage, API_BASE_URL } from "./apiClient";
import {
  Community,
  CreateCommunityRequest,
  CommunityMembershipResponse,
  PostResponse,
  CreatePostRequest,
} from "./types";
import {
  getToken,
  getUserId,
  getJoinedCommunities,
  setJoinedCommunities,
} from "@/utils/tokenUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper type guard for error responses
const isErrorWithResponse = (
  error: unknown
): error is {
  response?: {
    status?: number;
    data?: unknown;
  };
} => {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in (error as Record<string, unknown>) &&
    typeof (error as any).response === "object"
  );
};

/**
 * Get all communities
 */
export const getAllCommunities = async (): Promise<Community[]> => {
  try {
    const response = await apiClient.get<Community[]>("/communities");
    return response.data;
  } catch (error) {
    console.error("Error fetching communities:", error);
    return [];
  }
};

/**
 * Get a community by slug/id - React Native version
 */
export const getCommunityBySlug = async (
  slug: string
): Promise<Community | null> => {
  try {
    // Add cache busting timestamp parameter
    const timestamp = new Date().getTime();
    const response = await apiClient.get<Community>(
      `/communities/${slug}?t=${timestamp}`,
      {
        headers: {
          // Add cache busting headers
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching community ${slug}:`, error);
    return null;
  }
};

/**
 * Get popular communities
 */
export const getPopularCommunities = async (
  limit: number = 5
): Promise<Community[]> => {
  try {
    const response = await apiClient.get<Community[]>(
      `/communities/popular?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching popular communities:", error);
    return [];
  }
};

/**
 * Create a new community
 */
export const createCommunity = async (
  data: CreateCommunityRequest
): Promise<Community> => {
  try {
    const response = await apiClient.post<Community>("/communities", data);
    return response.data;
  } catch (error) {
    console.error("Error creating community:", error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Join a community - React Native version
 */
export const joinCommunity = async (
  slug: string
): Promise<CommunityMembershipResponse> => {
  try {
    const response = await apiClient.post<CommunityMembershipResponse>(
      `/communities/${slug}/join`,
      {}
    );

    // Save to AsyncStorage for persistence
    try {
      const currentUserId = await getUserId();
      if (currentUserId) {
        // Get existing joined communities
        const joinedCommunities = await getJoinedCommunities();

        // Add this community if not already present
        if (!joinedCommunities.includes(slug)) {
          joinedCommunities.push(slug);
          await setJoinedCommunities(joinedCommunities);
        }
      }
    } catch (storageError) {
      console.error(
        "Error updating AsyncStorage after joining community:",
        storageError
      );
    }

    return {
      ...response.data,
      ...(response.data.success === undefined ? { success: true } : {}),
    };
  } catch (error) {
    console.error(`Error joining community ${slug}:`, error);
    return { success: false, message: getErrorMessage(error) };
  }
};

/**
 * Leave a community - React Native version
 */
export const leaveCommunity = async (
  slug: string
): Promise<CommunityMembershipResponse> => {
  try {
    const response = await apiClient.delete<CommunityMembershipResponse>(
      `/communities/${slug}/leave`
    );

    // Update AsyncStorage
    try {
      const currentUserId = await getUserId();
      if (currentUserId) {
        // Get existing joined communities
        const joinedCommunities = await getJoinedCommunities();

        // Remove this community
        const updatedCommunities = joinedCommunities.filter(
          (id: string) => id !== slug
        );
        await setJoinedCommunities(updatedCommunities);

        // Also update featured communities if needed
        const featuredCommunitiesJson = await AsyncStorage.getItem(
          `user_${currentUserId}_featuredCommunities`
        );
        if (featuredCommunitiesJson) {
          const featuredCommunities = JSON.parse(featuredCommunitiesJson);
          const updatedFeatured = featuredCommunities.filter(
            (id: string) => id !== slug
          );
          await AsyncStorage.setItem(
            `user_${currentUserId}_featuredCommunities`,
            JSON.stringify(updatedFeatured)
          );
        }
      }
    } catch (storageError) {
      console.error(
        "Error updating AsyncStorage after leaving community:",
        storageError
      );
    }

    return {
      ...response.data,
      ...(response.data.success === undefined ? { success: true } : {}),
    };
  } catch (error) {
    console.error(`Error leaving community ${slug}:`, error);
    return { success: false, message: getErrorMessage(error) };
  }
};

/**
 * Get posts for a community
 */
export const getCommunityPosts = async (
  slug: string
): Promise<PostResponse[]> => {
  try {
    const response = await apiClient.get<PostResponse[]>(
      `/communities/${slug}/posts`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for community ${slug}:`, error);
    return [];
  }
};

/**
 * Create a post in a community
 */
export const createCommunityPost = async (
  slug: string,
  content: string
): Promise<PostResponse> => {
  try {
    const postData: CreatePostRequest = { content, communityId: slug };
    const response = await apiClient.post<PostResponse>(
      `/communities/${slug}/posts`,
      postData
    );
    return response.data;
  } catch (error) {
    console.error(`Error creating post in community ${slug}:`, error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Search communities
 */
export const searchCommunities = async (
  query: string
): Promise<Community[]> => {
  try {
    const response = await apiClient.get<Community[]>(
      `/communities/search?query=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error searching communities with query ${query}:`, error);
    return [];
  }
};

/**
 * Get user's joined communities - React Native version
 */
export const getUserCommunities = async (): Promise<Community[]> => {
  try {
    const response = await apiClient.get<Community[]>("/communities/user");

    // Save to AsyncStorage for persistence
    try {
      const currentUserId = await getUserId();
      if (currentUserId && response.data.length > 0) {
        // Extract just the community IDs/slugs
        const communityIds = response.data.map((community) => community.id);
        await setJoinedCommunities(communityIds);

        // Also update featured communities if we don't have any yet
        const featuredCommunitiesJson = await AsyncStorage.getItem(
          `user_${currentUserId}_featuredCommunities`
        );
        if (!featuredCommunitiesJson || featuredCommunitiesJson === "[]") {
          const featuredIds = communityIds.slice(0, 5); // Take up to 5
          await AsyncStorage.setItem(
            `user_${currentUserId}_featuredCommunities`,
            JSON.stringify(featuredIds)
          );
        }
      }
    } catch (storageError) {
      console.error(
        "Error updating AsyncStorage after fetching user communities:",
        storageError
      );
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching user communities:`, error);
    return [];
  }
};

/**
 * Check if user is a member of a community
 */
export const checkCommunityMembership = async (
  slug: string
): Promise<boolean> => {
  try {
    const response = await apiClient.get<{ isMember: boolean }>(
      `/communities/${slug}/membership`
    );
    return response.data.isMember;
  } catch (error) {
    console.error(`Error checking membership for community ${slug}:`, error);
    return false;
  }
};

/**
 * Toggle community notifications - React Native version
 */
export const toggleCommunityNotifications = async (
  slug: string
): Promise<{
  success: boolean;
  isNotificationsOn?: boolean;
  message?: string;
}> => {
  try {
    const token = await getToken();
    console.log(`Making notifications toggle request:`);
    console.log(`- Token exists: ${!!token}`);
    console.log(`- Auth headers: ${token ? "present" : "missing"}`);

    // Explicitly add cache prevention
    const timestamp = Date.now();
    const url = `${API_BASE_URL}/communities/${slug}/notifications/toggle?t=${timestamp}`;

    // Use apiClient instead of axios directly
    const response = await apiClient.post<{
      success?: boolean;
      isNotificationsOn?: boolean;
      message?: string;
    }>(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );

    console.log("Notification toggle response:", response.data);

    // Add more detailed logging
    if (response.data.isNotificationsOn !== undefined) {
      console.log(
        `Server returned notification state: ${response.data.isNotificationsOn}`
      );
    } else {
      console.warn("Server did not return isNotificationsOn value!");
    }

    // Convert the isNotificationsOn to a proper boolean
    const notificationsOn =
      response.data.isNotificationsOn !== undefined
        ? Boolean(response.data.isNotificationsOn)
        : undefined;

    // Return with definite success and the server's reported state
    return {
      success: response.data.success !== false, // Default to true if not specified
      isNotificationsOn: notificationsOn,
      message: response.data.message,
    };
  } catch (error: unknown) {
    console.error(`Error toggling notifications for community ${slug}:`, error);

    // Enhanced error logging with type guard
    if (isErrorWithResponse(error) && error.response) {
      console.error(
        `Status: ${error.response.status || "unknown"}, Data:`,
        error.response.data || "No data"
      );
    }

    return {
      success: false,
      isNotificationsOn: undefined,
      message: getErrorMessage(error),
    };
  }
};
