// src/components/layout/MainLayout.tsx
import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigationStateTracker } from "@/utils/navigationStateManager";
import { useRouter } from 'next/router';
import Navbar from "@/components/navbar/Navbar";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import { useRestoreCommunities } from "@/hooks/useRestoreCommunities";

interface MainLayoutProps {
  children: ReactNode;
  section?: string; // Optional explicit section override
}

const MainLayout = ({ children, section }: MainLayoutProps) => {
  const router = useRouter();
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
  const currentPath = router.asPath;
  
  // Define a function to detect if we're viewing someone else's profile
  const isViewingOtherUserProfile = (): boolean => {
    const pathParts = currentPath.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'profile') {
      const pathUsername = pathParts[2];
      return user.username ? pathUsername !== user.username : true;
    }
    return false;
  };
  
  // Use explicit section if provided
  // Otherwise, detect from path with special handling for user profiles
  let effectiveSection = section;
  if (!effectiveSection) {
    const pathParts = currentPath.split('/');
    
    if (pathParts.length > 1) {
      // Basic case: just use the first path segment
      effectiveSection = pathParts[1] || '';
      
      // Special case: if viewing another user's profile page, always consider it part of "community"
      if (effectiveSection === 'profile' && isViewingOtherUserProfile()) {
        effectiveSection = 'community';
      }
    }
  }
  
  // Track navigation with the effective section
  useNavigationStateTracker(effectiveSection);
  
  const showSidebar = isAuthenticated && joinedCommunities.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex flex-grow relative">
        {/* Community Sidebar */}
        {showSidebar && <CommunitySidebar />}

        {/* Main Content */}
        <main
          className={`flex-grow transition-all duration-300 ${
            showSidebar && isSidebarOpen
              ? "ml-64"
              : showSidebar
              ? "ml-16"
              : "ml-0"
          }`}
        >
          <div className="container mx-auto p-4">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;