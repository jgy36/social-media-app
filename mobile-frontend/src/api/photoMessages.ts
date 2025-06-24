// src/api/photoMessages.ts
import { apiClient, safeApiCall } from "./apiClient";

// Photo Message Types
export interface PhotoMessage {
  id: number;
  sender: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  recipient: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  photoUrl: string;
  sentAt: string;
  expiresAt: string;
  isViewed: boolean;
  viewCount: number;
  maxViews: number;
  firstViewedAt?: string;
  lastViewedAt?: string;
  screenshotTaken: boolean;
  screenshotCount: number;
}

export interface PhotoMessageMetadata {
  id: number;
  senderId: number;
  senderUsername: string;
  senderDisplayName: string;
  sentAt: string;
  expiresAt: string;
  isViewed: boolean;
  hasReplaysLeft: boolean;
  isExpired: boolean;
}

export interface SendPhotoMessageRequest {
  recipientId: number;
  photo: any; // File/URI for React Native
  durationHours?: number;
}

export interface SendPhotoMessageResponse {
  success: boolean;
  photoMessageId?: number;
  expiresAt?: string;
  error?: string;
}

export interface ViewPhotoMessageResponse {
  success: boolean;
  photoUrl?: string;
  viewCount?: number;
  maxViews?: number;
  hasReplaysLeft?: boolean;
  sender?: {
    id: number;
    username: string;
  };
  error?: string;
}

/**
 * Send a photo message
 */
export const sendPhotoMessage = async (
  recipientId: number,
  photoUri: string,
  durationHours: number = 24
): Promise<SendPhotoMessageResponse> => {
  return safeApiCall(async () => {
    const formData = new FormData();
    formData.append("recipientId", recipientId.toString());
    formData.append("durationHours", durationHours.toString());

    // For React Native, create file object
    formData.append("photo", {
      uri: photoUri,
      type: "image/jpeg",
      name: "photo.jpg",
    } as any);

    const response = await apiClient.post<SendPhotoMessageResponse>(
      "/photo-messages/send",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }, "Failed to send photo message");
};

/**
 * View a photo message (first view or replay)
 */
export const viewPhotoMessage = async (
  photoMessageId: number
): Promise<ViewPhotoMessageResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<ViewPhotoMessageResponse>(
      `/photo-messages/${photoMessageId}/view`
    );
    return response.data;
  }, "Failed to view photo message");
};

/**
 * Report screenshot taken
 */
export const reportScreenshot = async (
  photoMessageId: number
): Promise<{ success: boolean }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ success: boolean }>(
      `/photo-messages/${photoMessageId}/screenshot`
    );
    return response.data;
  }, "Failed to report screenshot");
};

/**
 * Get unread photo messages
 */
export const getUnreadPhotoMessages = async (): Promise<PhotoMessage[]> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<PhotoMessage[]>(
      "/photo-messages/unread"
    );
    return response.data;
  }, "Failed to get unread photo messages");
};

/**
 * Get photo message conversation with another user
 */
export const getPhotoMessageConversation = async (
  otherUserId: number
): Promise<PhotoMessage[]> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<PhotoMessage[]>(
      `/photo-messages/conversation/${otherUserId}`
    );
    return response.data;
  }, "Failed to get photo message conversation");
};

/**
 * Get photo message metadata (for red square display)
 */
export const getPhotoMessageMetadata = async (
  photoMessageId: number
): Promise<PhotoMessageMetadata> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<PhotoMessageMetadata>(
      `/photo-messages/${photoMessageId}/metadata`
    );
    return response.data;
  }, "Failed to get photo message metadata");
};

/**
 * Get all active photo message conversations
 */
export const getPhotoMessageConversations = async (): Promise<
  {
    userId: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
    unreadCount: number;
    lastMessageAt: string;
  }[]
> => {
  return safeApiCall(async () => {
    const response = await apiClient.get("/photo-messages/conversations");
    return response.data;
  }, "Failed to get photo message conversations");
};
