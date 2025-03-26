// src/api/auth.ts
import { apiClient, getErrorMessage } from "./apiClient";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
} from "./types";
import { setToken, removeToken } from "@/utils/tokenUtils";

/**
 * Login a user
 */
export const login = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );

    // Store the token
    if (response.data.token) {
      setToken(response.data.token);

      // Store username for convenience
      if (response.data.user?.username) {
        localStorage.setItem("username", response.data.user.username);
        localStorage.setItem("userId", String(response.data.user.id));
        localStorage.setItem("email", response.data.user.email);
      }
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Register a new user
 */
export const register = async (
  userData: RegisterRequest
): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint if needed
    await apiClient.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
    // Continue with local logout even if API call fails
  } finally {
    // Always clear local storage on logout
    removeToken();
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
  }
};

/**
 * Refresh the authentication token
 */
export const refreshToken = async (): Promise<string> => {
  try {
    const response = await apiClient.post<{ token: string }>("/auth/refresh");

    if (response.data.token) {
      setToken(response.data.token);
      return response.data.token;
    }

    throw new Error("No token received");
  } catch (error) {
    console.error("Token refresh error:", error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Check the current authentication status
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    await apiClient.get("/users/me");
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
};

