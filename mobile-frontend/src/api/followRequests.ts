// src/api/followRequests.ts
import { apiClient, safeApiCall } from "./apiClient";

export interface FollowRequest {
  id: number;
  userId: number;
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  requestedAt: string;
}

/**
 * Get all follow requests for the current user
 */
export const getFollowRequests = async (): Promise<FollowRequest[]> => {
  return safeApiCall(async () => {
    const response = await apiClient.get<FollowRequest[]>('/follow/requests');
    return response.data;
  }, "Failed to fetch follow requests");
};

/**
 * Approve a follow request
 * @param requestId The ID of the follow request to approve
 */
export const approveFollowRequest = async (requestId: number): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      `/follow/requests/${requestId}/approve`
    );
    return response.data;
  }, "Failed to approve follow request");
};

/**
 * Reject a follow request
 * @param requestId The ID of the follow request to reject
 */
export const rejectFollowRequest = async (requestId: number): Promise<{ success: boolean; message?: string }> => {
  return safeApiCall(async () => {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      `/follow/requests/${requestId}/reject`
    );
    return response.data;
  }, "Failed to reject follow request");
};