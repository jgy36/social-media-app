import axios from "axios";
import type { PostType } from "@/types/post";
import { getCookie } from "cookies-next"; // ✅ Ensure correct import
import { Politician } from "@/types/politician";

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

// ✅ Create a new post (Requires Auth Token)
export const createPost = async (
  postData: { content: string },
  token: string
) => {
  try {
    const username = getCookie("username") || localStorage.getItem("username"); // ✅ Auto-fetch username
    if (!username) throw new Error("No username found. Please log in.");

    const response = await axios.post(
      `${API_BASE_URL}/posts`,
      { ...postData, username }, // ✅ Automatically include username
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data as PostType;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// ✅ Like a post by ID (Requires Auth Token)
export const likePost = async (postId: number): Promise<PostType> => {
  try {
    const token = getCookie("token"); // Ensure user is authenticated
    if (!token) throw new Error("No token found. Please log in.");

    const response = await axios.post(
      `${API_BASE_URL}/posts/${postId}/like`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data as PostType;
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

// ✅ Generic function for requests with authentication
export const fetchWithToken = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>
) => {
  const token = getCookie("token") || localStorage.getItem("token"); // ✅ Try local storage too

  if (!token) {
    console.warn(`🚨 No auth token found! Skipping request: ${endpoint}`);
    return null; // ✅ Prevents unnecessary API calls
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(
    `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
    {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }
  );

  if (!response.ok) {
    console.error(`🚨 HTTP Error: ${response.status}`);
    throw new Error(`HTTP Error! Status: ${response.status}`);
  }

  return response.json();
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
  
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
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

// ✅ Fetch a single post by ID
export const getPostById = async (postId: number) => {
  try {
    const response = await fetchWithToken(`/posts/${postId}`);
    return response;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
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

// Fetch politicians by county - using fetchPoliticianData
export const getPoliticiansByCounty = async (county: string, state: string): Promise<Politician[]> => {
  try {
    const endpoint = `/politicians/county/${encodeURIComponent(county)}/${encodeURIComponent(state)}`;
    console.log(`Fetching county politicians from: ${endpoint}`);
    
    const response = await fetchPoliticianData(endpoint);
    return response || [];
  } catch (error) {
    console.error("Error fetching politicians by county:", error);
    return [];
  }
};

// Fetch all politicians for a state - using fetchPoliticianData
export const getPoliticiansByState = async (state: string): Promise<Politician[]> => {
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
export const getAllRelevantPoliticians = async (county: string, state: string): Promise<Politician[]> => {
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