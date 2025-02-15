/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWithToken } from "@/utils/api"; // ✅ Custom fetch helper
import { setCookie, deleteCookie } from "cookies-next";

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
      if (!response.ok) throw new Error("Login failed");
      const data = await response.json();

      // ✅ Save token in cookies
      setCookie("token", data.token, { path: "/" });

      return data.token; // Returns token to authSlice
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
    }: { username: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchWithToken("/api/auth/register", "POST", {
        username,
        email,
        password,
      });
      if (!response.ok) throw new Error("Registration failed");
      return await response.json(); // No token needed for register
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Logout User
export const logoutUser = () => {
  deleteCookie("token"); // Remove token from cookies
  return { type: "auth/logout" }; // Dispatch logout action
};
