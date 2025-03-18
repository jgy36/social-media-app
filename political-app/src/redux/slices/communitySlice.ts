// src/redux/slices/communitySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getCookie, setCookie } from "cookies-next";

interface CommunityState {
  joinedCommunities: string[]; // Array of community IDs the user has joined
  featuredCommunities: string[]; // Top 5 communities to show in profile
  isSidebarOpen: boolean; // State of the sidebar
}

// Load initial state from local storage or cookies
const loadInitialState = (): CommunityState => {
  try {
    // Try to get from localStorage first (better persistence)
    if (typeof window !== 'undefined') {
      const joinedCommunitiesJson = localStorage.getItem('joinedCommunities');
      const isSidebarOpen = localStorage.getItem('communitySidebarOpen') !== 'false'; // Default to true

      if (joinedCommunitiesJson) {
        const joinedCommunities = JSON.parse(joinedCommunitiesJson);
        // Ensure it's an array
        if (Array.isArray(joinedCommunities)) {
          return {
            joinedCommunities,
            featuredCommunities: joinedCommunities.slice(0, 5), // Take first 5 as featured
            isSidebarOpen
          };
        }
      }
    }

    // Fallback to cookies if localStorage fails
    const cookieJoinedCommunities = getCookie('joinedCommunities') as string;
    if (cookieJoinedCommunities) {
      try {
        const joinedCommunities = JSON.parse(cookieJoinedCommunities);
        if (Array.isArray(joinedCommunities)) {
          return {
            joinedCommunities,
            featuredCommunities: joinedCommunities.slice(0, 5), // Take first 5 as featured
            isSidebarOpen: true
          };
        }
      } catch (e) {
        console.error('Error parsing joined communities cookie:', e);
      }
    }
  } catch (e) {
    console.error('Error loading initial community state:', e);
  }

  // Default initial state if nothing in storage
  return {
    joinedCommunities: [],
    featuredCommunities: [],
    isSidebarOpen: true
  };
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
      
      // Save to localStorage and cookies for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('joinedCommunities', JSON.stringify(action.payload));
        setCookie('joinedCommunities', JSON.stringify(action.payload));
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
        
        // Save to localStorage and cookies
        if (typeof window !== 'undefined') {
          localStorage.setItem('joinedCommunities', JSON.stringify(state.joinedCommunities));
          setCookie('joinedCommunities', JSON.stringify(state.joinedCommunities));
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
      
      // Save to localStorage and cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('joinedCommunities', JSON.stringify(state.joinedCommunities));
        setCookie('joinedCommunities', JSON.stringify(state.joinedCommunities));
      }
    },
    
    // Toggle sidebar state
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
      
      // Save preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('communitySidebarOpen', String(state.isSidebarOpen));
      }
    },
    
    // Set sidebar state explicitly
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
      
      // Save preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('communitySidebarOpen', String(action.payload));
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
    }
  },
});

export const { 
  updateUserCommunities, 
  joinCommunity, 
  leaveCommunity, 
  toggleSidebar, 
  setSidebarOpen,
  updateFeaturedCommunities
} = communitySlice.actions;

export default communitySlice.reducer;