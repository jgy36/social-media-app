/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { PostType } from "@/types/post";
import { getCookie, deleteCookie } from "cookies-next";
import { Politician } from "@/types/politician";
import { getToken, setToken } from "./tokenUtils";

// Base URLs
const API_BASE_URL = "http://localhost:8080/api";
const BASE_URL = "http://localhost:8080";

// Configure axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

// Variable to track if a token refresh is in progress
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: any[] = [];

// Process the queue of failed requests
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add request interceptor to automatically add token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh already in progress, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Try to refresh the token
      try {
        const token = getToken();
        
        // Only attempt refresh if we have a token
        if (!token) {
          processQueue(new Error("No token available"));
          return Promise.reject(error);
        }
        
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const newToken = (response.data as { token: string }).token;
        
        if (newToken) {
          // Update token in storage
          setToken(newToken);
          
          // Update auth header for the original request
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          
          // Process any queued requests with the new token
          processQueue(null, newToken);
          
          // Retry the original request
          return api(originalRequest);
        } else {
          processQueue(new Error("Token refresh failed"));
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Export the api instance and other utility functions
export { api };

// Rest of your API utility functions using the api instance instead of axios directly
export const fetchPosts = async (endpoint: string): Promise<PostType[]> => {
  try {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await api.get(`${API_BASE_URL}${normalizedEndpoint}`);
    return response.data as PostType[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

// ... other API functions using the api instance ...

// The rest of your existing api.ts exports


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

  // Ensure endpoint starts with a slash for proper URL construction
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
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

// ✅ FIXED: Modified fetchPoliticianData to allow public access
export const fetchPoliticianData = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>,
  requireAuth: boolean = false // New parameter to make auth optional
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Only add auth if required or available
  const token = getCookie("token") || localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (requireAuth) {
    console.warn(`🚨 Auth required but no token found! Skipping request: ${endpoint}`);
    return null;
  }

  // Use the base URL without the /api prefix for politician endpoints
  const BASE_URL = "http://localhost:8080"; // No /api here

  // Ensure endpoint starts with slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${normalizedEndpoint}`;
  
  console.log(`Making request to: ${url}`);
  console.log(`Using auth: ${headers.Authorization ? 'Yes' : 'No'}`);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      console.error(`🚨 HTTP Error: ${response.status}`);
      console.error(`URL: ${url}`);
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
};

// ✅ Login User API
export const loginUserAPI = async (email: string, password: string) => {
  return fetchWithToken("/auth/login", "POST", { email, password });
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
  return fetchWithToken("/auth/register", "POST", { username, email, password });
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

// ✅ FIXED: Use the updated fetchPoliticianData without requiring auth
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

// ✅ FIXED: Use the updated fetchPoliticianData without requiring auth
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

// ✅ FIXED: Use the updated fetchPoliticianData without requiring auth
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

// ✅ FIXED: Use the updated fetchPoliticianData without requiring auth
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
// Function to fetch posts by hashtag
export const getPostsByHashtag = async (hashtag: string): Promise<PostType[]> => {
  try {
    // Remove the # prefix if present
    const tag = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
    
    const response = await api.get(`${API_BASE_URL}/hashtags/${tag}`);
    return response.data as PostType[];
  } catch (error) {
    console.error("Error fetching posts by hashtag:", error);
    return [];
  }
};

// Function to fetch trending hashtags
export const getTrendingHashtags = async (limit: number = 10): Promise<any[]> => {
  try {
    const response = await api.get(`${API_BASE_URL}/hashtags/trending/${limit}`);
    return response.data as any[];
  } catch (error) {
    console.error("Error fetching trending hashtags:", error);
    return [];
  }
};

// Function to fetch all communities
export const getAllCommunities = async (): Promise<any[]> => {
  try {
    const response = await api.get(`${API_BASE_URL}/communities`);
    return response.data as any[];
  } catch (error) {
    console.error("Error fetching communities:", error);
    return [];
  }
};

// Function to fetch a community by slug
export const getCommunityBySlug = async (slug: string): Promise<any> => {
  try {
    const response = await api.get(`${API_BASE_URL}/communities/${slug}`);
    return response.data as any[];
  } catch (error) {
    console.error(`Error fetching community ${slug}:`, error);
    return null;
  }
};

// Function to get posts from a community
export const getCommunityPosts = async (slug: string): Promise<PostType[]> => {
  try {
    // First try direct approach using the slug
    const response = await api.get(`${API_BASE_URL}/posts`, {
      params: { communityId: slug }
    });
    
    return response.data as PostType[];
  } catch (error) {
    console.error(`Error fetching posts from community ${slug}:`, error);
    
    // Check if it's an error with response status
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404 || axiosError.response?.status === 500) {
        console.log(`No posts found for community ${slug}, returning empty array`);
        return [];
      }
    }
    
    // For any other error, return empty array instead of throwing
    console.log(`Unhandled error fetching posts for community ${slug}, returning empty array`);
    return [];
  }
};

// Function to join a community
export const joinCommunity = async (slug: string): Promise<boolean> => {
  try {
    await api.post(`${API_BASE_URL}/communities/${slug}/join`);
    return true;
  } catch (error) {
    console.error(`Error joining community ${slug}:`, error);
    return false;
  }
};

// Function to leave a community
export const leaveCommunity = async (slug: string): Promise<boolean> => {
  try {
    await api.delete(`${API_BASE_URL}/communities/${slug}/leave`);
    return true;
  } catch (error) {
    console.error(`Error leaving community ${slug}:`, error);
    return false;
  }
};

// Function to create a post in a community
export const createCommunityPost = async (slug: string, content: string): Promise<PostType | null> => {
  try {
    const response = await api.post(`${API_BASE_URL}/communities/${slug}/posts`, { content });
    return response.data as PostType;
  } catch (error) {
    console.error(`Error creating post in community ${slug}:`, error);
    return null;
  }
};

// Function to get popular communities
export const getPopularCommunities = async (): Promise<any[]> => {
  try {
    const response = await api.get(`${API_BASE_URL}/communities/popular`);
    return response.data as any[];
  } catch (error) {
    console.error("Error fetching popular communities:", error);
    return [];
  }
};

// Function to search communities
export const searchCommunities = async (query: string): Promise<any[]> => {
  try {
    const response = await api.get(`${API_BASE_URL}/communities/search?query=${encodeURIComponent(query)}`);
    return response.data as any[];
  } catch (error) {
    console.error(`Error searching communities with query ${query}:`, error);
    return [];
  }
};

// Function to search users
export const searchUsers = async (query: string): Promise<any[]> => {
  try {
    const response = await api.get(`${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`);
    return response.data as any[];
  } catch (error) {
    console.error(`Error searching users with query ${query}:`, error);
    
    // In development, use mock data if API fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock user data for development');
      
      // Simple mock data for development
      const mockUsers = [
        { id: 1, username: 'JaneDoe', bio: 'Political Analyst', followersCount: 245 },
        { id: 2, username: 'JohnSmith', bio: 'Community Organizer', followersCount: 182 },
        { id: 3, username: 'PoliticsExpert', bio: 'Congressional Staffer', followersCount: 532 },
        { id: 4, username: 'VoterAdvocate', bio: 'Voting rights activist', followersCount: 328 }
      ];
      
      // Simple filtering for mock data
      const lowercaseQuery = query.toLowerCase();
      return mockUsers.filter(user => 
        user.username.toLowerCase().includes(lowercaseQuery) || 
        user.bio.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    return [];
  }
};

// Function to search hashtags
export const searchHashtags = async (query: string): Promise<any[]> => {
  try {
    console.log(`Searching hashtags with query: ${query}`);
    
    // First check with the search endpoint
    const response = await api.get(`${API_BASE_URL}/hashtags/search?query=${encodeURIComponent(query)}`);
    console.log('Hashtag search response:', response.data);
    
    // If we get an array directly, use it
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Handle potential response formats for a single hashtag
    if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      return [response.data];
    }
    
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error searching hashtags with query ${query}:`, error);
    
    // Try a different approach - some APIs might expect a direct lookup 
    try {
      console.log(`Trying direct hashtag lookup for tag: ${query}`);
      const directResponse = await api.get(`${API_BASE_URL}/hashtags/${encodeURIComponent(query)}`);
      console.log('Direct hashtag lookup response:', directResponse.data);
      
      // Again, handle different response formats
      if (Array.isArray(directResponse.data)) {
        return directResponse.data;
      }
      
      if (directResponse.data && typeof directResponse.data === 'object') {
        return [directResponse.data];
      }
      
      return [];
    } catch (directError) {
      console.error('Error in direct hashtag lookup:', directError);
      
      // Finally, try the hashtag posts endpoint
      try {
        console.log(`Trying to get posts by hashtag: ${query}`);
        const postsResponse = await api.get(`${API_BASE_URL}/posts`, {
          params: { tag: query.replace(/^#/, '') }
        });
        
        console.log('Posts by hashtag response:', postsResponse.data);
        
        // If we have posts, create a hashtag object
        if (Array.isArray(postsResponse.data) && postsResponse.data.length > 0) {
          return [{
            tag: query.startsWith('#') ? query : `#${query}`,
            count: postsResponse.data.length
          }];
        }
        
        return [];
      } catch (postsError) {
        console.error('Error getting posts by hashtag:', postsError);
        return [];
      }
    }
  }
};

// Function for direct access to a hashtag by name - used in hashtag/[tag].tsx page
export const getHashtagInfo = async (tag: string): Promise<any> => {
  try {
    // Ensure clean tag (no # prefix)
    const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
    console.log(`Getting hashtag info for: ${cleanTag}`);
    
    const response = await api.get(`${API_BASE_URL}/hashtags/info/${cleanTag}`);
    console.log('Hashtag info response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error getting hashtag info for ${tag}:`, error);
    return null;
  }
};

// Function to get unified search results (users, communities, hashtags)
export const getUnifiedSearchResults = async (
  query: string, 
  type?: 'user' | 'community' | 'hashtag'
): Promise<any[]> => {
  try {
    const results = [];
    
    // If type is specified, only fetch that type
    if (type === 'user' || !type) {
      const users = await searchUsers(query);
      results.push(...users.map(user => ({
        ...user,
        type: 'user'
      })));
    }
    
    if (type === 'community' || !type) {
      const communities = await searchCommunities(query);
      results.push(...communities.map(community => ({
        ...community,
        type: 'community'
      })));
    }
    
    if (type === 'hashtag' || !type) {
      const hashtags = await searchHashtags(query);
      results.push(...hashtags.map(hashtag => ({
        ...hashtag,
        type: 'hashtag'
      })));
    }
    
    return results;
  } catch (error) {
    console.error(`Error in unified search for "${query}":`, error);
    return [];
  }
};