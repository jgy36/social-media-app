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
  Search: undefined;
  Map: undefined;
  Messages: undefined;
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
  
  // Politicians screens
  Politicians: undefined;
  PoliticianDetail: { id: string };
  
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

export type TabParamList = {
  Feed: undefined;
  Search: undefined;
  Map: undefined;
  Messages: undefined;
  Profile: undefined;
};