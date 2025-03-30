// src/redux/slices/communitySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { 
  setSessionItem, 
  getSessionItem, 
  removeSessionItem 
} from '@/utils/sessionUtils';
import { getUserId } from '@/utils/tokenUtils';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

interface CommunityState {
  joinedCommunities: string[]; // Array of community IDs the user has joined
  featuredCommunities: string[]; // Top 5 communities to show in profile
  isSidebarOpen: boolean; // State of the sidebar
}

// Keys for community data storage
const JOINED_COMMUNITIES_KEY = 'joinedCommunities';
const FEATURED_COMMUNITIES_KEY = 'featuredCommunities';
const SIDEBAR_STATE_KEY = 'communitySidebarOpen';

// Load initial state from session storage
const loadInitialState = (): CommunityState => {
  // Default initial state for server-side rendering or in case of errors
  const defaultState: CommunityState = {
    joinedCommunities: [],
    featuredCommunities: [],
    isSidebarOpen: true
  };

  // Skip localStorage operations if not in browser
  if (!isBrowser) {
    return defaultState;
  }

  try {
    const currentUserId = getUserId();
    
    // If no user ID, return default state
    if (!currentUserId) {
      return defaultState;
    }
    
    // Try to get joined communities
    const joinedCommunitiesJson = getSessionItem(JOINED_COMMUNITIES_KEY);
    const isSidebarOpen = getSessionItem(SIDEBAR_STATE_KEY) !== 'false'; // Default to true

    if (joinedCommunitiesJson) {
      try {
        const joinedCommunities = JSON.parse(joinedCommunitiesJson);
        
        // Ensure it's an array
        if (Array.isArray(joinedCommunities)) {
          // Try to get featured communities
          const featuredCommunitiesJson = getSessionItem(FEATURED_COMMUNITIES_KEY);
          let featuredCommunities = joinedCommunities.slice(0, 5); // Default to first 5
          
          if (featuredCommunitiesJson) {
            try {
              const parsed = JSON.parse(featuredCommunitiesJson);
              if (Array.isArray(parsed)) {
                featuredCommunities = parsed;
              }
            } catch (e) {
              console.error('Error parsing featured communities:', e);
            }
          }
          
          return {
            joinedCommunities,
            featuredCommunities,
            isSidebarOpen
          };
        }
      } catch (e) {
        console.error('Error parsing joined communities:', e);
      }
    }
  } catch (e) {
    console.error('Error loading initial community state:', e);
  }

  // Default initial state if nothing in storage or there was an error
  return defaultState;
};

const initialState: CommunityState = loadInitialState();

const communitySlice = createSlice({
  name: "communities",
  initialState,
  reducers: {
    // Update the list of joined communities
    updateUserCommunities: (state, action: PayloadAction<string[]>) => {
      state.joinedCommunities = action.payload;
      
      // Update featured communities (top 5)
      state.featuredCommunities = action.payload.slice(0, 5);
      
      // Save to session storage (only in browser)
      if (isBrowser) {
        setSessionItem(JOINED_COMMUNITIES_KEY, JSON.stringify(action.payload));
      }
    },
    
    // Add a single community to joined list
    joinCommunity: (state, action: PayloadAction<string>) => {
      const communityId = action.payload;
      if (!state.joinedCommunities.includes(communityId)) {
        state.joinedCommunities.push(communityId);
        
        // Update featured if needed
        if (state.featuredCommunities.length < 5) {
          state.featuredCommunities.push(communityId);
        }
        
        // Save to session storage (only in browser)
        if (isBrowser) {
          setSessionItem(JOINED_COMMUNITIES_KEY, JSON.stringify(state.joinedCommunities));
          setSessionItem(FEATURED_COMMUNITIES_KEY, JSON.stringify(state.featuredCommunities));
        }
      }
    },
    
    // Remove a community from joined list
    leaveCommunity: (state, action: PayloadAction<string>) => {
      const communityId = action.payload;
      state.joinedCommunities = state.joinedCommunities.filter(id => id !== communityId);
      state.featuredCommunities = state.featuredCommunities.filter(id => id !== communityId);
      
      // Update featured if needed
      if (state.featuredCommunities.length < 5 && state.joinedCommunities.length > 0) {
        // Find up to 5 communities not already in featured
        const additionalFeatures = state.joinedCommunities
          .filter(id => !state.featuredCommunities.includes(id))
          .slice(0, 5 - state.featuredCommunities.length);
        
        state.featuredCommunities = [...state.featuredCommunities, ...additionalFeatures];
      }
      
      // Save to session storage (only in browser)
      if (isBrowser) {
        setSessionItem(JOINED_COMMUNITIES_KEY, JSON.stringify(state.joinedCommunities));
        setSessionItem(FEATURED_COMMUNITIES_KEY, JSON.stringify(state.featuredCommunities));
      }
    },
    
    // Toggle sidebar state
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
      
      // Save preference (only in browser)
      if (isBrowser) {
        setSessionItem(SIDEBAR_STATE_KEY, String(state.isSidebarOpen));
      }
    },
    
    // Set sidebar state explicitly
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
      
      // Save preference (only in browser)
      if (isBrowser) {
        setSessionItem(SIDEBAR_STATE_KEY, String(action.payload));
      }
    },
    
    // Update the featured communities (top 5 for profile)
    updateFeaturedCommunities: (state, action: PayloadAction<string[]>) => {
      // Ensure we only have communities that are actually joined
      const validFeatured = action.payload.filter(id => 
        state.joinedCommunities.includes(id)
      );
      
      // Limit to 5
      state.featuredCommunities = validFeatured.slice(0, 5);
      
      // Save to session storage (only in browser)
      if (isBrowser) {
        setSessionItem(FEATURED_COMMUNITIES_KEY, JSON.stringify(state.featuredCommunities));
      }
    },
    
    // Clear communities when logging out
    clearCommunities: (state) => {
      state.joinedCommunities = [];
      state.featuredCommunities = [];
      
      // Remove from session storage (only in browser)
      if (isBrowser) {
        removeSessionItem(JOINED_COMMUNITIES_KEY);
        removeSessionItem(FEATURED_COMMUNITIES_KEY);
      }
    }
  },
});

export const { 
  updateUserCommunities, 
  joinCommunity, 
  leaveCommunity, 
  toggleSidebar, 
  setSidebarOpen,
  updateFeaturedCommunities,
  clearCommunities
} = communitySlice.actions;

export default communitySlice.reducer;