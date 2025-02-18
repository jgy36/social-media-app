/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getCookie, deleteCookie } from "cookies-next";
import { fetchWithToken } from "@/utils/api";

// Define the initial state
interface UserState {
  id: number | null; // ✅ Add this line
  token: string | null;
  username: string | null;
}

const initialState: UserState = {
  id: typeof getCookie("id") === "string" ? Number(getCookie("id")) : null, // ✅ Add id handling
  token:
    typeof getCookie("token") === "string"
      ? (getCookie("token") as string)
      : null,
  username:
    typeof getCookie("username") === "string"
      ? (getCookie("username") as string)
      : null,
};

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
        // ✅ Ensure data.user exists
        throw new Error(data.message || "Login failed");
      }

      return {
        id: data.user?.id || null, // ✅ Prevent undefined error
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
      return await fetchWithToken("/auth/register", "POST", {
        username,
        email,
        password,
      });
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
      state.id = null; // ✅ Clear ID on logout
      state.token = null;
      state.username = null;
      deleteCookie("token");
      deleteCookie("username");
    },
  },

  extraReducers: (builder) => {
    builder.addCase(
      loginUser.fulfilled,
      (
        state,
        action: PayloadAction<{ id: number; token: string; username: string }>
      ) => {
        state.id = action.payload.id;
        state.token = action.payload.token;
        state.username = action.payload.username;

        // ✅ Store token in cookies/local storage
        document.cookie = `token=${action.payload.token}; path=/;`;
        localStorage.setItem("token", action.payload.token);
      }
    );
  },
});

export const { logoutUser } = userSlice.actions;
export default userSlice.reducer;
