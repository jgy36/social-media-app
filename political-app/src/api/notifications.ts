// src/api/notifications.ts
import { apiClient } from "./apiClient";
import { getToken } from "@/utils/tokenUtils";


export interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  recipient: {
    id: number;
    username: string;
  };
  // Add these new fields
  notificationType: string;
  referenceId?: number; 
  secondaryReferenceId?: number;
  communityId?: string;
  actorUsername?: string; // Username of the user who triggered the notification
}

/**
 * Fetch user notifications
 */
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    console.log("Sending request to /notifications endpoint");
    const response = await apiClient.get<Notification[]>("/notifications");
    console.log("Notifications API response:", response.status, response.data);
    return response.data;
  } catch (error: any) {
    // Log more details about the error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
    }
    
    console.error("Error fetching notifications:", error);
    return [];
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  notificationId: number
): Promise<boolean> => {
  try {
    await apiClient.put(`/notifications/${notificationId}/read`);
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    await apiClient.put("/notifications/read-all");
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

// Add to notifications.ts
/**
 * Fetch user notifications with explicit authentication check
 */
export const getNotificationsWithAuth = async (): Promise<Notification[]> => {
  try {
    const token = getToken();
    if (!token) {
      console.warn("No authentication token found when fetching notifications");
      return [];
    }
    
    console.log("Fetching notifications with token:", token.substring(0, 10) + "...");
    const response = await apiClient.get<Notification[]>("/notifications", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    });
    console.log("Notifications response:", response.data.length, "notifications received");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};