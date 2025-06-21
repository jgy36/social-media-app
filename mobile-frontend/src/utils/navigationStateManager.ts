// src/utils/navigationStateManager.ts - React Native version
import { useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the structure for storing navigation history
interface NavigationState {
  community: string;
  profile: string;
  politicians: string;
  map: string;
  feed: string;
  search: string;
  messages: string;
  [key: string]: string; // Index signature for other sections
}

// Key for AsyncStorage
const NAV_STATE_KEY = "political_app_nav_state";

/**
 * Save the current path for a specific section
 * @param section The main section (tab) name
 * @param path The current path to save
 */
export const saveNavigationState = async (section: string, path: string): Promise<void> => {
  try {
    // Get current state or initialize
    const currentState: NavigationState = await getNavigationState();

    // Update the state with new path
    currentState[section] = path;

    // Save back to AsyncStorage
    await AsyncStorage.setItem(NAV_STATE_KEY, JSON.stringify(currentState));
  } catch (error) {
    console.error("Error saving navigation state:", error);
  }
};

/**
 * Get the saved navigation state
 * @returns The navigation state object
 */
export const getNavigationState = async (): Promise<NavigationState> => {
  try {
    const stored = await AsyncStorage.getItem(NAV_STATE_KEY);
    return stored
      ? JSON.parse(stored)
      : {
          community: "Community",
          profile: "Profile",
          politicians: "Politicians",
          map: "Map",
          feed: "Feed",
          search: "Search",
          messages: "Messages",
        };
  } catch (error) {
    console.error("Error retrieving navigation state:", error);
    // Return default state if error
    return {
      community: "Community",
      profile: "Profile",
      politicians: "Politicians",
      map: "Map",
      feed: "Feed",
      search: "Search",
      messages: "Messages",
    };
  }
};

/**
 * Get the last path for a specific section
 * @param section The section name
 * @returns The last saved path or default path
 */
export const getLastPath = async (section: string): Promise<string> => {
  const state = await getNavigationState();
  const path = state[section] || section;

  // For profile section, always ensure it's the bare "Profile" route for safety
  // unless the current path includes the current user's username
  if (section === "profile") {
    const currentUsername = await AsyncStorage.getItem("username");
    // If the path contains a username that isn't the current user, reset to Profile
    if (
      path.includes(':') && // React Navigation params syntax
      !path.includes(currentUsername || '')
    ) {
      return "Profile";
    }
  }

  return path;
};

/**
 * Detect the current section from a route name
 * @param routeName The current route name
 * @param params Route parameters
 * @param currentUsername The username of the currently logged-in user
 * @returns The detected section
 */
export const detectSectionFromRoute = (
  routeName: string,
  params: any,
  currentUsername: string | null
): string => {
  // Handle community detail screens
  if (routeName === 'CommunityDetail') {
    return "community";
  }

  // Handle profile screens
  if (routeName === 'Profile' || routeName === 'UserProfile') {
    const profileUsername = params?.username;

    // If this is the current user's profile, it belongs to the "profile" tab
    if (currentUsername && profileUsername === currentUsername) {
      return "profile";
    }

    // Otherwise, it's someone else's profile and belongs to "community"
    return "community";
  }

  // Map route names to sections
  const routeSectionMap: { [key: string]: string } = {
    'Feed': 'feed',
    'Community': 'community',
    'Profile': 'profile',
    'Politicians': 'politicians',
    'Map': 'map',
    'Search': 'search',
    'Messages': 'messages',
  };

  return routeSectionMap[routeName] || routeName.toLowerCase();
};

/**
 * Store the section that a user profile was accessed from
 * @param section The section to store
 */
export const storePreviousSection = async (section: string): Promise<void> => {
  try {
    await AsyncStorage.setItem("prev_section", section);
  } catch (error) {
    console.error("Error storing previous section:", error);
  }
};

/**
 * Get the section that a user profile was accessed from
 * @returns The previous section or null
 */
export const getPreviousSection = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("prev_section");
  } catch (error) {
    console.error("Error retrieving previous section:", error);
    return null;
  }
};

/**
 * Hook to track and save navigation state
 * Use this in layouts or main components to automatically track state
 */
export const useNavigationStateTracker = (
  explicitSection: string | null = null
): void => {
  const navigation = useNavigation();
  const route = useRoute();
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Get the current route name and params
    const currentRouteName = route.name;
    const currentParams = route.params;
    const currentPath = `${currentRouteName}${currentParams ? `:${JSON.stringify(currentParams)}` : ''}`;

    // If an explicit section was provided, use that
    if (explicitSection) {
      saveNavigationState(explicitSection, currentPath);
      return;
    }

    // Handle community detail screens explicitly
    if (currentRouteName === 'CommunityDetail') {
      // Always save community detail pages under the community section
      saveNavigationState("community", currentPath);
      return;
    }

    // Check if we're on a profile screen
    if (currentRouteName === 'Profile' || currentRouteName === 'UserProfile') {
      const profileUsername = (currentParams as any)?.username;

      // If this is the current user's profile, it's part of the "profile" section
      if (user.username && profileUsername === user.username) {
        saveNavigationState("profile", currentPath);
        return;
      }

      // For other user profiles, ALWAYS save under the community section
      saveNavigationState("community", currentPath);
      return;
    }

    // Auto-detect section from route name for normal routes
    const section = detectSectionFromRoute(currentRouteName, currentParams, user.username);
    if (section) {
      // Save this path under its own section (standard behavior)
      saveNavigationState(section, currentPath);

      // Also update prev_section to track where we came from
      storePreviousSection(section);
    }
  }, [route.name, route.params, explicitSection, user.username]);
};

/**
 * Navigate to the last visited path in a section
 * @param navigation React Navigation navigation object
 * @param section The section to navigate to
 */
export const navigateToLastPath = async (navigation: any, section: string): Promise<void> => {
  try {
    const lastPath = await getLastPath(section);
    
    // Parse the path to extract route name and params
    const [routeName, paramsStr] = lastPath.split(':');
    let params;
    
    if (paramsStr) {
      try {
        params = JSON.parse(paramsStr);
      } catch (e) {
        console.error('Error parsing navigation params:', e);
      }
    }
    
    // Navigate to the route
    if (params) {
      navigation.navigate(routeName, params);
    } else {
      navigation.navigate(routeName);
    }
  } catch (error) {
    console.error('Error navigating to last path:', error);
    // Fallback to section default
    navigation.navigate(section);
  }
};