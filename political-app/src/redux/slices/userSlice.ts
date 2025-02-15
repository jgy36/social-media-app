/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { fetchWithToken } from "@/utils/api";

// Define the initial state
interface UserState {
  token: string | null;
  username: string | null;
}

const initialState: UserState = { 
  token: typeof getCookie("token") === "string" ? (getCookie("token") as string) : null,
  username: typeof getCookie("username") === "string" ? (getCookie("username") as string) : null,
};

// Define async login
export const loginUser = createAsyncThunk(
  "user/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      if (!data.token) throw new Error("Login failed, no token received");

      // ✅ Store token
      setCookie("token", data.token);
      setCookie("username", data.username);

      return { token: data.token, username: data.username };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Define async register
export const registerUser = createAsyncThunk(
  "user/register",
  async ({ username, email, password }: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      return await fetchWithToken("/auth/register", "POST", { username, email, password });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.token = null;
      state.username = null;
      deleteCookie("token");
      deleteCookie("username");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; username: string }>) => {
      state.token = action.payload.token;
      state.username = action.payload.username;
    });
  },
});

export const { logoutUser } = userSlice.actions;
export default userSlice.reducer;
