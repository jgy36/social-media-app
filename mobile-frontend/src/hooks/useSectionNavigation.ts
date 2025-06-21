// hooks/useSectionNavigation.ts
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { 
  getLastPath, 
  useNavigationStateTracker, 
  detectSectionFromRoute,
  saveNavigationState 
} from '@/utils/navigationStateManager';
import { useNavigation, useRoute } from '@react-navigation/native';;
import { useFocusEffect } from '@react-navigation/native';

/**
 * Custom hook to handle section-based navigation for React Native with Expo Router
 * @returns Object containing navigation handler and current section info
 */
export const useSectionNavigation = () => {
  const navigation = useNavigation();
  const segments = useSegments();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.user);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  
  // Track navigation state automatically
  useNavigationStateTracker();
  
  // Initialize ready state
  useEffect(() => {
    setIsReady(true);
  }, []);
  
  // Determine current section based on path and current user
  useFocusEffect(
    useCallback(() => {
      if (!isReady) return;
      
      const detectSection = async () => {
        const path = pathname;
        
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
        try {
          const detected = await detectSectionFromRoute(path, user.username, user.username);
          setCurrentSection(detected || pathParts[1] || 'feed');
        } catch (error) {
          // Fallback to parsing from path parts
          setCurrentSection(pathParts[1] || 'feed');
        }
      };
      
      detectSection();
    }, [pathname, user.username, isReady])
  );
  
  // Initialize default navigation paths for new users
  useEffect(() => {
    const initializePaths = async () => {
      if (!isReady || !user.username) return;
      
      // Set default navigation paths for a new user
      saveNavigationState('profile', '/profile');
      
      // Only set default community path if it doesn't exist
      const communityPath = await getLastPath('community');
      if (!communityPath || communityPath === '/community') {
        saveNavigationState('community', '/community');
      }
      
      // Same for feed
      const feedPath = await getLastPath('feed');
      if (!feedPath || feedPath === '/feed') {
        saveNavigationState('feed', '/feed');
      }
    };
    
    initializePaths();
  }, [isReady, user.username]);
  
  // Handler for section navigation
  const handleSectionClick = useCallback(async (section: string) => {
    if (!isReady) return;
    
    try {
      // If clicking the profile tab, always go directly to /profile
      if (section === 'profile') {
        navigation.navigate('profile');
        return;
      }
      
      // For other sections, navigate to section root if we're already in that section
      if (section === currentSection) {
        navigation.push(`/${section}`);
        return;
      }
      
      // For all other cases, try to get the last path for this section
      try {
        const lastPath = await getLastPath(section);
        
        // Safety check: ensure the path doesn't contain another user's profile
        if (lastPath && lastPath.includes('/profile/') && 
            user.username && 
            !lastPath.includes(`/profile/${user.username}`)) {
          // If it's another user's profile, reset to base section path
          navigation.push(`/${section}`);
        } else {
          // Navigate to last path if it exists and is valid
          navigation.push(lastPath || `/${section}`);
        }
      } catch (error) {
        // Fallback to basic section navigation if there's any issue
        console.error('Navigation error:', error);
        navigation.push(`/${section}`);
      }
    } catch (error) {
      console.error('Section navigation error:', error);
    }
  }, [currentSection, router, user.username, isReady]);
  
  // Get current section from segments (Expo Router specific)
  const getCurrentSectionFromSegments = useCallback(() => {
    // Cast segments to string array to avoid tuple type issues
    const segmentsArray = segments as string[];
    
    if (!segmentsArray || segmentsArray.length === 0) return 'feed';
    
    const firstSegment = segmentsArray[0];
    
    // Check if we have a tabs layout
    if (firstSegment === '(tabs)') {
      // Check if we have a second segment available
      if (segmentsArray.length >= 2 && segmentsArray[1]) {
        return segmentsArray[1];
      }
      return 'feed';
    }
    
    return firstSegment || 'feed';
  }, [segments]);
  
  // Update current section based on segments
  useEffect(() => {
    if (!isReady) return;
    
    const sectionFromSegments = getCurrentSectionFromSegments();
    if (sectionFromSegments !== currentSection) {
      setCurrentSection(sectionFromSegments);
    }
  }, [segments, getCurrentSectionFromSegments, currentSection, isReady]);
  
  return {
    handleSectionClick,
    currentSection,
    isReady,
    segments,
    pathname
  };
};
