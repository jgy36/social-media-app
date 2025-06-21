// src/utils/postFallbackHandler.ts - React Native version
import axios from "axios";
import { PostType } from "@/types/post";

/**
 * Enhanced version of fetchPosts with better error handling and fallback
 * @param endpoint API endpoint to fetch posts from
 * @returns Array of posts or empty array if failed
 */
export const fetchPostsWithFallback = async (
  endpoint: string
): Promise<PostType[]> => {
  try {
    // Set a shorter timeout for initial request
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const API_BASE_URL =
      process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.137.1:8080/api";

    try {
      // Use axios directly for React Native
      const response = await axios.get(`${API_BASE_URL}${normalizedEndpoint}`, {
        timeout: 5000, // 5 second timeout
      });

      return response.data as PostType[];
    } catch (initialError) {
      // Check if it's a timeout or connection error
      const error = initialError as Error;
      const isTimeoutError =
        error.message.includes("timeout") ||
        error.message.includes("Network Error") ||
        error.message.includes("aborted") ||
        error.message.includes("NETWORK_REQUEST_FAILED");

      if (isTimeoutError) {
        console.warn(`Request to ${endpoint} timed out, using fallback data`);
        // Instead of failing, return a set of mock posts as fallback
        return generateFallbackPosts(endpoint);
      }

      // For other errors, just log and return empty array
      console.error("Error fetching posts:", initialError);
      return [];
    }
  } catch (error) {
    console.error("Error in fetchPostsWithFallback:", error);
    return [];
  }
};

/**
 * Generate fallback posts based on the endpoint type
 * @param endpoint The endpoint that was attempted
 * @returns Array of mock posts
 */
export function generateFallbackPosts(endpoint: string): PostType[] {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  // Generate different mock data based on the endpoint
  if (endpoint.includes("following")) {
    return [
      {
        id: 999,
        author: "NetworkIssue",
        content:
          "There seems to be a network issue connecting to the server. This is fallback content while we try to reconnect.",
        likes: 0,
        createdAt: now.toISOString(),
        commentsCount: 0,
        hashtags: ["#ConnectionIssue"],
      },
      {
        id: 998,
        author: "YourFriend",
        content:
          "This is a sample post from someone you follow. Real content will appear when the connection is restored.",
        likes: 5,
        createdAt: oneHourAgo.toISOString(),
        commentsCount: 2,
        hashtags: ["#Sample"],
      },
    ];
  } else {
    // Default posts for "for-you" feed
    return [
      {
        id: 997,
        author: "NetworkIssue",
        content:
          "There seems to be a network issue connecting to the server. This is fallback content while we try to reconnect.",
        likes: 0,
        createdAt: now.toISOString(),
        commentsCount: 0,
        hashtags: ["#ConnectionIssue"],
      },
      {
        id: 996,
        author: "PoliticalApp",
        content:
          "Welcome to the Political App! We're experiencing connectivity issues, but will restore service soon.",
        likes: 15,
        createdAt: twoHoursAgo.toISOString(),
        commentsCount: 3,
        hashtags: ["#Welcome", "#PoliticalApp"],
      },
    ];
  }
}
