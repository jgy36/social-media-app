import axios from "axios";
import type { PostType } from "@/types/post";
import { getCookie } from "cookies-next"; // ✅ Ensure correct import

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
  postData: { content: string; username: string },
  token: string
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/posts`, postData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data as PostType;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// ✅ Like a post by ID (Requires Auth Token)
export const likePost = async (postId: number) => {
  try {
    const token = getCookie("token");
    if (!token) throw new Error("No token found. Please log in.");

    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to like post: ${errorData.message || response.status}`);
    }

    return await response.json(); // ✅ Return the parsed response
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
