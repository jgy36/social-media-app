// src/api/auth.ts
import { apiClient, safeApiCall } from "./apiClient";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
} from "./types";
import { setToken, removeToken } from "@/utils/tokenUtils";

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
      { withCredentials: true }  // Ensure cookies are sent/received
    );

    // Store the token
    if (response.data.token) {
      setToken(response.data.token);

      // Store user info in localStorage
      // This is safe because we're only doing it after a successful login
      if (response.data.user?.username) {
        const userInfo = {
          username: response.data.user.username,
          userId: String(response.data.user.id),
          email: response.data.user.email,
          displayName: response.data.user.displayName || null,
          bio: response.data.user.bio || null,
          profileImageUrl: response.data.user.profileImageUrl || null
        };
        
        // Store each piece with a unique key including the user ID for isolation
        const userId = String(response.data.user.id);
        localStorage.setItem(`user_${userId}_username`, userInfo.username);
        localStorage.setItem(`user_${userId}_userId`, String(userInfo.userId));
        localStorage.setItem(`user_${userId}_email`, userInfo.email);
        if (userInfo.displayName) localStorage.setItem(`user_${userId}_displayName`, userInfo.displayName);
        if (userInfo.bio) localStorage.setItem(`user_${userId}_bio`, userInfo.bio);
        if (userInfo.profileImageUrl) localStorage.setItem(`user_${userId}_profileImageUrl`, userInfo.profileImageUrl);
        
        // Also store the current active user ID
        localStorage.setItem("currentUserId", userId);
      }
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
      userData
    );
    return response.data;
  }, "Registration error");
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  try {
    // Get the current user ID before logout
    const currentUserId = localStorage.getItem("currentUserId");
    
    // Call logout endpoint with credentials
    await apiClient.post("/auth/logout", {}, { withCredentials: true });
    
    // Clear token
    removeToken();
    
    // Clear only the current user's data
    if (currentUserId) {
      // Clear user-specific data
      localStorage.removeItem(`user_${currentUserId}_username`);
      localStorage.removeItem(`user_${currentUserId}_userId`);
      localStorage.removeItem(`user_${currentUserId}_email`);
      localStorage.removeItem(`user_${currentUserId}_displayName`);
      localStorage.removeItem(`user_${currentUserId}_bio`);
      localStorage.removeItem(`user_${currentUserId}_profileImageUrl`);
      
      // Clear current user tracking
      localStorage.removeItem("currentUserId");
    }
  } catch (err) {
    console.error("Logout error:", err);
    // Continue with local logout even if API call fails
    removeToken();
    
    // Clear all possible auth data
    const currentUserId = localStorage.getItem("currentUserId");
    if (currentUserId) {
      localStorage.removeItem(`user_${currentUserId}_username`);
      localStorage.removeItem(`user_${currentUserId}_userId`);
      localStorage.removeItem(`user_${currentUserId}_email`);
      localStorage.removeItem(`user_${currentUserId}_displayName`);
      localStorage.removeItem(`user_${currentUserId}_bio`);
      localStorage.removeItem(`user_${currentUserId}_profileImageUrl`);
      localStorage.removeItem("currentUserId");
    }
  }
};

/**
 * Refresh the authentication token
 */
export const refreshToken = async (): Promise<string> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ token: string }>(
      "/auth/refresh",
      {},
      { withCredentials: true }
    );

    if (response.data.token) {
      setToken(response.data.token);
      return response.data.token;
    }

    throw new Error("No token received");
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
      const userId = String(response.data.id);
      localStorage.setItem("currentUserId", userId);
      
      // Update user info
      if (response.data.username) {
        localStorage.setItem(`user_${userId}_username`, response.data.username);
      }
      localStorage.setItem(`user_${userId}_userId`, userId);
      if (response.data.email) {
        localStorage.setItem(`user_${userId}_email`, response.data.email);
      }
      if (response.data.displayName) {
        localStorage.setItem(`user_${userId}_displayName`, response.data.displayName);
      }
      if (response.data.bio) {
        localStorage.setItem(`user_${userId}_bio`, response.data.bio);
      }
      if (response.data.profileImageUrl) {
        localStorage.setItem(`user_${userId}_profileImageUrl`, response.data.profileImageUrl);
      }
    }
    
    return true;
  } catch (err) {
    console.error("Auth status check failed:", err);
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
  const userId = localStorage.getItem("currentUserId");
  
  if (!userId) {
    return {
      userId: null,
      username: null,
      email: null,
      displayName: null,
      bio: null,
      profileImageUrl: null
    };
  }
  
  return {
    userId,
    username: localStorage.getItem(`user_${userId}_username`),
    email: localStorage.getItem(`user_${userId}_email`),
    displayName: localStorage.getItem(`user_${userId}_displayName`),
    bio: localStorage.getItem(`user_${userId}_bio`),
    profileImageUrl: localStorage.getItem(`user_${userId}_profileImageUrl`)
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