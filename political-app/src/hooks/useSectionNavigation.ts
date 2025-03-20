// src/hooks/useSectionNavigation.ts
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { 
  getLastPath, 
  useNavigationStateTracker, 
  detectSectionFromPath 
} from '@/utils/navigationStateManager';

/**
 * Custom hook to handle section-based navigation
 * @returns Object containing navigation handler and current section info
 */
export const useSectionNavigation = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  
  // Automatically track navigation state when navigating
  useNavigationStateTracker();
  
  // Determine current section based on path and current user
  const getCurrentSection = useCallback(() => {
    const path = router.asPath;
    
    // Special handling for other user's profiles
    const pathParts = path.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'profile') {
      const pathUsername = pathParts[2];
      
      // If viewing another user's profile (not your own), mark as community section
      if (user.username && pathUsername !== user.username) {
        return 'community';
      }
    }
    
    // Regular path detection
    return detectSectionFromPath(path, user.username);
  }, [router.asPath, user.username]);
  
  // Get the current section
  const currentSection = getCurrentSection();
  
  // Handler for section navigation
  const handleSectionClick = useCallback((section: string) => {
    // If clicking the profile tab, always go to the user's own profile
    if (section === 'profile') {
      router.push('/profile');
      return;
    }
    
    // If we're already in this section, do nothing
    // But make an exception for "community" when viewing a user profile
    const isViewingUserProfile = router.asPath.startsWith('/profile/') && 
                                user.username && 
                                !router.asPath.includes(`/profile/${user.username}`);
    
    const shouldRedirect = section !== currentSection || 
                         (section === 'community' && isViewingUserProfile && 
                          router.asPath !== getLastPath('community'));
    
    if (!shouldRedirect) {
      return;
    }
    
    // Navigate to the last path in the requested section
    const lastPath = getLastPath(section);
    router.push(lastPath);
  }, [currentSection, router, user.username]);
  
  return {
    handleSectionClick,
    currentSection
  };
};