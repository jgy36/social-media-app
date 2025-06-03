// src/hooks/useSectionNavigation.ts
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { 
  getLastPath, 
  useNavigationStateTracker, 
  detectSectionFromPath,
  saveNavigationState 
} from '@/utils/navigationStateManager';

/**
 * Custom hook to handle section-based navigation
 * @returns Object containing navigation handler and current section info
 */
export const useSectionNavigation = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [isRouterReady, setIsRouterReady] = useState(false);
  
  // Wait for router to be ready before doing anything
  useEffect(() => {
    if (router.isReady) {
      setIsRouterReady(true);
    }
  }, [router.isReady]);
  
  // Automatically track navigation state when navigating
  useNavigationStateTracker();
  
  // Determine current section based on path and current user
  useEffect(() => {
    if (!isRouterReady) return;
    
    const path = router.asPath;
    
    // Special handling for other user's profiles
    const pathParts = path.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'profile') {
      const pathUsername = pathParts[2];
      
      // If viewing another user's profile (not your own), mark as community section
      if (user.username && pathUsername !== user.username) {
        setCurrentSection('community');
        return;
      }
    }
    
    // Regular path detection
    const detected = detectSectionFromPath(path, user.username);
    setCurrentSection(detected || pathParts[1] || 'feed');
  }, [router.asPath, user.username, isRouterReady]);
  
  // Initialize default navigation paths for new users
  useEffect(() => {
    if (!isRouterReady || !user.username) return;
    
    // Set default navigation paths for a new user
    saveNavigationState('profile', '/profile');
    
    // Only set default community path if it doesn't exist
    const communityPath = getLastPath('community');
    if (!communityPath || communityPath === '/community') {
      saveNavigationState('community', '/community');
    }
    
    // Same for feed
    const feedPath = getLastPath('feed');
    if (!feedPath || feedPath === '/feed') {
      saveNavigationState('feed', '/feed');
    }
  }, [isRouterReady, user.username]);
  
  // Handler for section navigation
  const handleSectionClick = useCallback((section: string) => {
    if (!isRouterReady) return;
    
    try {
      // Safety check - ensure we have a valid router object
      if (!router || typeof router.push !== 'function') {
        console.error('Router is not available for navigation');
        return;
      }
      
      // If clicking the profile tab, always go directly to /profile
      if (section === 'profile') {
        router.push('/profile');
        return;
      }
      
      // For other sections, navigate to section root if we're already in that section
      if (section === currentSection) {
        router.push(`/${section}`);
        return;
      }
      
      // For all other cases, try to get the last path for this section
      try {
        const lastPath = getLastPath(section);
        
        // Safety check: ensure the path doesn't contain another user's profile
        if (lastPath && lastPath.includes('/profile/') && 
            user.username && 
            !lastPath.includes(`/profile/${user.username}`)) {
          // If it's another user's profile, reset to base section path
          router.push(`/${section}`);
        } else {
          // Navigate to last path if it exists and is valid
          router.push(lastPath || `/${section}`);
        }
      } catch (error) {
        // Fallback to basic section navigation if there's any issue
        console.error('Navigation error:', error);
        router.push(`/${section}`);
      }
    } catch (error) {
      console.error('Section navigation error:', error);
    }
  }, [currentSection, router, user.username, isRouterReady]);
  
  return {
    handleSectionClick,
    currentSection
  };
};