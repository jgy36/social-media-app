// src/redux/slices/badgeSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserId } from "@/utils/tokenUtils";
import { getUserBadges } from "@/api/badges";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Key for storage
const USER_BADGES_KEY = 'userBadges';

interface BadgeState {
  badges: string[]; // Array of badge IDs
  initialized: boolean;
}

// Helper to load badges from localStorage with proper user isolation
const loadUserBadges = (): string[] => {
  if (!isBrowser) return [];
  
  try {
    const userId = getUserId();
    if (!userId) return [];
    
    const savedBadges = localStorage.getItem(`user_${userId}_${USER_BADGES_KEY}`);
    if (savedBadges) {
      const parsed = JSON.parse(savedBadges);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.error('Error loading user badges:', err);
  }
  
  return [];
};

// Helper to save badges to localStorage
const saveUserBadges = (badges: string[]) => {
  if (!isBrowser) return;
  
  try {
    const userId = getUserId();
    if (!userId) return;
    
    // Log the save operation for debugging
    console.log(`Saving badges for user ${userId}:`, badges);
    
    localStorage.setItem(
      `user_${userId}_${USER_BADGES_KEY}`, 
      JSON.stringify(badges)
    );
  } catch (err) {
    console.error('Error saving user badges:', err);
  }
};

// Helper to clear badges from localStorage
const clearUserBadgesFromStorage = () => {
  if (!isBrowser) return;
  
  try {
    const userId = getUserId();
    if (!userId) return;
    
    // Remove badges from this user
    localStorage.removeItem(`user_${userId}_${USER_BADGES_KEY}`);
  } catch (err) {
    console.error('Error clearing user badges:', err);
  }
};

// Fetch user badges from the server
export const fetchUserBadges = createAsyncThunk(
  'badges/fetchFromServer',
  async (_, { rejectWithValue }) => {
    try {
      const badges = await getUserBadges();
      return badges;
    } catch (error) {
      console.error('Error fetching user badges:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch badges');
    }
  }
);

const initialState: BadgeState = {
  badges: [], // Start with empty and initialize on app load
  initialized: false
};

const badgeSlice = createSlice({
  name: "badges",
  initialState,
  reducers: {
    // Add a single badge
    addBadge: (state, action: PayloadAction<string>) => {
      const badgeId = action.payload;
      
      // Only add if not already present and under limit
      if (!state.badges.includes(badgeId) && state.badges.length < 10) {
        state.badges.push(badgeId);
        saveUserBadges(state.badges);
      }
    },
    
    // Remove a badge
    removeBadge: (state, action: PayloadAction<string>) => {
      state.badges = state.badges.filter(id => id !== action.payload);
      saveUserBadges(state.badges);
    },
    
    // Set all badges at once (limited to 10)
    setBadges: (state, action: PayloadAction<string[]>) => {
      // Ensure we don't exceed the 10 badge limit
      state.badges = action.payload.slice(0, 10);
      state.initialized = true;
      saveUserBadges(state.badges);
    },
    
    // Clear all badges (used during logout)
    clearBadges: (state) => {
      state.badges = [];
      state.initialized = false;
      clearUserBadgesFromStorage();
    },
    
    // Initialize badges from localStorage (used on app startup)
    initializeBadges: (state) => {
      if (!state.initialized) {
        state.badges = loadUserBadges();
        state.initialized = true;
      }
    }
  },
  extraReducers: (builder) => {
    // Handle fetchUserBadges
    builder.addCase(fetchUserBadges.fulfilled, (state, action) => {
      if (action.payload && action.payload.length > 0) {
        // If we have server-side badges, use those
        state.badges = action.payload;
      } else if (!state.initialized) {
        // If not initialized yet and no server badges, try loading from localStorage
        state.badges = loadUserBadges();
      }
      // Either way, mark as initialized
      state.initialized = true;
      
      // Save to localStorage
      saveUserBadges(state.badges);
    });
  }
});

export const { addBadge, removeBadge, setBadges, clearBadges, initializeBadges } = badgeSlice.actions;

export default badgeSlice.reducer;