// src/utils/routerHistoryManager.ts - React Native version
import { useNavigation, useRoute } from '@react-navigation/native';
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
  const navigation = useNavigation();
  const route = useRoute();
  const user = useSelector((state: RootState) => state.user);
  
  useEffect(() => {
    // Function to handle route changes
    const handleRouteChange = (routeName: string, params?: any) => {
      let tabFromRoute = normalizeTabName(routeName);
      
      // Special case: other user profiles belong to community tab
      if (routeName === 'Profile' && params?.username) {
        const profileUsername = params.username;
        if (user.username && profileUsername !== user.username) {
          tabFromRoute = 'community';
        }
      }
      
      // Create a route identifier
      const routeId = params ? `${routeName}:${JSON.stringify(params)}` : routeName;
      
      // Initialize tab history if needed
      if (!tabHistory[tabFromRoute]) {
        tabHistory[tabFromRoute] = [];
      }
      
      // If this is a tab change, don't modify the previous tab's history
      if (tabFromRoute !== currentTab && currentTab) {
        // We're switching tabs, so we don't want to add this to the previous tab's history
        // Just update the current tab and add this as the first entry in the new tab
        if (tabHistory[tabFromRoute].length === 0 || tabHistory[tabFromRoute][tabHistory[tabFromRoute].length - 1] !== routeId) {
          tabHistory[tabFromRoute].push(routeId);
        }
      } else {
        // Same tab navigation, add to history if it's not a duplicate of the last entry
        if (tabHistory[tabFromRoute].length === 0 || tabHistory[tabFromRoute][tabHistory[tabFromRoute].length - 1] !== routeId) {
          tabHistory[tabFromRoute].push(routeId);
        }
      }
      
      currentTab = tabFromRoute;
      
      // Limit history size to prevent memory issues
      const MAX_HISTORY = 20;
      if (tabHistory[tabFromRoute].length > MAX_HISTORY) {
        tabHistory[tabFromRoute] = tabHistory[tabFromRoute].slice(-MAX_HISTORY);
      }
      
      // Log the current state for debugging
      console.log(`[History] ${tabFromRoute} tab history:`, tabHistory[tabFromRoute]);
    };
    
    // Listen for route changes using React Navigation
    const unsubscribe = navigation.addListener('state', (e) => {
      const state = e.data.state;
      if (state && state.routes && state.routes.length > 0) {
        const currentRoute = state.routes[state.index];
        handleRouteChange(currentRoute.name, currentRoute.params);
      }
    });
    
    // Initialize with current route
    handleRouteChange(route.name, route.params);
    
    // Cleanup
    return unsubscribe;
  }, [navigation, route, user.username]);
  
  // Return nothing, this is just for side effects
  return null;
};

/**
 * Normalize route names to match our expected format
 */
function normalizeTabName(routeName: string): string {
  // Map common route names to their tab names
  switch (routeName) {
    case 'Feed': 
    case 'Home': 
      return 'feed';
    case 'Community': 
    case 'CommunityList':
    case 'CommunityDetail':
      return 'community';
    case 'Map': 
      return 'map';
    case 'Profile': 
    case 'UserProfile':
      return 'profile';
    case 'Politicians': 
      return 'politicians';
    case 'Search': 
      return 'search';
    case 'Messages':
    case 'Chat':
      return 'messages';
    default: 
      return routeName.toLowerCase();
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
 * Get the previous route in the current tab history
 * @param tab The tab name
 * @returns The previous route or null if there's no history
 */
export function getPreviousRouteInTab(tab: string): string | null {
  const normalizedTab = normalizeTabName(tab);
  
  if (tabHistory[normalizedTab] && tabHistory[normalizedTab].length > 1) {
    return tabHistory[normalizedTab][tabHistory[normalizedTab].length - 2];
  }
  
  return null;
}

/**
 * Safe navigation function for React Navigation
 * @param navigation React Navigation navigation object
 * @param routeName The route name to navigate to
 * @param params Optional parameters for the route
 */
export function safeNavigate(navigation: any, routeName: string, params?: any): void {
  try {
    if (params) {
      navigation.navigate(routeName, params);
    } else {
      navigation.navigate(routeName);
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
}