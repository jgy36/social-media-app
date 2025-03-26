// src/api/posts.ts
import { apiClient, resilientApiClient, getErrorMessage } from "./client";
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
    const response = await resilientApiClient.get<PostResponse[]>(
      normalizedEndpoint
    );
    return response.data;
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
  try {
    // Remove # if present
    const tag = hashtag.startsWith("#") ? hashtag.substring(1) : hashtag;
    const response = await apiClient.get<PostResponse[]>(`/hashtags/${tag}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for hashtag ${hashtag}:`, error);
    return [];
  }
};

/**
 * Fetch a single post by ID
 */
export const getPostById = async (
  postId: number
): Promise<PostResponse | null> => {
  try {
    const response = await apiClient.get<PostResponse>(`/posts/${postId}`);
    return response.data;
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
    const response = await apiClient.get<PostResponse[]>(
      `/users/profile/${username}/posts`
    );
    return response.data;
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
  try {
    const response = await apiClient.post<PostResponse>("/posts", postData);
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Like or unlike a post
 */
export const likePost = async (
  postId: number
): Promise<{ likesCount: number }> => {
  try {
    const response = await apiClient.post<{ likesCount: number }>(
      `/posts/${postId}/like`
    );
    return response.data;
  } catch (error) {
    console.error(`Error liking post ${postId}:`, error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Save or unsave a post
 */
export const savePost = async (postId: number): Promise<SavePostResponse> => {
  try {
    const response = await apiClient.post<SavePostResponse>(
      `/posts/${postId}/save`
    );
    return response.data;
  } catch (error) {
    console.error(`Error saving post ${postId}:`, error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get saved posts for the current user
 */
export const getSavedPosts = async (): Promise<PostResponse[]> => {
  try {
    const response = await apiClient.get<PostResponse[]>("/posts/saved");
    return response.data;
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
    const response = await apiClient.get<SavePostResponse>(
      `/posts/${postId}/saved-status`
    );
    return response.data;
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
  try {
    const response = await apiClient.post<{ sharesCount: number }>(
      `/posts/${postId}/share`
    );
    return response.data;
  } catch (error) {
    console.error(`Error sharing post ${postId}:`, error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Get comments for a post
 */
export const getPostComments = async (
  postId: number
): Promise<CommentResponse[]> => {
  try {
    const response = await apiClient.get<CommentResponse[]>(
      `/posts/${postId}/comments`
    );
    return response.data;
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
  try {
    const request: CreateCommentRequest = { content };
    const response = await apiClient.post<CommentResponse>(
      `/posts/${postId}/comment`,
      request
    );
    return response.data;
  } catch (error) {
    console.error(`Error adding comment to post ${postId}:`, error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Generate fallback posts for offline/network error cases
 */
function generateFallbackPosts(endpoint: string): PostResponse[] {
  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

