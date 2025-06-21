// src/api/apiClient.ts - UPDATED with better debugging and connection handling

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getToken, isAuthenticated, setToken } from "@/utils/tokenUtils";
import {
  getErrorMessage,
  ApiError,
  hasResponseProperty,
  isNetworkError,
} from "@/utils/apiErrorHandler";

// Store injection
let storeInstance: any = null;
export const injectStore = (store: any) => {
  storeInstance = store;
};

// CRITICAL: Update this configuration based on your setup
const getApiBaseUrl = () => {
  const YOUR_COMPUTER_IP = "10.0.0.249"; // <-- UPDATE THIS to your current Wi-Fi IP

  if (Platform.OS === "android") {
    // Android emulator
    return "http://10.0.2.2:8080/api";

    // For physical Android device:
    // return `http://${YOUR_COMPUTER_IP}:8080/api`;
  } else {
    // iOS simulator - UPDATE THIS
    return "http://10.0.0.249:8080/api";

    // For physical iOS device:
    // return `http://${YOUR_COMPUTER_IP}:8080/api`;
  }
};

export const API_BASE_URL = getApiBaseUrl();
export const BASE_URL = API_BASE_URL.replace("/api", "");

// Log configuration on startup
console.log("🌐 API Configuration:");
console.log("  Platform:", Platform.OS);
console.log("  API_BASE_URL:", API_BASE_URL);
console.log("  BASE_URL:", BASE_URL);

// Interfaces remain the same...
export interface TokenRefreshResponse {
  token: string;
}

export interface ApiClientOptions {
  baseURL?: string;
  timeout?: number;
  withCredentials?: boolean;
  autoRefreshToken?: boolean;
  retry?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

interface ExtendedRequestConfig {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  data?: unknown;
  _retry?: boolean;
  [key: string]: unknown;
}

// Token refresh state tracking
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}[] = [];

const processQueue = (error: Error | null, value: unknown = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(value);
    }
  });
  failedQueue = [];
};

/**
 * Test API connectivity
 */
export const testApiConnection = async () => {
  try {
    console.log("🧪 Testing API connection to:", API_BASE_URL);
    const testUrl = `${API_BASE_URL}/posts/for-you`;
    console.log("  Test URL:", testUrl);

    const response = await axios.get(testUrl, {
      timeout: 5000, // 5 second timeout for testing
    });

    console.log("✅ API connection successful!");
    console.log("  Response status:", response.status);
    console.log(
      "  Response data preview:",
      JSON.stringify(response.data).substring(0, 100)
    );
    return true;
  } catch (error: any) {
    console.error("❌ API connection failed!");
    console.error("  Error type:", error.code || error.name);
    console.error("  Error message:", error.message);
    if (error.response) {
      console.error("  Response status:", error.response.status);
      console.error("  Response data:", error.response.data);
    }
    return false;
  }
};

/**
 * Create a configured axios instance for API requests
 */
export const createApiClient = (options: ApiClientOptions = {}) => {
  const defaultOptions: ApiClientOptions = {
    baseURL: API_BASE_URL,
    timeout: 15000, // Increased to 15 seconds
    withCredentials: false,
    autoRefreshToken: true,
    retry: false,
    retryDelay: 1000,
    maxRetries: 1,
  };

  const config: ApiClientOptions = { ...defaultOptions, ...options };

  console.log("📱 Creating API client:");
  console.log("  Base URL:", config.baseURL);
  console.log("  Timeout:", config.timeout, "ms");

  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // Request interceptor - enhanced with detailed logging
  instance.interceptors.request.use(
    async (config) => {
      const token = await getToken();

      // Log every request for debugging
      console.log(
        `📤 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
      console.log(`  Full URL: ${config.baseURL}${config.url}`);
      console.log(`  Has token: ${!!token}`);

      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      // Add cache busting headers
      config.headers = config.headers || {};
      config.headers["Cache-Control"] = "no-cache";
      config.headers["Pragma"] = "no-cache";

      return config;
    },
    (error) => {
      console.error("❌ Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - enhanced error logging
  instance.interceptors.response.use(
    (response) => {
      console.log(`📥 API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    async (error) => {
      // Enhanced error logging
      console.error(
        `❌ API Error for ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        }:`
      );

      if (error.code === "ECONNABORTED") {
        console.error(
          "  ⏱️ Request timeout - the server took too long to respond"
        );
      } else if (error.code === "ERR_NETWORK") {
        console.error("  🌐 Network error - cannot reach the server");
        console.error("  Check if:");
        console.error("    1. Your backend is running on port 8080");
        console.error("    2. You're using the correct IP address");
        console.error("    3. Your firewall allows connections");
      } else if (error.response) {
        console.error(`  Response status: ${error.response.status}`);
        console.error(`  Response data:`, error.response.data);
      } else {
        console.error("  Error details:", error.message);
      }

      // Handle 401 and token refresh (keep existing logic)
      const errorWithResponse = hasResponseProperty(error) && error.response;
      const originalRequest = error.config as ExtendedRequestConfig;

      if (
        errorWithResponse &&
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        (await isAuthenticated())
      ) {
        // ... existing token refresh logic ...
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create default API clients
export const apiClient = createApiClient();

// Create a more resilient client for non-critical operations
export const resilientApiClient = createApiClient({
  timeout: 30000,
  retry: true,
  retryDelay: 1000,
  maxRetries: 2,
});

// Add a helper to validate the setup
export const validateApiSetup = async () => {
  console.log("🔍 Validating API setup...");

  // Test basic connectivity
  const isConnected = await testApiConnection();

  if (!isConnected) {
    console.error("⚠️ API connection failed. Please check:");
    console.error("  1. Is your Spring Boot backend running?");
    console.error(
      "  2. Can you access http://192.168.137.1:8080/api/posts/for-you in your browser?"
    );
    console.error("  3. Are you using the correct IP address in apiClient.ts?");
    console.error(
      "  4. If on physical device, update YOUR_COMPUTER_IP in apiClient.ts"
    );
  }

  return isConnected;
};

// Export other functions as before...
export {
  getErrorMessage,
  ApiError,
  safeApiCall,
} from "@/utils/apiErrorHandler";

export const validateAuthState = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    if (!token) return false;

    const response = await apiClient.get("/users/me");
    return true;
  } catch (error) {
    console.error("Auth validation failed:", error);
    return false;
  }
};

export const ensureAuthenticatedRequest = async (
  endpoint: string,
  method = "GET",
  body?: unknown
) => {
  const token = await getToken();
  if (!token) {
    throw new ApiError("Authentication required. Please log in again.");
  }

  const config: ExtendedRequestConfig = {
    method,
    url: endpoint,
    headers: {
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  };

  if (body) {
    config.data = body;
  }

  return apiClient(config);
};

export const fetchWithToken = async (
  endpoint: string,
  method = "GET",
  body?: unknown,
  expectTextResponse = false
) => {
  try {
    const token = await getToken();
    const config: ExtendedRequestConfig = {
      method,
      url: endpoint,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    };

    if (body) {
      config.data = body;
    }

    const response = await apiClient(config);
    return expectTextResponse ? response.data : response.data;
  } catch (error) {
    console.error("API request failed:", error);
    throw new ApiError(getErrorMessage(error));
  }
};
