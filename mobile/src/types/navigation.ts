// types/navigation.ts
export type RootStackParamList = {
  Messages: {
    screen: 'Chat';
    params: {
      username?: string;
      userId?: number;
      conversationId?: number;
    };
  };
  PostDetail: {
    postId: number;
  };
  // Add other routes as needed
  Home: undefined;
  Profile: { userId?: number; username?: string };
  // ... add other routes your app uses
};