// src/components/layout/MainLayout.tsx
import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigationStateTracker } from "@/utils/navigationStateManager";
import { useNavigation, useRoute } from '@react-navigation/native';
import Navbar from "@/components/navbar/Navbar";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import { useRestoreCommunities } from "@/hooks/useRestoreCommunities";

interface MainLayoutProps {
  children: React.ReactNode;
  section?: string;
}

const MainLayout = ({ children, section }: MainLayoutProps) => {
  const navigation = useNavigation();
  const route = useRoute();
  const isSidebarOpen = useSelector(
    (state: RootState) => state.communities.isSidebarOpen
  );
  const isAuthenticated = useSelector((state: RootState) => !!state.user.token);
  const joinedCommunities = useSelector(
    (state: RootState) => state.communities.joinedCommunities
  );
  const user = useSelector((state: RootState) => state.user);

  // Use the community restoration hook to ensure communities are loaded
  useRestoreCommunities();

  // Auto-detect current section if not explicitly provided
  const currentPath = route.name;
  
  // Define a function to detect if we're viewing someone else's profile
  const isViewingOtherUserProfile = (): boolean => {
    if (route.name === 'Profile' && route.params) {
      const pathUsername = (route.params as any).username;
      return user.username ? pathUsername !== user.username : true;
    }
    return false;
  };
  
  // Use explicit section if provided
  // Otherwise, detect from route with special handling for user profiles
  let effectiveSection = section;
  if (!effectiveSection) {
    effectiveSection = route.name || '';
    
    // Special case: if viewing another user's profile page, always consider it part of "community"
    if (effectiveSection === 'Profile' && isViewingOtherUserProfile()) {
      effectiveSection = 'community';
    }
  }
  
  // Track navigation with the effective section
  useNavigationStateTracker(effectiveSection);
  
  const showSidebar = isAuthenticated && joinedCommunities.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Navbar />

      <View className="flex-1 flex-row">
        {/* Community Sidebar */}
        {showSidebar && <CommunitySidebar />}

        {/* Main Content */}
        <View
          className={`flex-1 ${
            showSidebar && isSidebarOpen
              ? "ml-64"
              : showSidebar
              ? "ml-16"
              : "ml-0"
          }`}
        >
          <View className="container mx-auto p-4">{children}</View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MainLayout;