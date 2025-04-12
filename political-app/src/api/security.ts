// src/api/security.ts
import { apiClient, safeApiCall } from "./apiClient";

/**
 * Interface for the two-factor authentication setup response
 */
export interface TwoFASetupResponse {
  qrCodeUrl: string;
  secretKey: string;
}

/**
 * Interface for active session information
 */
export interface UserSession {
  id: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  current: boolean;
}

/**
 * Get the current 2FA status for the user
 * @returns Whether 2FA is enabled
 */
export const getTwoFAStatus = async (): Promise<{ enabled: boolean }> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<{ enabled: boolean }>('/users/2fa/status');
    return response.data;
  }, "Failed to get 2FA status");
};

/**
 * Initialize the 2FA setup process
 * @returns Setup data including QR code URL and secret key
 */
export const initTwoFASetup = async (): Promise<TwoFASetupResponse> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<TwoFASetupResponse>('/users/2fa/setup');
    return response.data;
  }, "Failed to setup 2FA");
};

/**
 * Verify and enable 2FA with a verification code
 * @param code The verification code from authenticator app
 * @param secret The secret key from the setup process
 * @returns Success status
 */
export const verifyAndEnableTwoFA = async (
  code: string,
  secret: string
): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      '/users/2fa/verify',
      { code, secret }
    );
    return response.data;
  }, "Failed to verify 2FA code");
};

/**
 * Disable 2FA for the user
 * @returns Success status
 */
export const disableTwoFA = async (): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.delete<{ success: boolean; message?: string }>('/users/2fa');
    return response.data;
  }, "Failed to disable 2FA");
};

/**
 * Change user password
 * @param currentPassword Current password
 * @param newPassword New password
 * @returns Success status
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.put<{ success: boolean; message?: string }>(
      '/users/password',
      { currentPassword, newPassword }
    );
    return response.data;
  }, "Failed to change password");
};

/**
 * Get active sessions for the current user
 * @returns List of active sessions
 */
export const getActiveSessions = async (): Promise<UserSession[]> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<UserSession[]>('/users/sessions');
    return response.data;
  }, "Failed to get active sessions");
};

/**
 * Sign out from all devices except the current one
 * @returns Success status
 */
export const signOutAllDevices = async (): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      '/users/sessions/logout-all'
    );
    return response.data;
  }, "Failed to sign out all devices");
};

/**
 * Sign out a specific session
 * @param sessionId ID of the session to terminate
 * @returns Success status
 */
export const terminateSession = async (
  sessionId: string
): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      `/users/sessions/${sessionId}`
    );
    return response.data;
  }, "Failed to terminate session");
};