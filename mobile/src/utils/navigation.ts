// src/utils/navigation.ts
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

export type Navigation = NavigationProp<RootStackParamList>;

// Helper functions for common navigation patterns
export const navigateToProfile = (navigation: Navigation, username: string) => {
  navigation.navigate('UserProfile', { username });
};

export const navigateToPost = (navigation: Navigation, postId: number) => {
  navigation.navigate('PostDetail', { postId });
};

export const navigateToCommunity = (navigation: Navigation, id: string) => {
  navigation.navigate('CommunityDetail', { id });
};

export const navigateToHashtag = (navigation: Navigation, tag: string) => {
  // Remove # if present
  const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
  navigation.navigate('Hashtag', { tag: cleanTag });
};

export const navigateToPolitician = (navigation: Navigation, id: string) => {
  navigation.navigate('PoliticianDetail', { id });
};

export const navigateToMessages = (navigation: Navigation, userId?: string) => {
  if (userId) {
    navigation.navigate('DirectMessage', { userId });
  } else {
    navigation.navigate('Messages');
  }
};

export const navigateToSettings = (navigation: Navigation) => {
  navigation.navigate('Settings');
};

export const navigateBack = (navigation: Navigation) => {
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else {
    navigation.navigate('MainTabs');
  }
};