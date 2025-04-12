// src/redux/slices/notificationPreferencesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/api/apiClient";
import { getUserId } from "@/utils/tokenUtils";

// Define the notification preferences interface
export interface NotificationPreferences {
  emailNotifications: boolean;
  newCommentNotifications: boolean;
  mentionNotifications: boolean;
  politicalUpdates: boolean;
  communityUpdates: boolean;
  directMessageNotifications: boolean;
  followNotifications: boolean;
  likeNotifications: boolean;
}

// State interface
interface NotificationPreferencesState {
  preferences: NotificationPreferences;
  isLoading: boolean;
  error: string | null;
}

// Default preferences
const defaultPreferences: NotificationPreferences = {
  emailNotifications: true,
  newCommentNotifications: true,
  mentionNotifications: true,
  politicalUpdates: false,
  communityUpdates: true,
  directMessageNotifications: true,
  followNotifications: true,
  likeNotifications: true,
};

// Helper to load preferences from localStorage
const loadSavedPreferences = (): NotificationPreferences => {
  if (typeof window === 'undefined') return defaultPreferences;
  
  try {
    const userId = getUserId();
    if (!userId) return defaultPreferences;
    
    const savedPrefs = localStorage.getItem(`user_${userId}_notificationPreferences`);
    if (savedPrefs) {
      return JSON.parse(savedPrefs);
    }
  } catch (error) {
    console.error('Error loading notification preferences:', error);
  }
  
  return defaultPreferences;
};

// Initial state
const initialState: NotificationPreferencesState = {
  preferences: loadSavedPreferences(),
  isLoading: false,
  error: null,
};

// Async thunk to fetch notification preferences
export const fetchNotificationPreferences = createAsyncThunk(
  'notificationPreferences/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<NotificationPreferences>('/users/notification-preferences');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notification preferences');
    }
  }
);

// Async thunk to update notification preferences
export const updateNotificationPreferences = createAsyncThunk(
  'notificationPreferences/update',
  async (preferences: NotificationPreferences, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<{ success: boolean }>('/users/notification-preferences', preferences);
      
      if (response.data.success) {
        return preferences;
      } else {
        return rejectWithValue('Failed to update notification preferences');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update notification preferences');
    }
  }
);

// Create the slice
const notificationPreferencesSlice = createSlice({
  name: 'notificationPreferences',
  initialState,
  reducers: {
    // Direct update for a single preference
    togglePreference: (state, action: PayloadAction<{ key: keyof NotificationPreferences }>) => {
      const { key } = action.payload;
      state.preferences[key] = !state.preferences[key];
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        const userId = getUserId();
        if (userId) {
          localStorage.setItem(
            `user_${userId}_notificationPreferences`, 
            JSON.stringify(state.preferences)
          );
        }
      }
    },
    
    // Reset preferences to default
    resetPreferences: (state) => {
      state.preferences = defaultPreferences;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        const userId = getUserId();
        if (userId) {
          localStorage.setItem(
            `user_${userId}_notificationPreferences`, 
            JSON.stringify(defaultPreferences)
          );
        }
      }
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchNotificationPreferences
    builder
      .addCase(fetchNotificationPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          const userId = getUserId();
          if (userId) {
            localStorage.setItem(
              `user_${userId}_notificationPreferences`, 
              JSON.stringify(action.payload)
            );
          }
        }
      })
      .addCase(fetchNotificationPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Handle updateNotificationPreferences
    builder
      .addCase(updateNotificationPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          const userId = getUserId();
          if (userId) {
            localStorage.setItem(
              `user_${userId}_notificationPreferences`, 
              JSON.stringify(action.payload)
            );
          }
        }
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { 
  togglePreference, 
  resetPreferences,
  clearError
} = notificationPreferencesSlice.actions;

export default notificationPreferencesSlice.reducer;