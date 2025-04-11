// src/api/notifications.ts
import { apiClient } from "./apiClient";

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
    const response = await apiClient.get<Notification[]>("/notifications");
    return response.data;
  } catch (error) {
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
