// src/api/notificationPreferences.ts
import { apiClient, safeApiCall } from "./apiClient";

/**
 * Interface for notification preferences
 */
export interface NotificationPreferences {
  emailNotifications: boolean;
  newCommentNotifications: boolean;
  mentionNotifications: boolean;
  politicalUpdates: boolean;
  communityUpdates: boolean;
  directMessageNotifications: boolean;
  followNotifications: boolean;
  likeNotifications: boolean; 
}

/**
 * Default notification preferences
 */
export const defaultNotificationPreferences: NotificationPreferences = {
  emailNotifications: true,
  newCommentNotifications: true,
  mentionNotifications: true,
  politicalUpdates: false,
  communityUpdates: true,
  directMessageNotifications: true,
  followNotifications: true,
  likeNotifications: true,
};

/**
 * Get the user's notification preferences
 * @returns The user's notification preferences
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<NotificationPreferences>('/users/notification-preferences');
    return response.data;
  }, "Failed to get notification preferences");
};

/**
 * Update the user's notification preferences
 * @param preferences The updated notification preferences
 * @returns Success status
 */
export const updateNotificationPreferences = async (
  preferences: NotificationPreferences
): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.put<{ success: boolean; message?: string }>(
      '/users/notification-preferences',
      preferences
    );
    return response.data;
  }, "Failed to update notification preferences");
};

/**
 * Toggle a single notification preference
 * @param preference The name of the preference to toggle
 * @returns The updated notification preferences
 */
export const toggleNotificationPreference = async (
  preference: keyof NotificationPreferences
): Promise<NotificationPreferences> => {
  return safeApiCall(async () => {
    // First get current preferences
    const currentPreferences = await getNotificationPreferences();
    
    // Toggle the specified preference
    const updatedPreferences = {
      ...currentPreferences,
      [preference]: !currentPreferences[preference]
    };
    
    // Update the preferences
    await updateNotificationPreferences(updatedPreferences);
    
    return updatedPreferences;
  }, `Failed to toggle ${preference} preference`);
};

/**
 * Reset notification preferences to default values
 * @returns Success status
 */
export const resetNotificationPreferences = async (): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      '/users/notification-preferences/reset'
    );
    return response.data;
  }, "Failed to reset notification preferences");
};