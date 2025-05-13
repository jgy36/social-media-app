// src/api/accountManagement.ts - React Native version
import { apiClient, safeApiCall } from "./apiClient";
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

/**
 * Interface for email verification status
 */
export interface EmailVerificationStatus {
  isVerified: boolean;
  email: string;
}

/**
 * Interface for connected social accounts
 */
export interface ConnectedAccounts {
  google?: boolean;
  facebook?: boolean;
  twitter?: boolean;
  apple?: boolean;
}

/**
 * Get the user's email verification status
 * @returns Email verification status
 */
export const getEmailVerificationStatus = async (): Promise<EmailVerificationStatus> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<EmailVerificationStatus>('/users/email/verification-status');
    return response.data;
  }, "Failed to get email verification status");
};

/**
 * Send a verification email to the user's current email
 * @returns Success status
 */
export const sendVerificationEmail = async (): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      '/users/email/send-verification'
    );
    return response.data;
  }, "Failed to send verification email");
};

/**
 * Verify email with a verification code
 * @param code The verification code
 * @returns Success status
 */
export const verifyEmail = async (
  code: string
): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      '/users/email/verify',
      { code }
    );
    return response.data;
  }, "Failed to verify email");
};

/**
 * Request to change email address
 * @param newEmail The new email address
 * @returns Success status
 */
export const requestEmailChange = async (
  newEmail: string
): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      '/users/email/change',
      { newEmail }
    );
    return response.data;
  }, "Failed to request email change");
};

/**
 * Get connected social accounts
 * @returns Connected accounts information
 */
export const getConnectedAccounts = async (): Promise<ConnectedAccounts> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<ConnectedAccounts>('/users/connected-accounts');
    return response.data;
  }, "Failed to get connected accounts");
};

/**
 * Connect a social account
 * Note: This typically requires OAuth flow which is handled in the UI
 * This endpoint would complete the connection after OAuth
 * @param provider The provider name (google, facebook, twitter, apple)
 * @param token OAuth token received from the provider
 * @returns Success status
 */
export const connectSocialAccount = async (
  provider: string,
  token: string
): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      `/users/connected-accounts/${provider}`,
      { token }
    );
    return response.data;
  }, `Failed to connect ${provider} account`);
};

/**
 * Disconnect a social account
 * @param provider The provider name (google, facebook, twitter, apple)
 * @returns Success status
 */
export const disconnectSocialAccount = async (
  provider: string
): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      `/users/connected-accounts/${provider}`
    );
    return response.data;
  }, `Failed to disconnect ${provider} account`);
};

/**
 * Export user data - React Native version
 * Handles both download to device and sharing
 * @returns Success status with file path on device
 */
export const exportUserData = async (): Promise<{ 
  success: boolean; 
  filePath?: string; 
  message?: string;
}> => {
  return safeApiCall(async () => {
    const response = await apiClient.get('/users/data-export', {
      responseType: 'blob',
    });
    
    // Get the download path for different platforms
    const downloadPath = Platform.OS === 'ios' 
      ? RNFS.DocumentDirectoryPath 
      : RNFS.DownloadDirectoryPath;
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `user-data-export-${timestamp}.json`;
    const filePath = `${downloadPath}/${fileName}`;
    
    // Write the blob to file
    const reader = new FileReader();
    const writePromise = new Promise<string>((resolve, reject) => {
      reader.onload = async () => {
        try {
          if (typeof reader.result === 'string') {
            // Remove data URL prefix if present
            const base64Data = reader.result.split(',')[1] || reader.result;
            await RNFS.writeFile(filePath, base64Data, 'base64');
            resolve(filePath);
          } else {
            reject(new Error('Unable to read file data'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
    });
    
    reader.readAsDataURL(response.data as Blob);
    const resultPath = await writePromise;
    
    return { 
      success: true, 
      filePath: resultPath,
      message: `Data exported to ${fileName}`
    };
  }, "Failed to export user data");
};

/**
 * Delete user account
 * @returns Success status
 */
export const deleteUserAccount = async (): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      '/users/account'
    );
    return response.data;
  }, "Failed to delete account");
};