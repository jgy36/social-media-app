/* eslint-disable @typescript-eslint/no-unused-vars */
// src/api/posts.ts
import { apiClient, resilientApiClient, safeApiCall } from "./apiClient";
import {
  PostResponse,
  CreatePostRequest,
  CommentResponse,
  CreateCommentRequest,
  SavePostResponse,
} from "./types";

/**
 * Fetch posts with proper fallback for network issues
 */
export const getPosts = async (endpoint: string): Promise<PostResponse[]> => {
  try {
    // Use resilient client for higher timeout and automatic retries
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    
    return await safeApiCall(async () => {
      const response = await resilientApiClient.get<PostResponse[]>(normalizedEndpoint);
      return response.data;
    }, `Fetching posts from ${endpoint}`);
  } catch (error) {
    console.error(`Error fetching posts from ${endpoint}:`, error);

    if (
      error instanceof Error &&
      (error.message.includes("timeout") ||
        error.message.includes("Network Error"))
    ) {
      // Return fallback posts for network errors
      return generateFallbackPosts(endpoint);
    }

    // Return empty array for other errors
    return [];
  }
};

/**
 * Fetch posts by hashtag
 */
export const getPostsByHashtag = async (
  hashtag: string
): Promise<PostResponse[]> => {
  return safeApiCall(async () => {
    // Remove # if present
    const tag = hashtag.startsWith("#") ? hashtag.substring(1) : hashtag;
    const response = await apiClient.get<PostResponse[]>(`/hashtags/${tag}`);
    return response.data;
  }, `Fetching posts for hashtag ${hashtag}`);
};

/**
 * Fetch a single post by ID
 */
export const getPostById = async (
  postId: number
): Promise<PostResponse | null> => {
  try {
    return await safeApiCall(async () => {
      const response = await apiClient.get<PostResponse>(`/posts/${postId}`);
      return response.data;
    }, `Fetching post ${postId}`);
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    return null;
  }
};

/**
 * Fetch posts by username
 */
export const getPostsByUsername = async (
  username: string
): Promise<PostResponse[]> => {
  try {
    return await safeApiCall(async () => {
      const response = await apiClient.get<PostResponse[]>(
        `/users/profile/${username}/posts`
      );
      return response.data;
    }, `Fetching posts for user ${username}`);
  } catch (error) {
    console.error(`Error fetching posts for user ${username}:`, error);
    return [];
  }
};

/**
 * Create a new post
 */
export const createPost = async (
  postData: CreatePostRequest
): Promise<PostResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<PostResponse>("/posts", postData);
    return response.data;
  }, "Creating post");
};

/**
 * Like or unlike a post
 */
export const likePost = async (
  postId: number
): Promise<{ likesCount: number }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ likesCount: number }>(
      `/posts/${postId}/like`
    );
    return response.data;
  }, `Liking post ${postId}`);
};

/**
 * Save or unsave a post
 */
export const savePost = async (postId: number): Promise<SavePostResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<SavePostResponse>(
      `/posts/${postId}/save`
    );
    return response.data;
  }, `Saving post ${postId}`);
};

/**
 * Get saved posts for the current user
 */
export const getSavedPosts = async (): Promise<PostResponse[]> => {
  try {
    return await safeApiCall(async () => {
      const response = await apiClient.get<PostResponse[]>("/posts/saved");
      return response.data;
    }, "Fetching saved posts");
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return [];
  }
};

/**
 * Check if a post is saved by the current user
 */
export const checkPostSaveStatus = async (
  postId: number
): Promise<SavePostResponse> => {
  try {
    return await safeApiCall(async () => {
      const response = await apiClient.get<SavePostResponse>(
        `/posts/${postId}/saved-status`
      );
      return response.data;
    }, `Checking save status for post ${postId}`);
  } catch (error) {
    console.error(`Error checking save status for post ${postId}:`, error);
    return { isSaved: false };
  }
};

/**
 * Share a post
 */
export const sharePost = async (
  postId: number
): Promise<{ sharesCount: number }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ sharesCount: number }>(
      `/posts/${postId}/share`
    );
    return response.data;
  }, `Sharing post ${postId}`);
};

/**
 * Get comments for a post
 */
export const getPostComments = async (
  postId: number
): Promise<CommentResponse[]> => {
  try {
    return await safeApiCall(async () => {
      const response = await apiClient.get<CommentResponse[]>(
        `/posts/${postId}/comments`
      );
      return response.data;
    }, `Fetching comments for post ${postId}`);
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    return [];
  }
};

/**
 * Add a comment to a post
 */
export const addComment = async (
  postId: number,
  content: string
): Promise<CommentResponse> => {
  return safeApiCall(async () => {
    const request: CreateCommentRequest = { content };
    const response = await apiClient.post<CommentResponse>(
      `/posts/${postId}/comment`,
      request
    );
    return response.data;
  }, `Adding comment to post ${postId}`);
};

/**
 * Generate fallback posts for offline/network error cases
 */
function generateFallbackPosts(endpoint: string): PostResponse[] {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

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
    ];
  } else {
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
    ];
  }
}