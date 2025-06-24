// src/api/dating.ts
import { apiClient, safeApiCall } from "./apiClient";

// Dating Profile Types
export interface DatingProfile {
  id: number;
  user: {
    id: number;
    username: string;
    displayName: string;
  };
  bio: string;
  age: number;
  location: string;
  photos: string[];
  isActive: boolean;
  genderPreference: string;
  minAge: number;
  maxAge: number;
  maxDistance: number;
}

export interface CreateDatingProfileRequest {
  bio: string;
  age: number;
  location: string;
  photos: string[];
  genderPreference: string;
  minAge: number;
  maxAge: number;
  maxDistance: number;
}

// Swipe Types
export interface SwipeRequest {
  targetUserId: number;
  direction: "LIKE" | "PASS";
}

export interface SwipeResponse {
  matched: boolean;
  match?: {
    id: number;
    user1: any;
    user2: any;
    matchedAt: string;
  };
}

// Match Types
export interface Match {
  id: number;
  user1: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  user2: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  matchedAt: string;
  isActive: boolean;
}

/**
 * Create or update dating profile
 */
export const createOrUpdateDatingProfile = async (
  profileData: CreateDatingProfileRequest
): Promise<DatingProfile> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<DatingProfile>(
      "/dating/profile",
      profileData
    );
    return response.data;
  }, "Failed to create/update dating profile");
};

/**
 * Get current user's dating profile
 */
export const getCurrentDatingProfile =
  async (): Promise<DatingProfile | null> => {
    return safeApiCall(async () => {
      try {
        const response = await apiClient.get<DatingProfile>(
          "/dating/profile/me"
        );
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null; // No profile exists yet
        }
        throw error;
      }
    }, "Failed to get dating profile");
  };

/**
 * Get potential matches for swiping
 */
export const getPotentialMatches = async (): Promise<DatingProfile[]> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<DatingProfile[]>(
      "/dating/potential-matches"
    );
    return response.data;
  }, "Failed to get potential matches");
};

/**
 * Swipe on a user
 */
export const swipeUser = async (
  targetUserId: number,
  direction: "LIKE" | "PASS"
): Promise<SwipeResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<SwipeResponse>(
      "/dating/swipe",
      null,
      {
        params: { targetUserId, direction },
      }
    );
    return response.data;
  }, "Failed to swipe user");
};

/**
 * Get user's matches
 */
export const getUserMatches = async (): Promise<Match[]> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<Match[]>("/dating/matches");
    return response.data;
  }, "Failed to get matches");
};

/**
 * Check if dating profile is complete
 */
export const isDatingProfileComplete = async (): Promise<boolean> => {
  try {
    const profile = await getCurrentDatingProfile();
    return (
      profile !== null &&
      profile.photos.length > 0 &&
      profile.bio.trim().length > 0 &&
      profile.age > 0
    );
  } catch (error) {
    return false;
  }
};
