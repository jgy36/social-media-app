// src/navigation/types.ts
export type RootStackParamList = {
  // Auth screens
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  VerifyEmail: undefined;
  Verify: { token: string };

  // Main tab screens
  MainTabs: undefined;
  Feed: undefined;
  Explore: undefined;
  Messages: undefined;
  Dating: undefined;
  Profile: undefined;

  // Profile screens
  UserProfile: { username: string };
  Settings: undefined;
  FollowRequests: undefined;

  // Community screens
  Communities: undefined;
  CommunityDetail: { id: string };
  CreateCommunity: undefined;

  // Post screens
  PostDetail: { postId: number };
  SavedPosts: undefined;

  // Dating screens
  DatingProfile: undefined;
  DatingSetup: undefined;
  SwipeScreen: undefined;
  MatchDetail: { matchId: number };

  // Photo Message screens
  PhotoCamera: { recipientId?: number };
  PhotoViewer: { photoMessageId: number };
  PhotoConversation: { userId: number };

  // Hashtag screens
  Hashtag: { tag: string };

  // Message screens
  ConversationDetail: { id: number };
  NewMessage: undefined;
  DirectMessage: { userId: string };

  // Other screens
  Debug: undefined;
  OAuthConnectSuccess: { provider?: string };
};

// Updated TabParamList for the new 5-tab structure
export type TabParamList = {
  Feed: undefined; // Posts/Feed tab
  Explore: undefined; // Explore tab (discovery)
  Messages: undefined; // Snap/Message tab (photo messaging)
  Dating: undefined; // Swiping/Dating tab
  Profile: undefined; // Profile tab (social media and dating profile)
};
