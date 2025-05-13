/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/redux/slices/userSlice.ts - React Native version with fixed types
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from "@/api"; // Import the default API object
import { clearCommunities } from "./communitySlice";
import { setUserData, getUserData, clearUserData, setAuthenticated, getToken } from "@/utils/tokenUtils";

// Define the RootState type (to fix the RootState error)
interface RootState {
  user: UserState;
  // Add other state slices as needed
}

// Enhanced User State with additional profile fields
interface UserState {
  id: number | null;
  token: string | null;
  username: string | null;
  email: string | null;
  displayName: string | null; // New field for full name
  bio: string | null; // New field for bio
  profileImageUrl: string | null; // New field for profile image
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean; // Add explicit authenticated flag
  role: "USER" | "ADMIN" | null; // Add role field
}

const initialState: UserState = {
  id: null,
  token: null,
  username: null,
  email: null,
  displayName: null, // Initialize new fields
  bio: null,
  profileImageUrl: null,
  loading: false,
  error: null,
  isAuthenticated: false, // Initialize as not authenticated
  role: null, // Initialize role as null
};

// Helper function to convert undefined to null for string fields
const toStringOrNull = (value: string | null | undefined): string | null => {
  return value === undefined ? null : value;
};

// Restore auth state from AsyncStorage
export const restoreAuthState = createAsyncThunk(
  "user/restoreAuthState",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Import auth module dynamically to avoid circular dependencies
      const auth = await import("@/api/auth");

      // Check with the server if we have a valid session
      const isAuthenticated = await auth.checkAndRestoreSession();

      if (isAuthenticated) {
        // Get user info from AsyncStorage/tokenUtils
        const userData = await getUserData();
        // Get token from AsyncStorage/tokenUtils
        const token = await getToken();

        // Add this new code: If authenticated, also restore badges
        if (userData.id) {
          try {
            // Import badge restoration functionality
            const { fetchUserBadges } = await import("./badgeSlice");

            // Dispatch badge fetch
            dispatch(fetchUserBadges());
            console.log(
              "Badge restoration initiated during auth state restoration"
            );
          } catch (badgeError) {
            console.error(
              "Failed to restore badges during auth restoration:",
              badgeError
            );
            // Continue with auth restoration even if badge fetch fails
          }

          return {
            id: userData.id ? parseInt(String(userData.id)) : null,
            username: toStringOrNull(userData.username),
            token: token, // Use token from AsyncStorage instead of null
            email: toStringOrNull(userData.email),
            displayName: toStringOrNull(userData.displayName),
            bio: toStringOrNull(userData.bio),
            profileImageUrl: toStringOrNull(userData.profileImageUrl),
            isAuthenticated: true,
            role: userData.role || "USER", // Add role with default value
          };
        }
      }

      // If not authenticated, return null values
      return {
        id: null,
        token: null,
        username: null,
        email: null,
        displayName: null,
        bio: null,
        profileImageUrl: null,
        isAuthenticated: false,
        role: null, // Add role as null for unauthenticated state
      };
    } catch (error) {
      console.error("Error restoring auth state:", error);
      return rejectWithValue("Failed to restore authentication state");
    }
  }
);

// Define async login
export const loginUser = createAsyncThunk<
  {
    id: number | null;
    username: string | null;
    email: string | null;
    token: string | null;
    displayName: string | null;
    bio: string | null;
    profileImageUrl: string | null;
    isAuthenticated: boolean;
    role: "USER" | "ADMIN" | null;
  },
  { email: string; password: string }
>("user/login", async ({ email, password }, { dispatch, rejectWithValue }) => {
  try {
    // Use the auth module to login
    const response = await api.auth.login({ email, password });

    // Ensure we have proper response
    if (!response.user) {
      throw new Error("Invalid response from server");
    }

    // Mark as authenticated
    await setAuthenticated(true);

    // After successful login, restore user's communities
    try {
      // Import the community thunk dynamically
      const { fetchAndRestoreUserCommunities } = await import(
        "./communitySlice"
      );

      // Dispatch the thunk to restore communities
      dispatch(fetchAndRestoreUserCommunities());
    } catch (communitiesError) {
      console.error(
        "Failed to restore communities after login:",
        communitiesError
      );
      // Continue with login even if community restoration fails
    }

    // NEW CODE: Restore user badges from the server after login
    try {
      // Import the badge fetch thunk dynamically
      const { fetchUserBadges } = await import("./badgeSlice");

      // Dispatch the thunk to restore badges from server
      dispatch(fetchUserBadges());
      console.log("Badge restoration initiated after login");
    } catch (badgesError) {
      console.error("Failed to restore badges after login:", badgesError);
      // Continue with login even if badge restoration fails
    }

    return {
      id: response.user?.id || null,
      username: toStringOrNull(response.user?.username),
      email: toStringOrNull(response.user?.email || email),
      token: response.token || null, // Use actual token if provided
      displayName: toStringOrNull(response.user?.displayName),
      bio: toStringOrNull(response.user?.bio),
      profileImageUrl: toStringOrNull(response.user?.profileImageUrl),
      isAuthenticated: true,
      role: response.user?.role || null, // Extract role from response
    };
  } catch (error) {
    console.error("Login error:", error);
    return rejectWithValue((error as Error).message);
  }
});

// Define async register
export const registerUser = createAsyncThunk(
  "user/register",
  async (
    {
      username,
      email,
      password,
      displayName,
    }: {
      username: string;
      email: string;
      password: string;
      displayName: string;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      console.log("Registering user with displayName:", displayName);

      // Use the API structure for registration
      const response = await api.auth.register({
        username,
        email,
        password,
        displayName,
      });

      if (!response.success) {
        throw new Error(response.message || "Registration failed");
      }

      // After successful registration, immediately login
      try {
        await dispatch(loginUser({ email, password })).unwrap();

        // Explicitly update the display name in Redux state
        dispatch({
          type: "user/setDisplayName",
          payload: displayName,
        });
      } catch (loginError) {
        console.error("Auto-login after registration failed:", loginError);
        // Continue with registration response even if auto-login fails
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Save profile image update event in React Native (using DeviceEventEmitter)
import { DeviceEventEmitter } from 'react-native';

// Updated thunk to support updating additional profile fields
export const updateUserProfile = createAsyncThunk<
  {
    id: number | null;
    username: string | null;
    token: string | null;
    displayName: string | null;
    bio: string | null;
    profileImageUrl: string | null;
    isAuthenticated: boolean;
  },
  {
    username?: string;
    displayName?: string;
    bio?: string;
    profileImageUrl?: string;
  } | void,
  { state: RootState }
>("user/updateProfile", async (profileData, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    // Check if we're authenticated
    if (!state.user.isAuthenticated) {
      throw new Error("Not authenticated");
    }

    if (!profileData) {
      // If no data provided, just get the latest profile from the server
      try {
        // Get the current user's profile from the API
        const userData = await api.users.getCurrentUser();

        if (!userData) {
          throw new Error("Failed to refresh user profile");
        }

        // Update AsyncStorage with the new data for cross-tab consistency
        if (userData.id) {
          await setUserData({
            id: String(userData.id), // Convert number to string
            username: userData.username || "",
            email: userData.email || "",
            // Fix type issues
            displayName: userData.displayName || undefined,
            bio: userData.bio || undefined,
            profileImageUrl: userData.profileImageUrl || undefined,
          });

          // Emit event for profile image update in React Native
          if (userData.profileImageUrl) {
            DeviceEventEmitter.emit('profileImageUpdated', userData.profileImageUrl);
          }
        }

        return {
          id: userData.id || null,
          username: userData.username || null,
          token: state.user.token,
          displayName: userData.displayName || null,
          bio: userData.bio || null,
          profileImageUrl: userData.profileImageUrl || null,
          isAuthenticated: true,
        };
      } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
    } else {
      // If profile data is provided, create updated state
      console.log("Updating user profile with:", profileData);

      // Update AsyncStorage with the new values
      if (state.user.id) {
        const userData = await getUserData();

        // Store profile image without timestamp to keep it consistent
        const profileImageUrl =
          profileData.profileImageUrl || userData.profileImageUrl;

        // Store data in AsyncStorage (for persistence)
        await setUserData({
          id: String(state.user.id), // Convert number to string
          username: profileData.username || state.user.username || "",
          email: userData.email || "",
          // Fix type issues by passing undefined instead of null
          displayName:
            profileData.displayName !== undefined
              ? profileData.displayName
              : undefined,
          bio: profileData.bio !== undefined ? profileData.bio : undefined,
          profileImageUrl: profileImageUrl || undefined,
        });

        // If profile image was updated, emit event
        if (profileData.profileImageUrl) {
          console.log("Emitting profileImageUpdated event from Redux");
          DeviceEventEmitter.emit('profileImageUpdated', profileData.profileImageUrl);
        }
      }

      return {
        id: state.user.id,
        username: profileData.username || state.user.username,
        token: state.user.token,
        displayName:
          profileData.displayName !== undefined
            ? profileData.displayName
            : state.user.displayName,
        bio: profileData.bio !== undefined ? profileData.bio : state.user.bio,
        profileImageUrl:
          profileData.profileImageUrl || state.user.profileImageUrl,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error("Profile update error:", error);
    return rejectWithValue((error as Error).message);
  }
});

// Check initial auth state on app load
export const checkInitialAuth = createAsyncThunk(
  "user/checkInitialAuth",
  async () => {
    try {
      // Import dynamically to avoid circular dependencies
      const auth = await import("@/api/auth");
      const isAuthenticated = await auth.checkAuthStatus();

      if (isAuthenticated) {
        // Get current user info from AsyncStorage
        const userInfo = await auth.getCurrentUserInfo();

        // If we have user info, return it
        if (userInfo.username && userInfo.userId) {
          return {
            isAuthenticated: true,
            id: parseInt(userInfo.userId),
            username: userInfo.username,
            displayName: userInfo.displayName,
            bio: userInfo.bio,
            profileImageUrl: userInfo.profileImageUrl,
          };
        }

        // Otherwise just return authenticated status
        return { isAuthenticated: true };
      }

      return { isAuthenticated: false };
    } catch (error) {
      console.error("Auth check error:", error);
      return { isAuthenticated: false };
    }
  }
);

// Extract from userSlice.ts - Update the logoutUser function
export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { dispatch }) => {
    try {
      // Import auth dynamically to avoid circular dependencies
      const auth = await import("@/api/auth");
      await auth.logout();

      // Clear communities
      dispatch(clearCommunities());

      // Also clear badges - Import the action
      const { clearBadges } = await import("./badgeSlice");
      dispatch(clearBadges());

      // Clear all stored user data
      await clearUserData();

      return true;
    } catch (error) {
      console.error("Logout error:", error);

      // Still clear data even if API call fails
      await clearUserData();
      dispatch(clearCommunities());

      // Make sure badges are cleared even on API failure
      const { clearBadges } = await import("./badgeSlice");
      dispatch(clearBadges());

      return false;
    }
  }
);

// Create slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    forceAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },

    // Add the setDisplayName reducer
    setDisplayName: (state, action: PayloadAction<string>) => {
      const displayName = action.payload;
      state.displayName = displayName;

      // Also update in AsyncStorage for persistence
      if (state.id) {
        const userId = state.id.toString();
        AsyncStorage.setItem(`user_${userId}_displayName`, displayName);

        // Emit a custom event that components can listen for
        DeviceEventEmitter.emit('userProfileUpdated', { displayName });
      }
    },
    // Add setAuthState reducer for handling 2FA auth
    setAuthState: (
      state,
      action: PayloadAction<{
        token: string;
        user?: {
          id?: number;
          username?: string;
          email?: string;
          displayName?: string;
          bio?: string;
          profileImageUrl?: string;
          role?: "USER" | "ADMIN";
        };
      }>
    ) => {
      // Set token
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      // Set user data if available
      if (action.payload.user) {
        if (action.payload.user.id) state.id = action.payload.user.id;
        if (action.payload.user.username)
          state.username = action.payload.user.username;
        if (action.payload.user.email) state.email = action.payload.user.email;
        if (action.payload.user.displayName !== undefined)
          state.displayName = toStringOrNull(action.payload.user.displayName);
        if (action.payload.user.bio !== undefined) state.bio = toStringOrNull(action.payload.user.bio);
        if (action.payload.user.profileImageUrl !== undefined)
          state.profileImageUrl = toStringOrNull(action.payload.user.profileImageUrl);
        if (action.payload.user.role) state.role = action.payload.user.role;
      }
    },
  },
  extraReducers: (builder) => {
    // Login states
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.id = action.payload.id !== undefined ? action.payload.id : null;
      state.token = action.payload.token;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.displayName = toStringOrNull(action.payload.displayName);
      state.bio = toStringOrNull(action.payload.bio);
      state.profileImageUrl = toStringOrNull(action.payload.profileImageUrl);
      state.isAuthenticated = action.payload.isAuthenticated;
      state.role = action.payload.role; // Add role from backend response
      state.loading = false;
      state.error = null;
    });

    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Login failed";
      state.isAuthenticated = false;
    });

    // Restore auth state
    builder.addCase(restoreAuthState.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(restoreAuthState.fulfilled, (state, action) => {
      state.id = action.payload.id;
      state.token = action.payload.token;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.displayName = toStringOrNull(action.payload.displayName);
      state.bio = toStringOrNull(action.payload.bio);
      state.profileImageUrl = toStringOrNull(action.payload.profileImageUrl);
      state.isAuthenticated = action.payload.isAuthenticated;
      state.role = action.payload.role; // Add role
      state.loading = false;
      state.error = null;
    });

    builder.addCase(restoreAuthState.rejected, (state, action) => {
      state.id = null;
      state.token = null;
      state.username = null;
      state.email = null;
      state.displayName = null;
      state.bio = null;
      state.profileImageUrl = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error =
        (action.payload as string) || "Failed to restore auth state";
    });

    // Handle updateUserProfile
    builder.addCase(updateUserProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.displayName = toStringOrNull(action.payload.displayName);
      state.bio = toStringOrNull(action.payload.bio);
      state.profileImageUrl = toStringOrNull(action.payload.profileImageUrl);
      state.isAuthenticated = action.payload.isAuthenticated;
      // Only update token if provided
      if (action.payload.token) {
        state.token = action.payload.token;
      }
      state.loading = false;
      state.error = null;
    });

    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Failed to update profile";
    });

    // Handle checkInitialAuth
    builder.addCase(checkInitialAuth.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(checkInitialAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = action.payload.isAuthenticated;

      if (action.payload.isAuthenticated) {
        // If we have more user data, use it
        if (action.payload.id) {
          state.id = action.payload.id;
        }

        if (action.payload.username) {
          state.username = action.payload.username;
        }

        if (action.payload.displayName !== undefined) {
          state.displayName = toStringOrNull(action.payload.displayName);
        }

        if (action.payload.bio !== undefined) {
          state.bio = toStringOrNull(action.payload.bio);
        }

        if (action.payload.profileImageUrl !== undefined) {
          state.profileImageUrl = toStringOrNull(action.payload.profileImageUrl);
        }
      } else {
        // Reset state if not authenticated
        state.id = null;
        state.token = null;
        state.username = null;
        state.email = null;
        state.displayName = null;
        state.bio = null;
        state.profileImageUrl = null;
      }
    });

    builder.addCase(checkInitialAuth.rejected, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.id = null;
      state.token = null;
      state.username = null;
      state.email = null;
      state.displayName = null;
      state.bio = null;
      state.profileImageUrl = null;
    });

    // Handle logoutUser
    builder.addCase(logoutUser.fulfilled, (state) => {
      // Reset state to initial values
      state.id = null;
      state.token = null;
      state.username = null;
      state.email = null;
      state.displayName = null;
      state.bio = null;
      state.profileImageUrl = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    });
  },
});

export const { forceAuthenticated, setDisplayName, setAuthState } =
  userSlice.actions;
export default userSlice.reducer;