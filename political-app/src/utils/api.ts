/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { PostType } from "@/types/post";
import { getCookie, deleteCookie } from "cookies-next"; // ✅ Ensure correct import
import { Politician } from "@/types/politician";
import { getToken } from "./tokenUtils";

const API_BASE_URL = "http://localhost:8080/api"; // ✅ No trailing slash

// ✅ Fetch posts dynamically based on the endpoint
export const fetchPosts = async (endpoint: string): Promise<PostType[]> => {
  try {
    console.log(`Fetching posts from: ${API_BASE_URL}${endpoint}`); // ✅ Debugging output
    const response = await fetchWithToken(endpoint);

    if (!response) {
      console.warn("No data received from API");
      return []; // ✅ Ensure an empty array is returned instead of error
    }

    console.log("Fetched posts:", response); // ✅ Debugging output
    return response as PostType[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

// Direct implementation of createPost with explicit URL
export const createPost = async (
  postData: { content: string },
  token: string
) => {
  try {
    if (!token)
      throw new Error("No authentication token found. Please log in.");

    // Use direct fetch with explicit URL
    const API_BASE_URL = "http://localhost:8080/api"; // Ensure this matches your server
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Just send the content as a string - the backend should handle initialization
      body: JSON.stringify({
        content: postData.content,
      }),
    });

    // Log response details for debugging
    console.log("Response status:", response.status);

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// ✅ Like a post by ID (Requires Auth Token)
export const likePost = async (
  postId: number
): Promise<{ likesCount: number }> => {
  try {
    const token = getCookie("token") || localStorage.getItem("token");
    if (!token) throw new Error("No token found. Please log in.");

    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to like post: ${errorText}`);
    }

    // The backend should return the updated like count
    return await response.json();
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

// ✅ Generic function for requests with authentication
export const fetchWithToken = async (
  endpoint: string,
  method = "GET",
  body?: any
) => {
  const token = getToken();

  if (!token && endpoint !== "/auth/login") {
    console.warn("No token available for API request");
    return null;
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    return null;
  }
};

// Add a fix for the API calls that might be causing the 500 error
export const checkAuthStatus = async () => {
  try {
    // Don't use fetchWithToken here to avoid circular dependency
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") ||
          (getCookie("token") as string) ||
          null
        : null;

    if (!token) return { authenticated: false };

    // Use a simple fetch to check token validity without complex logic
    console.log("🔍 API: Checking auth status");

    try {
      // Only make this request if needed - consider removing it and just
      // assuming token is valid to avoid the initial API call
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000, // 5 second timeout
      });

      return {
        authenticated: true,
        user: response.data,
      };
    } catch (apiError) {
      console.error("❌ API: Error checking auth status:", apiError);

      // Clear stored auth data if authentication failed
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");

      try {
        if (typeof deleteCookie === "function") {
          deleteCookie("token");
          deleteCookie("username");
          deleteCookie("userId");
        }
      } catch (cookieError) {
        console.error("❌ API: Error clearing cookies:", cookieError);
      }

      return { authenticated: false };
    }
  } catch (error) {
    console.error("❌ API: Uncaught error in checkAuthStatus:", error);
    return { authenticated: false };
  }
};

// ✅ Modified fetchWithToken for politician endpoints - uses direct URL without /api prefix
export const fetchPoliticianData = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>
) => {
  const token = getCookie("token") || localStorage.getItem("token");

  if (!token) {
    console.warn(`🚨 No auth token found! Skipping request: ${endpoint}`);
    return null;
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // The difference is here - we're using the base URL without the /api prefix
  // because your PoliticianController doesn't include that prefix
  const BASE_URL = "http://localhost:8080"; // No /api here

  const url = `${BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;
  console.log(`Making request to: ${url}`);

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    console.error(`🚨 HTTP Error: ${response.status}`);
    throw new Error(`HTTP Error! Status: ${response.status}`);
  }

  return response.json();
};

// ✅ Login User API
export const loginUserAPI = async (email: string, password: string) => {
  return fetchWithToken("auth/login", "POST", { email, password });
};

export const logoutUserAPI = async () => {
  try {
    const token = getCookie("token");
    if (!token) throw new Error("No token found.");

    await fetchWithToken("/auth/logout", "POST"); // ✅ Call logout endpoint

    // ✅ Clear stored token
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

// ✅ Register User API
export const registerUserAPI = async (
  username: string,
  email: string,
  password: string
) => {
  return fetchWithToken("auth/register", "POST", { username, email, password });
};

// ✅ Fetch comments for a post
export const getPostComments = async (postId: number) => {
  try {
    const response = await fetchWithToken(`/posts/${postId}/comments`);
    return response || [];
  } catch (error) {
    console.error("Error fetching post comments:", error);
    throw error;
  }
};

// ✅ Fetch a single post by ID with detailed debugging
export const getPostById = async (postId: number): Promise<PostType | null> => {
  try {
    console.log(`[DEBUG] Fetching post with ID: ${postId}`);
    const API_BASE_URL = "http://localhost:8080/api";
    const token = getCookie("token") || localStorage.getItem("token");

    // Create headers with or without token
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log(`[DEBUG] Request URL: ${API_BASE_URL}/posts/${postId}`);
    console.log(`[DEBUG] Using auth token: ${token ? "Yes" : "No"}`);

    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "GET",
      headers: headers,
    });

    console.log(`[DEBUG] Response status:`, response.status);

    if (!response.ok) {
      // Try to get error details if available
      let errorDetails = "";
      try {
        const errorText = await response.text();
        errorDetails = errorText;
        console.error(`[DEBUG] Error response body:`, errorText);
      } catch (e) {
        console.error(`[DEBUG] Could not read error response:`, e);
      }

      console.error(
        `[DEBUG] Error fetching post ${postId}: Status ${response.status}`,
        errorDetails
      );
      return null;
    }

    const data = await response.json();
    console.log(`[DEBUG] Post data retrieved:`, data);

    // Basic validation to ensure the data is shaped like a post
    if (!data || typeof data !== "object" || !("id" in data)) {
      console.error(`[DEBUG] Invalid post data format:`, data);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`[DEBUG] Exception in getPostById(${postId}):`, error);
    return null;
  }
};

// ✅ Add a comment (Fix: No need to pass user.token separately)
export const addComment = async (postId: number, content: string) => {
  return fetchWithToken(`/posts/${postId}/comment`, "POST", { content });
};

// ✅ Save a post (Fix: No need to pass user.token separately)
export const savePost = async (postId: number) => {
  return fetchWithToken(`/posts/${postId}/save`, "POST");
};

// ✅ Share a post (Fix: No need to pass user.token separately)
export const sharePost = async (postId: number) => {
  return fetchWithToken(`/posts/${postId}/share`, "POST");
};

// ✅ Fetch saved posts
export const getSavedPosts = async (token: string): Promise<PostType[]> => {
  try {
    if (!token) throw new Error("No authentication token found.");

    const response = await axios.get(`${API_BASE_URL}/users/saved-posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data as PostType[];
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return [];
  }
};

// Fetch politicians by county with format handling
export const getPoliticiansByCounty = async (
  county: string,
  state: string
): Promise<Politician[]> => {
  try {
    // Format the county name to match the database format: "Morgan County" instead of "Morgan"
    const formattedCounty = county.toLowerCase().endsWith(" county")
      ? county
      : `${county} County`;

    console.log(
      `Looking up politicians for county "${formattedCounty}" in state "${state}"`
    );

    const endpoint = `/politicians/county/${encodeURIComponent(
      formattedCounty
    )}/${encodeURIComponent(state)}`;
    console.log(`Making request to: ${endpoint}`);

    const response = await fetchPoliticianData(endpoint);

    // Special case for Anchorage, Alaska which has a different format
    if (
      (!response || response.length === 0) &&
      county === "Anchorage" &&
      state === "Alaska"
    ) {
      const anchorageEndpoint = `/politicians/county/${encodeURIComponent(
        "Anchorage, Municipality of"
      )}/${encodeURIComponent(state)}`;
      console.log(`Trying special case for Anchorage: ${anchorageEndpoint}`);
      return (await fetchPoliticianData(anchorageEndpoint)) || [];
    }

    return response || [];
  } catch (error) {
    console.error("Error fetching politicians by county:", error);
    return [];
  }
};

// Fetch all politicians for a state - using fetchPoliticianData
export const getPoliticiansByState = async (
  state: string
): Promise<Politician[]> => {
  try {
    const endpoint = `/politicians/state/${encodeURIComponent(state)}`;
    console.log(`Fetching state politicians from: ${endpoint}`);

    const response = await fetchPoliticianData(endpoint);
    return response || [];
  } catch (error) {
    console.error("Error fetching politicians by state:", error);
    return [];
  }
};

// Combined function to get all relevant politicians for a county
export const getAllRelevantPoliticians = async (
  county: string,
  state: string
): Promise<Politician[]> => {
  try {
    console.log(`Getting all relevant politicians for ${county}, ${state}`);

    // Get county-specific politicians
    const countyPoliticians = await getPoliticiansByCounty(county, state);
    console.log(`Found ${countyPoliticians.length} county politicians`);

    // Get state-level politicians (governor, senators, etc.)
    const statePoliticians = await getPoliticiansByState(state);
    console.log(`Found ${statePoliticians.length} state politicians`);

    // Combine both lists with county politicians first
    return [...countyPoliticians, ...statePoliticians];
  } catch (error) {
    console.error("Error fetching all relevant politicians:", error);
    return [];
  }
};

// Fetch cabinet members
export const getCabinetMembers = async (): Promise<Politician[]> => {
  try {
    const endpoint = "/politicians/cabinet";
    console.log(`Fetching cabinet members from: ${endpoint}`);

    const response = await fetchPoliticianData(endpoint);

    // Ensure consistent party naming for styling
    const formattedCabinet = response
      ? response.map((politician: Politician) => {
          // Inline party name standardization
          let standardizedParty = politician.party;

          if (politician.party) {
            const partyLower = politician.party.toLowerCase();
            if (partyLower.includes("republican")) {
              standardizedParty = "Republican Party";
            } else if (partyLower.includes("democrat")) {
              standardizedParty = "Democratic Party";
            } else if (partyLower.includes("independent")) {
              standardizedParty = "Independent";
            }
          }

          return {
            ...politician,
            party: standardizedParty || "Unknown",
          };
        })
      : [];

    console.log(`Found ${formattedCabinet.length} cabinet members`);
    return formattedCabinet;
  } catch (error) {
    console.error("Error fetching cabinet members:", error);
    return [];
  }
};

// Fetch all politicians
export const getAllPoliticians = async (): Promise<Politician[]> => {
  try {
    const endpoint = "/politicians";
    console.log(`Fetching all politicians from: ${endpoint}`);

    const response = await fetchPoliticianData(endpoint);
    return response || [];
  } catch (error) {
    console.error("Error fetching all politicians:", error);
    return [];
  }
};
