/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/routerHistoryManager.ts
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Store tab-specific history stacks
interface TabHistory {
  [key: string]: string[];
}

// Keep track of the last history state for each tab
const tabHistory: TabHistory = {
  feed: [],
  community: [],
  profile: [],
  map: [],
  politicians: [],
  search: []
};

// Track current tab to detect tab changes
let currentTab = '';

/**
 * Hook to manage router history within tabs
 * This ensures back/forward navigation stays within the current tab
 */
export const useRouterHistoryManager = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  
  useEffect(() => {
    // Function to handle route changes
    const handleRouteChange = (url: string) => {
      const pathParts = url.split('/');
      let tabFromPath = pathParts[1] || '';
      
      // Special case: other user profiles belong to community tab
      if (tabFromPath === 'profile' && pathParts.length > 2) {
        const profileUsername = pathParts[2];
        if (user.username && profileUsername !== user.username) {
          tabFromPath = 'community';
        }
      }
      
      // Normalize tab name
      const tab = normalizeTabName(tabFromPath);
      
      // Initialize tab history if needed
      if (!tabHistory[tab]) {
        tabHistory[tab] = [];
      }
      
      // If this is a tab change, don't modify the previous tab's history
      if (tab !== currentTab && currentTab) {
        // We're switching tabs, so we don't want to add this to the previous tab's history
        // Just update the current tab and add this as the first entry in the new tab
        if (tabHistory[tab].length === 0 || tabHistory[tab][tabHistory[tab].length - 1] !== url) {
          tabHistory[tab].push(url);
        }
      } else {
        // Same tab navigation, add to history if it's not a duplicate of the last entry
        if (tabHistory[tab].length === 0 || tabHistory[tab][tabHistory[tab].length - 1] !== url) {
          tabHistory[tab].push(url);
        }
      }
      
      currentTab = tab;
      
      // Limit history size to prevent memory issues
      const MAX_HISTORY = 20;
      if (tabHistory[tab].length > MAX_HISTORY) {
        tabHistory[tab] = tabHistory[tab].slice(-MAX_HISTORY);
      }
      
      // Log the current state for debugging
      console.log(`[History] ${tab} tab history:`, tabHistory[tab]);
    };
    
    // Listen for route changes
    router.events.on('routeChangeComplete', handleRouteChange);
    
    // Initialize with current route
    handleRouteChange(router.asPath);
    
    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, user.username]);
  
  // Return nothing, this is just for side effects
  return null;
};

/**
 * Normalize tab names to match our expected format
 */
function normalizeTabName(tab: string): string {
  // Map common paths to their tab names
  switch (tab) {
    case '': return 'feed'; // Root path maps to feed
    case 'feed': return 'feed';
    case 'community': return 'community';
    case 'map': return 'map';
    case 'profile': return 'profile';
    case 'politicians': return 'politicians';
    case 'search': return 'search';
    default: return tab;
  }
}

/**
 * Get the tab history
 * Useful for debugging or more complex navigation
 */
export function getTabHistory(): TabHistory {
  return {...tabHistory};
}

/**
 * Get the previous URL in the current tab history
 * @param tab The tab name
 * @returns The previous URL or null if there's no history
 */
export function getPreviousUrlInTab(tab: string): string | null {
  const normalizedTab = normalizeTabName(tab);
  
  if (tabHistory[normalizedTab] && tabHistory[normalizedTab].length > 1) {
    return tabHistory[normalizedTab][tabHistory[normalizedTab].length - 2];
  }
  
  return null;
}

/**
 * Safe navigation function to avoid the "[id] interpolation failed" error 
 * with dynamic routes
 * @param router Next.js router
 * @param url The URL to navigate to
 */
export function safeNavigate(router: any, url: string): void {
  // If the URL contains a dynamic segment like [id], ensure we're using a real value
  if (url.includes('[') && url.includes(']')) {
    console.error('Navigation error: URL contains dynamic segments that need actual values:', url);
    return;
  }
  
  // Normal navigation
  router.push(url);
}