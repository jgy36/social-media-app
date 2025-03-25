/* eslint-disable @typescript-eslint/no-explicit-any */
// Enhanced: political-app/src/redux/slices/userSlice.ts

import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { api } from "@/api";  // Import from new API structure

// Define the RootState type (to fix the RootState error)
interface RootState {
  user: UserState;
  // Add other state slices as needed
}

// Define the initial state with proper types
interface UserState {
  id: number | null;
  token: string | null;
  username: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  id: null,
  token: null,
  username: null,
  email: null,
  loading: false,
  error: null,
};

// Define response type to fix the errors
interface AuthResponse {
  id: number;
  token: string;
  username: string;
  email: string;
}

// Restore auth state from local storage/cookies
export const restoreAuthState = createAsyncThunk(
  "user/restoreAuthState",
  async (_, { rejectWithValue }) => {
    try {
      // First try to get token from localStorage (for better persistence)
      let token = null;
      let username = null;
      let userId = null;
      let email = null;

      // Try localStorage first (better persistence)
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
        username = localStorage.getItem("username");
        email = localStorage.getItem("email");
        const storedId = localStorage.getItem("userId");
        userId = storedId ? parseInt(storedId) : null;
      }

      // If not in localStorage, try cookies
      if (!token && typeof getCookie === "function") {
        try {
          token = (getCookie("token") as string) || null;
          username = (getCookie("username") as string) || null;
          email = (getCookie("email") as string) || null;
          const cookieId = getCookie("userId");
          userId = cookieId ? Number(cookieId) : null;
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
      };
    } catch (error) {
      console.error("Uncaught error in restoreAuthState:", error);
      return rejectWithValue("Failed to restore authentication state");
    }
  }
);

// Define async login
export const loginUser = createAsyncThunk<
  { id: number | null; username: string | null; email: string | null; token: string | null },
  { email: string; password: string }
>(
  "user/login",
  async ({ email, password }, { rejectWithValue }) => {
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

        // Also set cookies as fallback
        setCookie("token", response.token, { path: "/" });
        setCookie("username", response.user.username || "User", { path: "/" });
        setCookie("userId", String(response.user.id), { path: "/" });
        setCookie("email", email, { path: "/" }); // Store email in cookie too
      }

      return {
        id: response.user?.id || null,
        username: response.user?.username || null,
        email: email || null,
        token: response.token || null,
      };
    } catch (error) {
      console.error("Login error:", error);
      return rejectWithValue((error as Error).message);
    }
  }
);

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
        password
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

// Add this new thunk to update the username
export const updateUserProfile = createAsyncThunk<
  { id: number | null; username: string | null; token: string | null },
  void,
  { state: RootState }
>(
  "user/updateProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      if (!state.user.token) {
        throw new Error("Not authenticated");
      }

      // Get the latest user profile from the API using the new structure
      const userData = await api.users.getCurrentUser();
      
      if (!userData) {
        throw new Error("Failed to refresh user profile");
      }

      // Update localStorage and cookies with newest data
      if (typeof window !== "undefined") {
        localStorage.setItem("username", userData.username || "User");

        // Also set cookies as fallback
        setCookie("username", userData.username || "User", { path: "/" });
      }

      return {
        id: userData.id || null,
        username: userData.username || null,
        token: state.user.token, // Keep existing token
      };
    } catch (error) {
      console.error("Profile refresh error:", error);
      return rejectWithValue((error as Error).message);
    }
  }
);

// Persist auth data helper function
const persistAuthData = (id: number | null, token: string | null, username: string | null, email: string | null) => {
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
        
        // Also set cookies as fallback
        setCookie("token", token, { path: "/" });
        setCookie("username", username, { path: "/" });
        setCookie("userId", String(id), { path: "/" });
        if (email) {
          setCookie("email", email, { path: "/" });
        }
      } else {
        // Clear data
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        deleteCookie("token");
        deleteCookie("username");
        deleteCookie("userId");
        deleteCookie("email");
      }
    } catch (error) {
      console.error('Error persisting auth data:', error);
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
      state.loading = false;
      state.error = null;

      // Clear persisted data
      persistAuthData(null, null, null, null);
    },
  },

  extraReducers: (builder) => {
    // Login states
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.id = action.payload.id;
      state.token = action.payload.token;
      state.username = action.payload.username;
      state.email = action.payload.email;
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
      state.id = action.payload.id;
      state.token = action.payload.token;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.loading = false;
      state.error = null;
    });

    builder.addCase(restoreAuthState.rejected, (state, action) => {
      state.id = null;
      state.token = null;
      state.username = null;
      state.email = null;
      state.loading = false;
      state.error = (action.payload as string) || "Failed to restore auth state";
    });

    // Handle updateUserProfile
    builder.addCase(updateUserProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
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