// src/api/messages.ts
import { apiClient, safeApiCall } from "./apiClient";

export interface Conversation {
  id: number;
  otherUser: {
    id: number;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
  };
  lastMessage: string | null;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
}

export interface Message {
  id: number;
  content: string;
  sender: {
    id: number;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
  };
  receiver: {
    id: number;
    username: string;
    displayName: string | null;
    profileImageUrl: string | null;
  };
  conversationId: number;
  createdAt: string;
  read: boolean;
  imageUrl?: string;
}

/**
 * Get all conversations for the current user
 */

export const getUserConversations = async (): Promise<Conversation[]> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<Conversation[]>("/messages/conversations", {
      withCredentials: true,
    });
    return response.data;
  }, "Fetching conversations");
};

/**
 * Get or create a conversation with another user
 */
export const getOrCreateConversation = async (userId: number): Promise<{ conversationId: number }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ conversationId: number }>(
      `/messages/conversations/user/${userId}`,
      {},
      { withCredentials: true }
    );
    return response.data;
  }, `Creating conversation with user ${userId}`);
};

/**
 * Get all messages in a conversation
 */
export const getConversationMessages = async (conversationId: number): Promise<Message[]> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<Message[]>(
      `/messages/conversations/${conversationId}`,
      { withCredentials: true }
    );
    return response.data;
  }, `Fetching messages for conversation ${conversationId}`);
};

/**
 * Send a message to an existing conversation
 */
export const sendMessage = async (
  conversationId: number, 
  content: string
): Promise<Message> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<Message>(
      `/messages/conversations/${conversationId}`,
      { content },
      { withCredentials: true }
    );
    return response.data;
  }, "Sending message");
};

/**
 * Start a new conversation with a user
 */
export const startNewConversation = async (
  receiverId: number,
  content: string
): Promise<Message> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<Message>(
      "/messages/new",
      { receiverId, content },
      { withCredentials: true }
    );
    return response.data;
  }, "Starting new conversation");
};

/**
 * Get the count of unread messages
 */
export const getUnreadMessagesCount = async (): Promise<number> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<{ count: number }>(
      "/messages/unread/count",
      { withCredentials: true }
    );
    return response.data.count;
  }, "Fetching unread message count");
};

/**
 * Mark all messages in a conversation as read
 */
export const markConversationAsRead = async (conversationId: number): Promise<void> => {
  return safeApiCall(async () => {
    await apiClient.post(
      `/messages/conversations/${conversationId}/read`,
      {},
      { withCredentials: true }
    );
  }, "Marking conversation as read");
};