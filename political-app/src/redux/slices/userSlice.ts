// src/redux/slices/userSlice.ts - Complete file

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import api from "@/api"; // Import the default API object

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

// Restore auth state from local storage/cookies
export const restoreAuthState = createAsyncThunk(
  "user/restoreAuthState",
  async (_, { rejectWithValue }) => {
    try {
      // First try to get data from localStorage (for better persistence)
      let token: string | null = null;
      let username: string | null = null;
      let userId: string | null = null;
      let email: string | null = null;
      let displayName: string | null = null;
      let bio: string | null = null;
      let profileImageUrl: string | null = null;

      // Try localStorage first (better persistence)
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
        username = localStorage.getItem("username");
        email = localStorage.getItem("email");
        displayName = localStorage.getItem("displayName");
        bio = localStorage.getItem("bio");
        profileImageUrl = localStorage.getItem("profileImageUrl");
        const storedId = localStorage.getItem("userId");
        userId = storedId ? String(parseInt(storedId)) : null;
      }

      // If not in localStorage, try cookies
      if (!token && typeof getCookie === "function") {
        try {
          token = (getCookie("token") as string) || null;
          username = (getCookie("username") as string) || null;
          email = (getCookie("email") as string) || null;
          displayName = (getCookie("displayName") as string) || null;
          bio = (getCookie("bio") as string) || null;
          profileImageUrl = (getCookie("profileImageUrl") as string) || null;
          const cookieId = getCookie("userId");
          userId = cookieId ? String(Number(cookieId)) : null;
        } catch (cookieError) {
          console.error("Error reading cookies:", cookieError);
        }
      }

      // Return the auth data with proper types
      return {
        id: userId,
        token,
        username: username || null,
        email: email || null,
        displayName: displayName || null,
        bio: bio || null,
        profileImageUrl: profileImageUrl || null,
      };
    } catch (error) {
      console.error("Uncaught error in restoreAuthState:", error);
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
    // Use the new API structure
    const response = await api.auth.login({ email, password });

    // Ensure we have proper response
    if (!response.token || !response.user) {
      throw new Error("Invalid response from server");
    }

    // Persist data immediately after successful login
    if (typeof window !== "undefined") {
      localStorage.setItem("token", response.token);
      localStorage.setItem("username", response.user.username || "User");
      localStorage.setItem("userId", String(response.user.id));
      localStorage.setItem("email", email); // Store the email too
      
      // Store additional profile fields if available
      if (response.user.displayName) {
        localStorage.setItem("displayName", response.user.displayName);
      }
      if (response.user.bio) {
        localStorage.setItem("bio", response.user.bio);
      }
      if (response.user.profileImageUrl) {
        localStorage.setItem("profileImageUrl", response.user.profileImageUrl);
      }

      // Also set cookies as fallback
      setCookie("token", response.token, { path: "/" });
      setCookie("username", response.user.username || "User", { path: "/" });
      setCookie("userId", String(response.user.id), { path: "/" });
      setCookie("email", email, { path: "/" });
      
      // Set additional profile fields in cookies too
      if (response.user.displayName) {
        setCookie("displayName", response.user.displayName, { path: "/" });
      }
      if (response.user.bio) {
        setCookie("bio", response.user.bio, { path: "/" });
      }
      if (response.user.profileImageUrl) {
        setCookie("profileImageUrl", response.user.profileImageUrl, { path: "/" });
      }
    }

    return {
      id: response.user?.id || null,
      username: response.user?.username || null,
      email: email || null,
      token: response.token || null,
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
      // Use the new API structure
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
    if (!state.user.token) {
      throw new Error("Not authenticated");
    }

    if (!profileData) {
      // If no data provided, just get the latest profile
      const userData = await api.users.getCurrentUser();

      if (!userData) {
        throw new Error("Failed to refresh user profile");
      }

      // Update localStorage and cookies with newest data
      if (typeof window !== "undefined") {
        localStorage.setItem("username", userData.username || "User");
        setCookie("username", userData.username || "User", { path: "/" });
        
        // Store additional fields if available
        if (userData.displayName) {
          localStorage.setItem("displayName", userData.displayName);
          setCookie("displayName", userData.displayName, { path: "/" });
        }
        if (userData.bio) {
          localStorage.setItem("bio", userData.bio);
          setCookie("bio", userData.bio, { path: "/" });
        }
        if (userData.profileImageUrl) {
          localStorage.setItem("profileImageUrl", userData.profileImageUrl);
          setCookie("profileImageUrl", userData.profileImageUrl, { path: "/" });
        }
      }

      return {
        id: userData.id || null,
        username: userData.username || null,
        token: state.user.token,
        displayName: userData.displayName || null,
        bio: userData.bio || null,
        profileImageUrl: userData.profileImageUrl || null,
      };
    } else {
      // If profile data is provided, update with new values
      // In a real app, you would send this data to the server
      // For now, we'll just update local storage and return the new state
      
      const updatedUsername = profileData.username || state.user.username;
      const updatedDisplayName = profileData.displayName || state.user.displayName;
      const updatedBio = profileData.bio !== undefined ? profileData.bio : state.user.bio;
      const updatedProfileImageUrl = profileData.profileImageUrl || state.user.profileImageUrl;
      
      // Update localStorage and cookies
      if (typeof window !== "undefined") {
        if (updatedUsername) {
          localStorage.setItem("username", updatedUsername);
          setCookie("username", updatedUsername, { path: "/" });
        }
        
        if (updatedDisplayName) {
          localStorage.setItem("displayName", updatedDisplayName);
          setCookie("displayName", updatedDisplayName, { path: "/" });
        }
        
        if (updatedBio) {
          localStorage.setItem("bio", updatedBio);
          setCookie("bio", updatedBio, { path: "/" });
        }
        
        if (updatedProfileImageUrl) {
          localStorage.setItem("profileImageUrl", updatedProfileImageUrl);
          setCookie("profileImageUrl", updatedProfileImageUrl, { path: "/" });
        }
      }
      
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

// Persist auth data helper function - updated to handle new fields
const persistAuthData = (
  id: number | null,
  token: string | null,
  username: string | null,
  email: string | null,
  displayName: string | null,
  bio: string | null,
  profileImageUrl: string | null
) => {
  if (typeof window !== "undefined") {
    try {
      if (token && username && id !== null) {
        // Persist to localStorage (better for persistence)
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("userId", String(id));
        if (email) {
          localStorage.setItem("email", email);
        }
        if (displayName) {
          localStorage.setItem("displayName", displayName);
        }
        if (bio) {
          localStorage.setItem("bio", bio);
        }
        if (profileImageUrl) {
          localStorage.setItem("profileImageUrl", profileImageUrl);
        }

        // Also set cookies as fallback
        setCookie("token", token, { path: "/" });
        setCookie("username", username, { path: "/" });
        setCookie("userId", String(id), { path: "/" });
        if (email) {
          setCookie("email", email, { path: "/" });
        }
        if (displayName) {
          setCookie("displayName", displayName, { path: "/" });
        }
        if (bio) {
          setCookie("bio", bio, { path: "/" });
        }
        if (profileImageUrl) {
          setCookie("profileImageUrl", profileImageUrl, { path: "/" });
        }
      } else {
        // Clear data
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("displayName");
        localStorage.removeItem("bio");
        localStorage.removeItem("profileImageUrl");
        
        deleteCookie("token");
        deleteCookie("username");
        deleteCookie("userId");
        deleteCookie("email");
        deleteCookie("displayName");
        deleteCookie("bio");
        deleteCookie("profileImageUrl");
      }
    } catch (error) {
      console.error("Error persisting auth data:", error);
    }
  }
};

// Create slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.id = null;
      state.token = null;
      state.username = null;
      state.email = null;
      state.displayName = null;
      state.bio = null;
      state.profileImageUrl = null;
      state.loading = false;
      state.error = null;

      // Clear persisted data
      persistAuthData(null, null, null, null, null, null, null);
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
      state.id = action.payload.id ? parseInt(action.payload.id, 10) : null;
      state.token = action.payload.token;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName;
      state.bio = action.payload.bio;
      state.profileImageUrl = action.payload.profileImageUrl;
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
  },
});

export const { logoutUser } = userSlice.actions;
export default userSlice.reducer;