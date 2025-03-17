/* eslint-disable @typescript-eslint/no-explicit-any */
// Enhanced: political-app/src/redux/slices/userSlice.ts

import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

// Define the initial state
interface UserState {
  id: number | null;
  token: string | null;
  username: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  id: null,
  token: null,
  username: null,
  loading: false,
  error: null
};

// Restore auth state from local storage/cookies
export const restoreAuthState = createAsyncThunk(
  "user/restoreAuthState",
  async (_, { rejectWithValue }) => {
    try {
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
      }
      
      // If not in localStorage, try cookies
      if (!token && typeof getCookie === "function") {
        try {
          token = getCookie("token") as string || null;
          username = getCookie("username") as string || null;
          const cookieId = getCookie("userId");
          userId = cookieId ? Number(cookieId) : null;
        } catch (cookieError) {
          console.error('Error reading cookies:', cookieError);
        }
      }
      
      // Return the auth data
      return {
        id: userId,
        token,
        username: username || "User", 
      };
    } catch (error) {
      console.error('Uncaught error in restoreAuthState:', error);
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
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.user) {
        throw new Error(data.message || "Login failed");
      }

      // Persist data immediately after successful login
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username || "User");
        localStorage.setItem("userId", String(data.user.id));
        
        // Also set cookies as fallback
        setCookie("token", data.token, { path: "/" });
        setCookie("username", data.user.username || "User", { path: "/" });
        setCookie("userId", String(data.user.id), { path: "/" });
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
      } else {
        // Clear data
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userId");
        deleteCookie("token");
        deleteCookie("username");
        deleteCookie("userId");
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
      state.loading = false;
      state.error = null;
      
      // Clear persisted data
      persistAuthData(null, null, null);
    },
  },

  extraReducers: (builder) => {
    // Login states
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    builder.addCase(
      loginUser.fulfilled,
      (
        state,
        action: PayloadAction<{ id: number; token: string; username: string }>
      ) => {
        state.id = action.payload.id;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.loading = false;
        state.error = null;
      }
    );
    
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || "Login failed";
    });
    
    // Restore auth state
    builder.addCase(restoreAuthState.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    builder.addCase(
      restoreAuthState.fulfilled,
      (
        state,
        action: PayloadAction<{ id: number | null; token: string | null; username: string | null }>
      ) => {
        state.id = action.payload.id;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.loading = false;
        state.error = null;
      }
    );
    
    builder.addCase(restoreAuthState.rejected, (state, action) => {
      state.id = null;
      state.token = null;
      state.username = null;
      state.loading = false;
      state.error = action.payload as string || "Failed to restore auth state";
    });
  },
});

export const { logoutUser } = userSlice.actions;
export default userSlice.reducer;