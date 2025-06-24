// src/types/photoMessage.ts
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

export interface PhotoMessageConversation {
  userId: number;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  unreadCount: number;
  lastMessageAt: string;
}
