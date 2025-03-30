/* eslint-disable @typescript-eslint/no-explicit-any */
// src/redux/slices/userSlice.ts - Updated for cookie-based auth
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api"; // Import the default API object
import { clearCommunities } from "./communitySlice";

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
        // Get minimal user info from session storage
        const userInfo = auth.getCurrentUserInfo();
        
        // Fetch the full profile if we have a user ID
        if (userInfo.userId) {
          try {
            // If we have a username, fetch the full profile
            if (userInfo.username) {
              const userProfile = await api.users.getUserProfile(userInfo.username);
              
              return {
                id: parseInt(userInfo.userId),
                username: userInfo.username,
                token: "authenticated-via-cookie", // Placeholder - real token is in HTTP-only cookie
                email: userProfile?.email || null,
                displayName: userProfile?.displayName || null,
                bio: userProfile?.bio || null,
                profileImageUrl: userProfile?.profileImageUrl || null
              };
            }
            
            // If we have user ID but no username, return basic info
            return {
              id: parseInt(userInfo.userId),
              username: userInfo.username,
              token: "authenticated-via-cookie",
              email: userInfo.email,
              displayName: userInfo.displayName,
              bio: userInfo.bio,
              profileImageUrl: userInfo.profileImageUrl
            };
          } catch (profileError) {
            console.error("Error fetching full profile:", profileError);
            
            // Return basic info if we couldn't get the full profile
            return {
              id: parseInt(userInfo.userId),
              username: userInfo.username,
              token: "authenticated-via-cookie",
              email: userInfo.email,
              displayName: userInfo.displayName,
              bio: userInfo.bio,
              profileImageUrl: userInfo.profileImageUrl
            };
          }
        }
        
        // If we're authenticated but don't have user info, return placeholder state
        return {
          id: null,
          username: userInfo.username || null,
          token: "authenticated-via-cookie",
          email: null,
          displayName: null,
          bio: null,
          profileImageUrl: null
        };
      }
      
      // If not authenticated, return null values
      return {
        id: null,
        token: null,
        username: null,
        email: null,
        displayName: null,
        bio: null,
        profileImageUrl: null
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
  },
  { email: string; password: string }
>("user/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    // Use the auth module to login
    const response = await api.auth.login({ email, password });

    // Ensure we have proper response
    if (!response.user) {
      throw new Error("Invalid response from server");
    }

    return {
      id: response.user?.id || null,
      username: response.user?.username || null,
      email: response.user?.email || email || null,
      token: response.token || "authenticated-via-cookie", // Token is now in HTTP-only cookie
      displayName: response.user?.displayName || null,
      bio: response.user?.bio || null,
      profileImageUrl: response.user?.profileImageUrl || null,
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
    if (!state.user.token) {
      throw new Error("Not authenticated");
    }

    if (!profileData) {
      // If no data provided, just get the latest profile from the server
      try {
        // Import dynamically to avoid circular dependencies
        const authModule = await import('@/api/auth');
        const isAuthenticated = await authModule.checkAuthStatus();
        
        if (!isAuthenticated) {
          throw new Error("Not authenticated");
        }
        
        const userInfo = authModule.getCurrentUserInfo();
        
        if (!userInfo.username) {
          throw new Error("Username not found");
        }
        
        const userData = await api.users.getUserProfile(userInfo.username);

        if (!userData) {
          throw new Error("Failed to refresh user profile");
        }

        return {
          id: userData.id || null,
          username: userData.username || null,
          token: state.user.token,
          displayName: userData.displayName || null,
          bio: userData.bio || null,
          profileImageUrl: userData.profileImageUrl || null,
        };
      } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
    } else {
      // If profile data is provided, update with new values
      // In a real implementation, you would send this to your backend API
      
      // For now, we'll just update our local state with the new values
      // and assume the actual profile update was successful
      const updatedUsername = profileData.username || state.user.username;
      const updatedDisplayName = profileData.displayName || state.user.displayName;
      const updatedBio = profileData.bio !== undefined ? profileData.bio : state.user.bio;
      const updatedProfileImageUrl = profileData.profileImageUrl || state.user.profileImageUrl;
      
      // In a real implementation, you would make an API call here to update the profile

      // Return updated user data
      return {
        id: state.user.id,
        username: updatedUsername,
        token: state.user.token,
        displayName: updatedDisplayName,
        bio: updatedBio,
        profileImageUrl: updatedProfileImageUrl,
      };
    }
  } catch (error) {
    console.error("Profile refresh error:", error);
    return rejectWithValue((error as Error).message);
  }
});

// Check initial auth state on app load
export const checkInitialAuth = createAsyncThunk(
  "user/checkInitialAuth",
  async () => {
    try {
      // Import dynamically to avoid circular dependencies
      const auth = await import('@/api/auth');
      const isAuthenticated = await auth.checkAuthStatus();
      
      if (isAuthenticated) {
        // Get current user info from session storage
        const userInfo = auth.getCurrentUserInfo();
        
        // If we have user info, return it
        if (userInfo.username && userInfo.userId) {
          return {
            isAuthenticated: true,
            id: parseInt(userInfo.userId),
            username: userInfo.username,
            // Auth token is in an HTTP-only cookie
            token: "authenticated-via-cookie"
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
      const auth = await import('@/api/auth');
      await auth.logout();
      
      // Clear communities
      dispatch(clearCommunities());
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }
);

// Create slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // We keep this empty because we're using thunks for all actions
    // The logout logic is handled by the logoutUser thunk
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
      state.loading = false;
      state.error = null;
    });

    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Login failed";
    });

    // Restore auth state
    builder.addCase(restoreAuthState.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(restoreAuthState.fulfilled, (state, action) => {
      if (action.payload.token) {
        state.id = action.payload.id;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.displayName = action.payload.displayName;
        state.bio = action.payload.bio;
        state.profileImageUrl = action.payload.profileImageUrl;
      } else {
        // Clear state if no token
        state.id = null;
        state.token = null;
        state.username = null;
        state.email = null;
        state.displayName = null;
        state.bio = null;
        state.profileImageUrl = null;
      }
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
      
      if (action.payload.isAuthenticated) {
        // If we have more user data, use it
        if (action.payload.id) {
          state.id = action.payload.id;
        }
        
        if (action.payload.username) {
          state.username = action.payload.username;
        }
        
        // Set token to a placeholder - actual token is in HTTP-only cookie
        state.token = "authenticated-via-cookie";
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
      state.loading = false;
      state.error = null;
    });
  },
});

export default userSlice.reducer;