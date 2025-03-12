/* eslint-disable @typescript-eslint/no-explicit-any */
// Enhanced: political-app/src/redux/slices/userSlice.ts

import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

// Define the initial state
interface UserState {
  id: number | null;
  token: string | null;
  username: string | null;
}

const initialState: UserState = {
  id: null,
  token: null,
  username: null,
};

// Restore auth state from local storage/cookies
export const restoreAuthState = createAsyncThunk(
  "user/restoreAuthState",
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 userSlice: Starting to restore auth state');
      
      // First try to get token from localStorage (for better persistence)
      let token = null;
      let username = null;
      let userId = null;
      
      // Try localStorage first (better persistence)
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
        username = localStorage.getItem("username");
        const storedId = localStorage.getItem("userId");
        userId = storedId ? parseInt(storedId) : null;
        
        console.log('🔍 userSlice: From localStorage:', { token, username, userId });
      }
      
      // If not in localStorage, try cookies
      if (!token && typeof getCookie === "function") {
        try {
          token = getCookie("token") as string || null;
          username = getCookie("username") as string || null;
          const cookieId = getCookie("userId");
          userId = cookieId ? Number(cookieId) : null;
          
          console.log('🔍 userSlice: From cookies:', { token, username, userId });
        } catch (cookieError) {
          console.error('❌ userSlice: Error reading cookies:', cookieError);
        }
      }
      
      // If token exists, validate it silently (optional)
      if (token) {
        try {
          // Instead of making an API call, just log and return the data for now
          console.log('✅ userSlice: Found stored auth data:', { userId, token: token?.substring(0, 10) + '...' });
          
          return {
            id: userId,
            token,
            username: username || "User", 
          };
        } catch (error) {
          console.error('❌ userSlice: Error in token validation:', error);
          
          // Clear invalid tokens but don't throw - just return empty state
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("userId");
          }
          
          try {
            if (typeof deleteCookie === "function") {
              deleteCookie("token");
              deleteCookie("username");
              deleteCookie("userId");
            }
          } catch (cookieError) {
            console.error('❌ userSlice: Error clearing cookies:', cookieError);
          }
          
          return { id: null, token: null, username: null };
        }
      }
      
      console.log('🔍 userSlice: No stored auth data found');
      return { id: null, token: null, username: null };
    } catch (error) {
      console.error('❌ userSlice: Uncaught error in restoreAuthState:', error);
      return rejectWithValue("Failed to restore authentication state");
    }
  }
);

// Define async login
export const loginUser = createAsyncThunk(
  "user/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("Attempting to log in...");

      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok || !data.user) {
        throw new Error(data.message || "Login failed");
      }

      return {
        id: data.user?.id || null,
        username: data.user?.username || "Unknown",
        token: data.token || null,
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
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Persist auth data helper function
const persistAuthData = (id: number | null, token: string | null, username: string | null) => {
  if (typeof window !== "undefined") {
    try {
      if (token && username && id !== null) {
        // Persist to localStorage (better for persistence)
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("userId", String(id));
        
        // Also set cookies as fallback
        setCookie("token", token, { path: "/" });
        setCookie("username", username, { path: "/" });
        setCookie("userId", String(id), { path: "/" });
        
        console.log('✅ userSlice: Auth data persisted successfully');
      } else {
        // Clear data
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userId");
        deleteCookie("token");
        deleteCookie("username");
        deleteCookie("userId");
        
        console.log('✅ userSlice: Auth data cleared successfully');
      }
    } catch (error) {
      console.error('❌ userSlice: Error persisting auth data:', error);
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
      
      // Clear persisted data
      persistAuthData(null, null, null);
    },
  },

  extraReducers: (builder) => {
    // Handle login success
    builder.addCase(
      loginUser.fulfilled,
      (
        state,
        action: PayloadAction<{ id: number; token: string; username: string }>
      ) => {
        state.id = action.payload.id;
        state.token = action.payload.token;
        state.username = action.payload.username;

        // Persist auth data
        persistAuthData(action.payload.id, action.payload.token, action.payload.username);
      }
    );
    
    // Handle restore auth state
    builder.addCase(
      restoreAuthState.fulfilled,
      (
        state,
        action: PayloadAction<{ id: number | null; token: string | null; username: string | null }>
      ) => {
        state.id = action.payload.id;
        state.token = action.payload.token;
        state.username = action.payload.username;
      }
    );
    
    // Handle restore auth state error
    builder.addCase(restoreAuthState.rejected, (state) => {
      // If restoration fails, ensure state is cleared
      state.id = null;
      state.token = null;
      state.username = null;
      console.log('❌ userSlice: Auth restoration failed, state cleared');
    });
  },
});

export const { logoutUser } = userSlice.actions;
export default userSlice.reducer;