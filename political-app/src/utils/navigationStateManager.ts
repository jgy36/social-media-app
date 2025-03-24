/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/navigationStateManager.ts
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Define the structure for storing navigation history
interface NavigationState {
  community: string;
  profile: string;
  politicians: string;
  map: string;
  feed: string;
  search: string;
  [key: string]: string; // Index signature for other sections
}

// Key for localStorage
const NAV_STATE_KEY = 'political_app_nav_state';

/**
 * Save the current path for a specific section
 * @param section The main section (tab) name
 * @param path The current path to save
 */
export const saveNavigationState = (section: string, path: string): void => {
  try {
    // Get current state or initialize
    const currentState: NavigationState = getNavigationState();
    
    // Update the state with new path
    currentState[section] = path;
    
    // Save back to localStorage
    localStorage.setItem(NAV_STATE_KEY, JSON.stringify(currentState));
  } catch (error) {
    console.error('Error saving navigation state:', error);
  }
};

/**
 * Get the saved navigation state
 * @returns The navigation state object
 */
export const getNavigationState = (): NavigationState => {
  try {
    const stored = localStorage.getItem(NAV_STATE_KEY);
    return stored ? JSON.parse(stored) : {
      community: '/community',
      profile: '/profile',
      politicians: '/politicians',
      map: '/map',
      feed: '/feed',
      search: '/search'
    };
  } catch (error) {
    console.error('Error retrieving navigation state:', error);
    // Return default state if error
    return {
      community: '/community',
      profile: '/profile',
      politicians: '/politicians',
      map: '/map',
      feed: '/feed',
      search: '/search'
    };
  }
};

/**
 * Get the last path for a specific section
 * @param section The section name
 * @returns The last saved path or default path
 */
export const getLastPath = (section: string): string => {
  const state = getNavigationState();
  return state[section] || `/${section}`;
};

/**
 * Detect the current section from a path
 * @param path The current path
 * @param currentUsername The username of the currently logged-in user
 * @returns The detected section
 */
export const detectSectionFromPath = (path: string, currentUsername: string | null): string => {
  const pathParts = path.split('/');
  
  // If path is like /community/[id] - it's still the community section
  if (pathParts.length > 2 && pathParts[1] === 'community') {
    return 'community';
  }
  
  // If path is like /profile/[username]
  if (pathParts.length > 2 && pathParts[1] === 'profile') {
    const pathUsername = pathParts[2];
    
    // If this is the current user's profile, it belongs to the "profile" tab
    if (currentUsername && pathUsername === currentUsername) {
      return 'profile';
    }
    
    // Otherwise, it's someone else's profile and belongs to "community"
    return 'community';
  }
  
  // Other simple paths - just use the first path segment
  if (pathParts.length > 1) {
    return pathParts[1] || '';
  }
  
  return '';
};

/**
 * Store the section that a user profile was accessed from
 * @param section The section to store
 */
export const storePreviousSection = (section: string): void => {
  try {
    localStorage.setItem('prev_section', section);
  } catch (error) {
    console.error('Error storing previous section:', error);
  }
};

/**
 * Get the section that a user profile was accessed from
 * @returns The previous section or null
 */
export const getPreviousSection = (): string | null => {
  try {
    return localStorage.getItem('prev_section');
  } catch (error) {
    console.error('Error retrieving previous section:', error);
    return null;
  }
};

/**
 * Hook to track and save navigation state
 * Use this in layouts or main components to automatically track state
 */
export const useNavigationStateTracker = (explicitSection: string | null = null): void => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  
  useEffect(() => {
    // Get the current path
    const currentPath = router.asPath;
    
    // If an explicit section was provided, use that
    if (explicitSection) {
      saveNavigationState(explicitSection, currentPath);
      return;
    }
    
    // Handle community detail pages explicitly
    const pathParts = currentPath.split('/');
    if (pathParts.length > 2 && pathParts[1] === 'community') {
      // Always save community detail pages under the community section
      saveNavigationState('community', currentPath);
      return;
    }
    
    // Check if we're on a /profile/[username] page
    if (pathParts.length > 2 && pathParts[1] === 'profile') {
      const pathUsername = pathParts[2];
      
      // If this is the current user's profile, it's part of the "profile" section
      if (user.username && pathUsername === user.username) {
        saveNavigationState('profile', currentPath);
        return;
      }
      
      // For other user profiles, ALWAYS save under the community section
      // This is crucial - other user profiles are considered part of the community
      saveNavigationState('community', currentPath);
      return;
    }
    
    // Auto-detect section from path for normal paths
    const pathSection = pathParts.length > 1 ? pathParts[1] : '';
    if (pathSection) {
      // Save this path under its own section (standard behavior)
      saveNavigationState(pathSection, currentPath);
      
      // Also update prev_section to track where we came from
      storePreviousSection(pathSection);
    }
  }, [router.asPath, explicitSection, user.username]);
};

/**
 * Navigate to the last visited path in a section
 * @param router Next.js router instance
 * @param section The section to navigate to
 */
export const navigateToLastPath = (router: any, section: string): void => {
  const lastPath = getLastPath(section);
  router.push(lastPath);
};