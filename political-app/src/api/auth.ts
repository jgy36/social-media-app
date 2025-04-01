// src/api/auth.ts - Fixed for TypeScript null/undefined issues
import { apiClient, safeApiCall } from "./apiClient";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
} from "./types";
import {
  setToken,
  setUserData,
  clearUserData,
  getUserData,
  setAuthenticated,
  removeToken,
} from "@/utils/tokenUtils";

/**
 * Login a user
 */
export const login = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
      {
        withCredentials: true, // Ensure cookies are sent/received
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    // If we get a token from the server, store it
    if (response.data.token) {
      setToken(response.data.token);
    }

    // Mark as authenticated regardless (since we're using HTTP-only cookies)
    setAuthenticated(true);

    // Store user info in localStorage
    if (response.data.user?.id) {
      setUserData({
        id: response.data.user.id,
        username: response.data.user.username || "",
        email: response.data.user.email || "",
        // Convert null to undefined to avoid type issues
        displayName: response.data.user.displayName || undefined,
        bio: response.data.user.bio || undefined,
        profileImageUrl: response.data.user.profileImageUrl || undefined,
      });
    }

    return response.data;
  }, "Login error");
};

/**
 * Register a new user
 */
export const register = async (
  userData: RegisterRequest
): Promise<ApiResponse<AuthResponse>> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      userData,
      { withCredentials: true }
    );
    return response.data;
  }, "Registration error");
};

/**
 * Helper function to clear all data for a specific user ID
 */
function clearUserDataById(userId: string) {
  // Clean up localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`user_${userId}_`)) {
      localStorage.removeItem(key);
    }
  }

  // Clean up sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(`user_${userId}_`)) {
      sessionStorage.removeItem(key);
    }
  }
}

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  try {
    // Get the current user ID before logout
    const currentUserId =
      sessionStorage.getItem("currentUserId") ||
      localStorage.getItem("currentUserId");

    // Call logout endpoint with credentials
    await apiClient.post("/auth/logout", {}, { withCredentials: true });

    // Clean up all storage
    if (currentUserId) {
      clearUserDataById(currentUserId);
    }

    // Use the utility function for full cleanup
    clearUserData();
  } catch (err) {
    console.error("Logout error:", err);
    // Continue with local logout even if API call fails
    clearUserData();
  }
};

/**
 * Refresh the authentication token
 */
export const refreshToken = async (): Promise<boolean> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ token?: string }>(
      "/auth/refresh",
      {},
      { withCredentials: true }
    );

    // If we receive a token from the server, store it
    if (response.data && response.data.token) {
      setToken(response.data.token);
    }

    // Mark as authenticated since the cookie was refreshed
    setAuthenticated(true);

    return true;
  }, "Token refresh error");
};

/**
 * Check the current authentication status
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<{
      id?: number;
      username?: string;
      email?: string;
      displayName?: string;
      bio?: string;
      profileImageUrl?: string;
    }>("/users/me", { withCredentials: true });

    // If successful, update current user info
    if (response.data && response.data.id) {
      // Mark as authenticated
      setAuthenticated(true);

      // Store user data
      setUserData({
        id: response.data.id,
        username: response.data.username || "",
        email: response.data.email || "",
        // Fix type issues by converting null to undefined
        displayName: response.data.displayName || undefined,
        bio: response.data.bio || undefined,
        profileImageUrl: response.data.profileImageUrl || undefined,
      });

      return true;
    }

    return false;
  } catch (err) {
    console.error("Auth status check failed:", err);
    setAuthenticated(false);
    return false;
  }
};

/**
 * Get current user information
 * Returns an object with user data from localStorage
 */
export const getCurrentUserInfo = (): {
  userId: string | null;
  username: string | null;
  email: string | null;
  displayName: string | null;
  bio: string | null;
  profileImageUrl: string | null;
} => {
  const userData = getUserData();

  return {
    userId: userData.id,
    username: userData.username,
    email: userData.email,
    displayName: userData.displayName,
    bio: userData.bio,
    profileImageUrl: userData.profileImageUrl,
  };
};

/**
 * Check and restore user session
 * Verifies authentication with server and refreshes local storage data
 */
export const checkAndRestoreSession = async (): Promise<boolean> => {
  try {
    // First check if we're actually authenticated with the server
    const isAuthenticated = await checkAuthStatus();

    if (!isAuthenticated) {
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error restoring session:", err);
    return false;
  }
};

export const loginWithCommunities = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  try {
    // First perform the normal login
    const loginResponse = await login(credentials);

    // If login successful, now restore communities
    if (loginResponse && loginResponse.token) {
      try {
        // Import redux store and thunks
        const { store } = await import("@/redux/store");
        const { fetchAndRestoreUserCommunities } = await import(
          "@/redux/slices/communitySlice"
        );

        // Dispatch the thunk to restore communities
        store.dispatch(fetchAndRestoreUserCommunities());

        console.log("Communities restoration initiated");
      } catch (communitiesError) {
        console.error(
          "Error restoring communities after login:",
          communitiesError
        );
        // We still want to continue even if community restoration fails
      }
    }

    return loginResponse;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
