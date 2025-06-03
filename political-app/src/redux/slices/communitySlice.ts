// src/redux/slices/communitySlice.ts - Updated with community restoration
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { 
  setSessionItem, 
  getSessionItem, 
  removeSessionItem 
} from '@/utils/sessionUtils';
import { getUserId } from '@/utils/tokenUtils';
import api from '@/api';

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

// Async thunk to fetch and restore user communities after login
export const fetchAndRestoreUserCommunities = createAsyncThunk(
  'communities/fetchAndRestore',
  async (_, { rejectWithValue }) => {
    try {
      // Import communities API dynamically to avoid circular dependencies
      const communitiesApi = await import('@/api/communities');
      
      // Fetch user's joined communities from the server
      const userCommunities = await communitiesApi.getUserCommunities();
      
      if (Array.isArray(userCommunities)) {
        // Extract community IDs for Redux state
        const communityIds = userCommunities.map(community => community.id);
        
        // Get featured communities (first 5 or all if less than 5)
        const featuredIds = communityIds.slice(0, 5);
        
        return {
          joinedCommunities: communityIds,
          featuredCommunities: featuredIds
        };
      }
      
      return { joinedCommunities: [], featuredCommunities: [] };
    } catch (error) {
      console.error('Error restoring user communities:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to restore communities');
    }
  }
);

// Load initial state from localStorage
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
    const joinedCommunitiesJson = localStorage.getItem(`user_${currentUserId}_${JOINED_COMMUNITIES_KEY}`);
    const isSidebarOpen = localStorage.getItem(`user_${currentUserId}_${SIDEBAR_STATE_KEY}`) !== 'false'; // Default to true

    if (joinedCommunitiesJson) {
      try {
        const joinedCommunities = JSON.parse(joinedCommunitiesJson);
        
        // Ensure it's an array
        if (Array.isArray(joinedCommunities)) {
          // Try to get featured communities
          const featuredCommunitiesJson = localStorage.getItem(`user_${currentUserId}_${FEATURED_COMMUNITIES_KEY}`);
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

// Async thunk for joining a community
export const joinCommunity = createAsyncThunk(
  'communities/join',
  async (communityId: string, { rejectWithValue }) => {
    try {
      const response = await api.communities.joinCommunity(communityId);
      
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to join community');
      }
      
      return communityId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to join community');
    }
  }
);

// Async thunk for leaving a community
export const leaveCommunity = createAsyncThunk(
  'communities/leave',
  async (communityId: string, { rejectWithValue }) => {
    try {
      const response = await api.communities.leaveCommunity(communityId);
      
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to leave community');
      }
      
      return communityId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to leave community');
    }
  }
);

const communitySlice = createSlice({
  name: "communities",
  initialState,
  reducers: {
    // Update the list of joined communities
    updateUserCommunities: (state, action: PayloadAction<string[]>) => {
      state.joinedCommunities = action.payload;
      
      // Update featured communities (top 5)
      state.featuredCommunities = action.payload.slice(0, 5);
      
      // Save to localStorage (only in browser)
      if (isBrowser) {
        const currentUserId = getUserId();
        if (currentUserId) {
          localStorage.setItem(
            `user_${currentUserId}_${JOINED_COMMUNITIES_KEY}`, 
            JSON.stringify(action.payload)
          );
          
          localStorage.setItem(
            `user_${currentUserId}_${FEATURED_COMMUNITIES_KEY}`, 
            JSON.stringify(action.payload.slice(0, 5))
          );
        }
      }
    },
    
    // Add a single community to joined list
    joinCommunityAction: (state, action: PayloadAction<string>) => {
      const communityId = action.payload;
      if (!state.joinedCommunities.includes(communityId)) {
        state.joinedCommunities.push(communityId);
        
        // Update featured if needed
        if (state.featuredCommunities.length < 5) {
          state.featuredCommunities.push(communityId);
        }
        
        // Save to localStorage (only in browser)
        if (isBrowser) {
          const currentUserId = getUserId();
          if (currentUserId) {
            localStorage.setItem(
              `user_${currentUserId}_${JOINED_COMMUNITIES_KEY}`, 
              JSON.stringify(state.joinedCommunities)
            );
            
            localStorage.setItem(
              `user_${currentUserId}_${FEATURED_COMMUNITIES_KEY}`, 
              JSON.stringify(state.featuredCommunities)
            );
          }
        }
      }
    },
    
    // Remove a community from joined list
    leaveCommunityAction: (state, action: PayloadAction<string>) => {
      const communityId = action.payload;
      state.joinedCommunities = state.joinedCommunities.filter(id => id !== communityId);
      state.featuredCommunities = state.featuredCommunities.filter(id => id !== communityId);
      
      // Save to localStorage (only in browser)
      if (isBrowser) {
        const currentUserId = getUserId();
        if (currentUserId) {
          localStorage.setItem(
            `user_${currentUserId}_${JOINED_COMMUNITIES_KEY}`, 
            JSON.stringify(state.joinedCommunities)
          );
          
          localStorage.setItem(
            `user_${currentUserId}_${FEATURED_COMMUNITIES_KEY}`, 
            JSON.stringify(state.featuredCommunities)
          );
        }
      }
    },
    
    // Toggle sidebar state
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
      
      // Save preference (only in browser)
      if (isBrowser) {
        const currentUserId = getUserId();
        if (currentUserId) {
          localStorage.setItem(
            `user_${currentUserId}_${SIDEBAR_STATE_KEY}`, 
            String(state.isSidebarOpen)
          );
        }
      }
    },
    
    // Set sidebar state explicitly
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
      
      // Save preference (only in browser)
      if (isBrowser) {
        const currentUserId = getUserId();
        if (currentUserId) {
          localStorage.setItem(
            `user_${currentUserId}_${SIDEBAR_STATE_KEY}`, 
            String(action.payload)
          );
        }
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
      
      // Save to localStorage (only in browser)
      if (isBrowser) {
        const currentUserId = getUserId();
        if (currentUserId) {
          localStorage.setItem(
            `user_${currentUserId}_${FEATURED_COMMUNITIES_KEY}`, 
            JSON.stringify(state.featuredCommunities)
          );
        }
      }
    },
    
    // Clear communities when logging out
    clearCommunities: (state) => {
      state.joinedCommunities = [];
      state.featuredCommunities = [];
      
      // Remove from localStorage (only in browser)
      if (isBrowser) {
        const currentUserId = getUserId();
        if (currentUserId) {
          localStorage.removeItem(`user_${currentUserId}_${JOINED_COMMUNITIES_KEY}`);
          localStorage.removeItem(`user_${currentUserId}_${FEATURED_COMMUNITIES_KEY}`);
        }
      }
    }
  },
  extraReducers: (builder) => {
    // Handle async join community
    builder.addCase(joinCommunity.fulfilled, (state, action) => {
      const communityId = action.payload as string;
      if (!state.joinedCommunities.includes(communityId)) {
        state.joinedCommunities.push(communityId);
        
        // Update featured if needed
        if (state.featuredCommunities.length < 5) {
          state.featuredCommunities.push(communityId);
        }
        
        // Save to localStorage
        if (isBrowser) {
          const currentUserId = getUserId();
          if (currentUserId) {
            localStorage.setItem(
              `user_${currentUserId}_${JOINED_COMMUNITIES_KEY}`, 
              JSON.stringify(state.joinedCommunities)
            );
            
            localStorage.setItem(
              `user_${currentUserId}_${FEATURED_COMMUNITIES_KEY}`, 
              JSON.stringify(state.featuredCommunities)
            );
          }
        }
      }
    });
    
    // Handle async leave community
    builder.addCase(leaveCommunity.fulfilled, (state, action) => {
      const communityId = action.payload as string;
      state.joinedCommunities = state.joinedCommunities.filter(id => id !== communityId);
      state.featuredCommunities = state.featuredCommunities.filter(id => id !== communityId);
      
      // Save to localStorage
      if (isBrowser) {
        const currentUserId = getUserId();
        if (currentUserId) {
          localStorage.setItem(
            `user_${currentUserId}_${JOINED_COMMUNITIES_KEY}`, 
            JSON.stringify(state.joinedCommunities)
          );
          
          localStorage.setItem(
            `user_${currentUserId}_${FEATURED_COMMUNITIES_KEY}`, 
            JSON.stringify(state.featuredCommunities)
          );
        }
      }
    });
    
    // Handle fetchAndRestoreUserCommunities action
    builder.addCase(fetchAndRestoreUserCommunities.fulfilled, (state, action) => {
      // Update state with the fetched communities
      state.joinedCommunities = action.payload.joinedCommunities;
      state.featuredCommunities = action.payload.featuredCommunities;
      
      // Save to localStorage
      if (isBrowser) {
        const currentUserId = getUserId();
        if (currentUserId) {
          localStorage.setItem(
            `user_${currentUserId}_${JOINED_COMMUNITIES_KEY}`, 
            JSON.stringify(action.payload.joinedCommunities)
          );
          
          localStorage.setItem(
            `user_${currentUserId}_${FEATURED_COMMUNITIES_KEY}`, 
            JSON.stringify(action.payload.featuredCommunities)
          );
        }
      }
    });

    builder.addCase(fetchAndRestoreUserCommunities.rejected, (state, action) => {
      console.error('Failed to restore communities:', action.payload);
      // Keep the state as is or set default values if needed
    });
  }
});

export const { 
  updateUserCommunities, 
  joinCommunityAction, 
  leaveCommunityAction, 
  toggleSidebar, 
  setSidebarOpen,
  updateFeaturedCommunities,
  clearCommunities
} = communitySlice.actions;

export default communitySlice.reducer;