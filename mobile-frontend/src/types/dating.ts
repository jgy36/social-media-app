// src/types/dating.ts
export interface DatingProfile {
  id: number;
  user: {
    id: number;
    username: string;
    displayName: string;
  };
  bio: string;
  age: number;
  location: string;
  photos: string[];
  isActive: boolean;
  genderPreference: string;
  minAge: number;
  maxAge: number;
  maxDistance: number;
}

export interface Match {
  id: number;
  user1: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  user2: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  matchedAt: string;
  isActive: boolean;
}

export type SwipeDirection = "LIKE" | "PASS";
