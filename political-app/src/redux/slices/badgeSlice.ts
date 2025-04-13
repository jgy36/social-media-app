// src/redux/slices/badgeSlice.ts - Improved user isolation
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getUserId } from "@/utils/tokenUtils";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Key for storage
const USER_BADGES_KEY = 'userBadges';

interface BadgeState {
  badges: string[]; // Array of badge IDs
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

const initialState: BadgeState = {
  badges: loadUserBadges()
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
      saveUserBadges(state.badges);
    },
    
    // Clear all badges (used during logout)
    clearBadges: (state) => {
      state.badges = [];
      clearUserBadgesFromStorage();
    },
    
    // Reload badges from storage (used when user changes)
    reloadBadges: (state) => {
      state.badges = loadUserBadges();
    }
  },
});

export const { addBadge, removeBadge, setBadges, clearBadges, reloadBadges } = badgeSlice.actions;

export default badgeSlice.reducer;