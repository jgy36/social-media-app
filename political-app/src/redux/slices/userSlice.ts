/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/redux/slices/userSlice.ts - Fixed for TypeScript null/undefined issues
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/api"; // Import the default API object
import { clearCommunities } from "./communitySlice";
import {
  setUserData,
  getUserData,
  clearUserData,
  setAuthenticated,
} from "@/utils/tokenUtils";

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
};

// Restore auth state from client-side storage
export const restoreAuthState = createAsyncThunk(
  "user/restoreAuthState",
  async (_, { rejectWithValue }) => {
    try {
      // Import auth module dynamically to avoid circular dependencies
      const auth = await import("@/api/auth");

      // Check with the server if we have a valid session
      const isAuthenticated = await auth.checkAndRestoreSession();

      if (isAuthenticated) {
        // Get user info from localStorage
        const userData = getUserData();

        if (userData.id) {
          return {
            id: userData.id ? parseInt(String(userData.id)) : null,
            username: userData.username,
            token: null, // Don't attempt to store token in Redux state
            email: userData.email,
            displayName: userData.displayName,
            bio: userData.bio,
            profileImageUrl: userData.profileImageUrl,
            isAuthenticated: true,
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
    setAuthenticated(true);

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

    return {
      id: response.user?.id || null,
      username: response.user?.username || null,
      email: response.user?.email || email || null,
      token: response.token || null, // Use actual token if provided
      displayName: response.user?.displayName || null,
      bio: response.user?.bio || null,
      profileImageUrl: response.user?.profileImageUrl || null,
      isAuthenticated: true,
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
    }: { username: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // Use the API structure for registration
      const response = await api.auth.register({
        username,
        email,
        password,
      });

      if (!response.success) {
        throw new Error(response.message || "Registration failed");
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

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

        // Update localStorage with the new data for cross-tab consistency
        if (userData.id) {
          setUserData({
            id: userData.id,
            username: userData.username || "",
            email: userData.email || "",
            // Fix type issues
            displayName: userData.displayName || undefined,
            bio: userData.bio || undefined,
            profileImageUrl: userData.profileImageUrl || undefined,
          });

          // Explicitly notify components of profile image update
          if (userData.profileImageUrl) {
            window.dispatchEvent(
              new CustomEvent("profileImageUpdated", {
                detail: userData.profileImageUrl,
              })
            );
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

      // Update localStorage with the new values
      if (state.user.id) {
        const userId = state.user.id.toString();
        const userData = getUserData();

        // Store profile image without timestamp to keep it consistent
        const profileImageUrl =
          profileData.profileImageUrl || userData.profileImageUrl;

        // Store data in both localStorage (for persistence) and sessionStorage (for current session)
        setUserData({
          id: state.user.id,
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

        // If profile image was updated, we should explicitly notify components
        if (profileData.profileImageUrl) {
          console.log("Dispatching profileImageUpdated event from Redux");
          window.dispatchEvent(
            new CustomEvent("profileImageUpdated", {
              detail: profileData.profileImageUrl,
            })
          );
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
        // Get current user info from localStorage
        const userInfo = auth.getCurrentUserInfo();

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

// Logout async thunk
export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { dispatch }) => {
    try {
      // Import auth dynamically to avoid circular dependencies
      const auth = await import("@/api/auth");
      await auth.logout();

      // Clear communities
      dispatch(clearCommunities());

      // Clear all stored user data
      clearUserData();

      return true;
    } catch (error) {
      console.error("Logout error:", error);

      // Still clear data even if API call fails
      clearUserData();
      dispatch(clearCommunities());

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
      state.displayName = action.payload.displayName;
      state.bio = action.payload.bio;
      state.profileImageUrl = action.payload.profileImageUrl;
      state.isAuthenticated = action.payload.isAuthenticated;
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
      state.displayName = action.payload.displayName;
      state.bio = action.payload.bio;
      state.profileImageUrl = action.payload.profileImageUrl;
      state.isAuthenticated = action.payload.isAuthenticated;
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
      state.displayName = action.payload.displayName;
      state.bio = action.payload.bio;
      state.profileImageUrl = action.payload.profileImageUrl;
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

        if (action.payload.displayName) {
          state.displayName = action.payload.displayName;
        }

        if (action.payload.bio) {
          state.bio = action.payload.bio;
        }

        if (action.payload.profileImageUrl) {
          state.profileImageUrl = action.payload.profileImageUrl;
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

export const { forceAuthenticated } = userSlice.actions;

export default userSlice.reducer;
