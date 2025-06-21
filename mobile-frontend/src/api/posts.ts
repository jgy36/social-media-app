// src/api/posts.ts - React Native version with FIXED FormData construction
import { apiClient, resilientApiClient, safeApiCall } from "./apiClient";
import {
  PostResponse,
  CommentResponse,
  CreateCommentRequest,
  SavePostResponse,
} from "./types";

/**
 * Fetch posts with proper fallback for network issues
 */
export const getPosts = async (endpoint: string): Promise<PostResponse[]> => {
  try {
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;

    return await safeApiCall(async () => {
      const response = await resilientApiClient.get<PostResponse[]>(
        normalizedEndpoint
      );

      // Normalize properties for all posts in the response
      return response.data.map((post) => {
        return {
          ...post,
          // Ensure isRepost is set correctly regardless of which property exists
          isRepost: post.isRepost || post.repost || false,
          // Ensure repostCount/repostsCount are consistent
          repostCount: post.repostCount || post.repostsCount || 0,
          repostsCount: post.repostsCount || post.repostCount || 0,
        };
      });
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
 * Create a new post - React Native version with FIXED FormData
 * Handles both text posts and posts with media
 */
export const createPost = async (
  postData: CreatePostRequest
): Promise<PostResponse> => {
  console.log(
    "📝 createPost API call with data:",
    JSON.stringify(
      {
        ...postData,
        media: postData.media ? `${postData.media.length} files` : "none",
      },
      null,
      2
    )
  );

  return safeApiCall(async () => {
    // Ensure repost flag is set correctly if we have an originalPostId
    if (postData.originalPostId && postData.repost !== true) {
      console.warn(
        "⚠️ originalPostId provided but repost flag not set - fixing"
      );
      postData.repost = true;
    }

    let response;

    // Check if we have media files
    if (postData.media && postData.media.length > 0) {
      console.log("📝 Uploading post with media files (React Native FormData)");

      // FIXED: Proper React Native FormData construction to match Spring Boot controller
      const formData = new FormData();

      // CRITICAL: Match Spring Boot @RequestPart and @RequestParam expectations

      // Content as @RequestPart (required by backend)
      formData.append("content", postData.content);

      // Media files as @RequestPart
      postData.media.forEach((file, index) => {
        // React Native specific file object construction
        if (typeof file === "object" && "uri" in file) {
          const mediaFile = {
            uri: file.uri,
            type: file.type || "image/jpeg",
            name: file.name || `media_${index}.jpg`,
          };

          // React Native FormData append for media files
          formData.append("media", mediaFile as any);
          console.log(`✅ Added media file ${index}:`, mediaFile.name);
        } else {
          // Fallback for File objects
          formData.append("media", file);
        }
      });

      // CRITICAL: Spring Boot @RequestParam fields - append as regular form fields
      if (postData.communityId) {
        formData.append("communityId", postData.communityId.toString());
        console.log(
          "✅ Added communityId as @RequestParam:",
          postData.communityId
        );
      }

      if (postData.originalPostId) {
        formData.append("originalPostId", postData.originalPostId.toString());
        console.log(
          "✅ Added originalPostId as @RequestParam:",
          postData.originalPostId
        );
      }

      if (postData.repost) {
        formData.append("repost", String(postData.repost));
        console.log("✅ Added repost as @RequestParam:", postData.repost);
      }

      // Media types and alt texts as @RequestParam arrays
      if (postData.mediaTypes) {
        postData.mediaTypes.forEach((type) => {
          formData.append("mediaTypes", type);
        });
        console.log("✅ Added mediaTypes:", postData.mediaTypes);
      }

      if (postData.altTexts) {
        postData.altTexts.forEach((text) => {
          formData.append("altTexts", text || "");
        });
        console.log("✅ Added altTexts:", postData.altTexts);
      }

      console.log(
        "📤 Sending FormData to /posts/with-media with proper Spring Boot structure"
      );

      response = await apiClient.post<PostResponse>(
        "/posts/with-media",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } else {
      // Regular JSON request without media
      response = await apiClient.post<PostResponse>("/posts", postData);
    }

    // Log the raw response for debugging
    console.log("📝 Response data:", JSON.stringify(response.data, null, 2));

    // Initialize an enhanced response that will include fields we need
    const enhancedResponse: PostResponse = {
      ...response.data,
      // Ensure we have both property names for consistency
      repostCount: response.data.repostsCount || response.data.repostCount,
      repostsCount: response.data.repostsCount || response.data.repostCount,
    };

    // Make sure repost fields are properly set
    if (postData.repost === true && postData.originalPostId) {
      if (!response.data.isRepost) {
        console.warn("⚠️ API response missing isRepost flag - adding it");
        enhancedResponse.isRepost = true;
      }

      if (!response.data.originalPostId) {
        console.warn("⚠️ API response missing originalPostId - adding it");
        enhancedResponse.originalPostId = postData.originalPostId;
      }

      // Force another API call to get the original post data if it's missing
      if (
        !response.data.originalPostContent &&
        enhancedResponse.originalPostId
      ) {
        try {
          console.log("🔍 Fetching missing original post data");
          const originalPost = await getPostById(
            enhancedResponse.originalPostId
          );
          if (originalPost) {
            enhancedResponse.originalAuthor = originalPost.author;
            enhancedResponse.originalPostContent = originalPost.content;
            console.log("✅ Successfully added missing original post data");
          }
        } catch (error) {
          console.error("❌ Failed to fetch original post data:", error);
        }
      }
    }

    return enhancedResponse;
  }, "Creating post");
};

// React Native specific interface for media files
export interface MediaFile {
  uri: string;
  type?: string;
  name?: string;
}

export interface CreatePostRequest {
  content: string;
  originalPostId?: number;
  repost?: boolean;
  communityId?: number;
  // Media files for React Native
  media?: (MediaFile | File)[];
  mediaTypes?: string[];
  altTexts?: string[];
}

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

export const likeComment = async (
  commentId: number
): Promise<{ message: string; likesCount: number; isLiked: boolean }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{
      message: string;
      likesCount: number;
      isLiked: boolean;
    }>(`/posts/comments/${commentId}/like`);
    return response.data;
  }, `Liking comment ${commentId}`);
};

/**
 * Delete a post by ID
 */
export const deletePost = async (postId: number): Promise<void> => {
  return safeApiCall(async () => {
    await apiClient.delete(`/posts/${postId}`);
  }, `Deleting post ${postId}`);
};

export const updatePost = async (
  postId: number,
  content: string
): Promise<PostResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.put<PostResponse>(`/posts/${postId}`, {
      content,
    });

    // Log debug information
    console.log(`Post ${postId} updated successfully`, response.data);

    return response.data;
  }, `Updating post ${postId}`);
};
