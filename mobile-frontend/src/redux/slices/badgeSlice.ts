// src/redux/slices/badgeSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserId } from "@/utils/tokenUtils";
import { getUserBadges } from "@/api/badges";

// Key for storage
const USER_BADGES_KEY = 'userBadges';

interface BadgeState {
  badges: string[]; // Array of badge IDs
  initialized: boolean;
}

// Initial state with default values
const initialState: BadgeState = {
  badges: [], // Start with empty and initialize on app load
  initialized: false
};

// Helper to load badges from AsyncStorage with proper user isolation
const loadUserBadges = async (): Promise<string[]> => {
  try {
    const userId = await getUserId();
    if (!userId) return [];
    
    const savedBadges = await AsyncStorage.getItem(`user_${userId}_${USER_BADGES_KEY}`);
    if (savedBadges) {
      const parsed = JSON.parse(savedBadges);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.error('Error loading user badges:', err);
  }
  
  return [];
};

// Helper to save badges to AsyncStorage
const saveUserBadges = async (badges: string[]) => {
  try {
    const userId = await getUserId();
    if (!userId) return;
    
    // Log the save operation for debugging
    console.log(`Saving badges for user ${userId}:`, badges);
    
    await AsyncStorage.setItem(
      `user_${userId}_${USER_BADGES_KEY}`, 
      JSON.stringify(badges)
    );
  } catch (err) {
    console.error('Error saving user badges:', err);
  }
};

// Helper to clear badges from AsyncStorage
const clearUserBadgesFromStorage = async () => {
  try {
    const userId = await getUserId();
    if (!userId) return;
    
    // Remove badges from this user
    await AsyncStorage.removeItem(`user_${userId}_${USER_BADGES_KEY}`);
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

// Initialize badges from AsyncStorage
export const initializeBadges = createAsyncThunk(
  'badges/initialize',
  async () => {
    try {
      // Return empty array if loading fails
      return await loadUserBadges() || [];
    } catch (error) {
      console.error('Error initializing badges:', error);
      return []; // Always return a valid array
    }
  }
);

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
        // Use non-blocking approach for AsyncStorage
        saveUserBadges(state.badges).catch(err => console.error('Error saving badge:', err));
      }
    },
    
    // Remove a badge
    removeBadge: (state, action: PayloadAction<string>) => {
      state.badges = state.badges.filter(id => id !== action.payload);
      // Use non-blocking approach for AsyncStorage
      saveUserBadges(state.badges).catch(err => console.error('Error removing badge:', err));
    },
    
    // Set all badges at once (limited to 10)
    setBadges: (state, action: PayloadAction<string[]>) => {
      // Ensure we don't exceed the 10 badge limit and that it's always an array
      const badgeArray = Array.isArray(action.payload) ? action.payload : [];
      state.badges = badgeArray.slice(0, 10);
      state.initialized = true;
      // Use non-blocking approach for AsyncStorage
      saveUserBadges(state.badges).catch(err => console.error('Error setting badges:', err));
    },
    
    // Clear all badges (used during logout)
    clearBadges: (state) => {
      state.badges = [];
      state.initialized = false;
      // Use non-blocking approach for AsyncStorage
      clearUserBadgesFromStorage().catch(err => console.error('Error clearing badges:', err));
    }
  },
  extraReducers: (builder) => {
    // Handle initializeBadges
    builder.addCase(initializeBadges.fulfilled, (state, action) => {
      if (!state.initialized) {
        // Ensure action.payload is an array
        state.badges = Array.isArray(action.payload) ? action.payload : [];
        state.initialized = true;
      }
    });
    
    // Add a separate case for when initialize fails
    builder.addCase(initializeBadges.rejected, (state) => {
      // Still mark as initialized even if loading failed
      state.badges = [];
      state.initialized = true;
    });

    // Handle fetchUserBadges
    builder.addCase(fetchUserBadges.fulfilled, (state, action) => {
      // Ensure action.payload is an array
      const badgeArray = Array.isArray(action.payload) ? action.payload : [];
      
      if (badgeArray.length > 0) {
        // If we have server-side badges, use those
        state.badges = badgeArray;
      } else if (!state.initialized) {
        // If not initialized yet and no server badges, ensure badges is a valid array
        state.badges = [];
      }
      // Either way, mark as initialized
      state.initialized = true;
      
      // Save to AsyncStorage - use non-blocking approach
      saveUserBadges(state.badges).catch(err => console.error('Error saving badges from server:', err));
    });
    
    // Add a separate case for when fetch fails
    builder.addCase(fetchUserBadges.rejected, (state) => {
      // Still mark as initialized even if fetch failed
      state.initialized = true;
    });
  }
});

export const { addBadge, removeBadge, setBadges, clearBadges } = badgeSlice.actions;

export default badgeSlice.reducer;