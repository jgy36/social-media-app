/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/navigationStateManager.ts
import { useEffect } from 'react';
import { useRouter } from 'next/router';

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
 * Hook to track and save navigation state
 * @param section The current section
 */
export const useNavigationStateTracker = (section: string | null = null): void => {
  const router = useRouter();
  
  useEffect(() => {
    // Determine the current section based on the path
    const currentPath = router.asPath;
    
    // Only save state if we have a valid section
    if (section) {
      saveNavigationState(section, currentPath);
    } else {
      // Auto-detect section from path
      const pathParts = currentPath.split('/');
      if (pathParts.length > 1) {
        const detectedSection = pathParts[1];
        if (detectedSection) {
          saveNavigationState(detectedSection, currentPath);
        }
      }
    }
  }, [router.asPath, section]);
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