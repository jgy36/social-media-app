// src/api/accountManagement.ts
import { apiClient, safeApiCall } from "./apiClient";

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
 * Export user data
 * @returns Blob containing the exported data
 */
export const exportUserData = async (): Promise<Blob> => {
  return safeApiCall(async () => {
    const response = await apiClient.get('/users/data-export', {
      responseType: 'blob',
    });
    return response.data;
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