// src/api/privacySettings.ts
import { apiClient, safeApiCall } from "./apiClient";

/**
 * Interface for privacy settings
 */
export interface PrivacySettings {
  publicProfile: boolean;
  showPoliticalAffiliation: boolean;
  showPostHistory: boolean;
  showVotingRecord: boolean;
  allowDirectMessages: boolean;
  allowFollowers: boolean;
  allowSearchIndexing: boolean;
  dataSharing: boolean;
}

/**
 * Default privacy settings
 */
export const defaultPrivacySettings: PrivacySettings = {
  publicProfile: true,
  showPoliticalAffiliation: false,
  showPostHistory: true,
  showVotingRecord: false,
  allowDirectMessages: true,
  allowFollowers: true,
  allowSearchIndexing: true,
  dataSharing: false,
};

/**
 * Get the user's privacy settings
 * @returns The user's privacy settings
 */
export const getPrivacySettings = async (): Promise<PrivacySettings> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<PrivacySettings>('/users/privacy-settings');
    return response.data;
  }, "Failed to get privacy settings");
};

/**
 * Update the user's privacy settings
 * @param settings The updated privacy settings
 * @returns Success status
 */
export const updatePrivacySettings = async (
  settings: PrivacySettings
): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.put<{ success: boolean; message?: string }>(
      '/users/privacy-settings',
      settings
    );
    return response.data;
  }, "Failed to update privacy settings");
};

/**
 * Toggle a single privacy setting
 * @param setting The name of the setting to toggle
 * @returns The updated privacy settings
 */
export const togglePrivacySetting = async (
  setting: keyof PrivacySettings
): Promise<PrivacySettings> => {
  return safeApiCall(async () => {
    // First get current settings
    const currentSettings = await getPrivacySettings();
    
    // Toggle the specified setting
    const updatedSettings = {
      ...currentSettings,
      [setting]: !currentSettings[setting]
    };
    
    // Update the settings
    await updatePrivacySettings(updatedSettings);
    
    return updatedSettings;
  }, `Failed to toggle ${setting} setting`);
};

/**
 * Reset privacy settings to default values
 * @returns Success status
 */
export const resetPrivacySettings = async (): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      '/users/privacy-settings/reset'
    );
    return response.data;
  }, "Failed to reset privacy settings");
};