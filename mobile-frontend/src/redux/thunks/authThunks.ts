/* eslint-disable @typescript-eslint/no-explicit-any */
// src/redux/thunks/authThunks.ts - React Native version
import { createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchWithToken } from "@/api/apiClient"; // ✅ Custom fetch helper

// Keys for storing auth data
const TOKEN_KEY = "token";
const USER_ID_KEY = "userId";
const USERNAME_KEY = "username";

// ✅ Login User
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchWithToken("/api/auth/login", "POST", {
        email,
        password,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      // ✅ Save token in AsyncStorage
      if (data.token) {
        await AsyncStorage.setItem(TOKEN_KEY, data.token);
      }

      // Save additional user info if available
      if (data.user) {
        if (data.user.id) {
          await AsyncStorage.setItem(USER_ID_KEY, data.user.id.toString());
        }
        if (data.user.username) {
          await AsyncStorage.setItem(USERNAME_KEY, data.user.username);
        }
      }

      return {
        token: data.token,
        user: data.user,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Register User
export const registerUser = createAsyncThunk(
  "auth/register",
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
      displayName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchWithToken("/api/auth/register", "POST", {
        username,
        email,
        password,
        displayName,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();

      // If registration includes auto-login, save the token
      if (data.token) {
        await AsyncStorage.setItem(TOKEN_KEY, data.token);
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Logout User
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Remove token and user data from AsyncStorage
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY, USERNAME_KEY]);

      // You might also want to call a logout endpoint
      // const response = await fetchWithToken("/api/auth/logout", "POST");

      return true;
    } catch (error: any) {
      console.error("Logout error:", error);
      // Still clear storage even if API call fails
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY, USERNAME_KEY]);
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Check Auth Status (for app initialization)
export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (!token) {
        return { isAuthenticated: false };
      }

      // Optionally verify the token with the server
      // const response = await fetchWithToken("/api/auth/verify", "POST");

      // Get stored user data
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      const username = await AsyncStorage.getItem(USERNAME_KEY);

      return {
        isAuthenticated: true,
        token,
        userId,
        username,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Refresh Token
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithToken("/api/auth/refresh", "POST");

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();

      if (data.token) {
        await AsyncStorage.setItem(TOKEN_KEY, data.token);
      }

      return data.token;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
