// src/redux/slices/notificationPreferencesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { getToken, getUserId } from '@/utils/tokenUtils';

// Define response type for the API
interface NotificationToggleResponse {
  success?: boolean;
  isNotificationsOn?: boolean;
  message?: string;
}

// Constants for localStorage
const NOTIFICATION_PREFS_KEY = 'notificationPreferences';
const isBrowser = typeof window !== 'undefined';

// Define the state interface
interface NotificationPreferencesState {
  communityPreferences: Record<string, boolean>; // Map of communityId -> notification enabled
  isLoading: boolean;
  error: string | null;
}

// Helper to get saved preferences from localStorage
const getSavedPreferences = (): Record<string, boolean> => {
  if (!isBrowser) return {};
  
  try {
    const userId = getUserId();
    if (!userId) return {};
    
    const savedPrefs = localStorage.getItem(`user_${userId}_${NOTIFICATION_PREFS_KEY}`);
    if (savedPrefs) {
      const parsed = JSON.parse(savedPrefs);
      console.log(`Loaded notification preferences from localStorage:`, parsed);
      return parsed;
    }
  } catch (err) {
    console.error('Error loading notification preferences from storage:', err);
  }
  
  return {};
};

// Helper to save preferences to localStorage
const savePreferences = (preferences: Record<string, boolean>) => {
  if (!isBrowser) return;
  
  try {
    const userId = getUserId();
    if (!userId) return;
    
    console.log(`Saving notification preferences to localStorage:`, preferences);
    localStorage.setItem(
      `user_${userId}_${NOTIFICATION_PREFS_KEY}`, 
      JSON.stringify(preferences)
    );
  } catch (err) {
    console.error('Error saving notification preferences to storage:', err);
  }
};

// Initial state with persistence
const initialState: NotificationPreferencesState = {
  communityPreferences: getSavedPreferences(),
  isLoading: false,
  error: null
};

// Async thunk to toggle notification preference
export const toggleNotificationPreference = createAsyncThunk(
  'notificationPreferences/toggle',
  async (communityId: string, { getState, rejectWithValue }) => {
    try {
      // Get current preferences from state
      const state = getState() as { notificationPreferences: NotificationPreferencesState };
      const currentValue = state.notificationPreferences.communityPreferences[communityId] ?? false;
      
      console.log(`Current notification state before API call: ${currentValue}`);
      
      // Make API call to toggle on server
      const token = getToken();
      const timestamp = Date.now(); // Add timestamp to prevent caching
      const response = await apiClient.post<NotificationToggleResponse>(
        `/communities/${communityId}/notifications/toggle?t=${timestamp}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token || ''}`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          },
          withCredentials: true
        }
      );

      console.log('API response:', response.data);
      
      // If API call successful, return the new state
      if (response.data && response.data.success !== false) {
        // Use the server response value if available, otherwise just toggle the current value
        const newValue = response.data.isNotificationsOn !== undefined 
          ? Boolean(response.data.isNotificationsOn) 
          : !currentValue;
          
        console.log(`New notification state after API call: ${newValue}`);
        
        // Immediately save to localStorage for extra persistence
        const updatedPreferences = {
          ...state.notificationPreferences.communityPreferences,
          [communityId]: newValue
        };
        savePreferences(updatedPreferences);
        
        return { communityId, enabled: newValue };
      }
      
      console.error('API call failed:', response.data?.message);
      return rejectWithValue(response.data?.message || 'Failed to toggle notification preference');
    } catch (error: unknown) {
      console.error('Error in toggleNotificationPreference:', error);
      
      // Type-safe error handling
      let errorMessage = 'Failed to toggle notification preference';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Create the slice
const notificationPreferencesSlice = createSlice({
  name: 'notificationPreferences',
  initialState,
  reducers: {
    // Directly set a notification preference (for initialization or sync)
    setNotificationPreference: (
      state, 
      action: PayloadAction<{ communityId: string; enabled: boolean }>
    ) => {
      const { communityId, enabled } = action.payload;
      // Convert to boolean to ensure consistency
      const enabledBool = Boolean(enabled);
      console.log(`Setting notification preference directly: ${communityId} => ${enabledBool}`);
      state.communityPreferences[communityId] = enabledBool;
      
      // Save to localStorage
      savePreferences(state.communityPreferences);
    },
    
    // Initialize preferences from localStorage or server data
    initializePreferences: (
      state,
      action: PayloadAction<Record<string, boolean>>
    ) => {
      console.log('Initializing notification preferences:', action.payload);
      state.communityPreferences = action.payload;
      
      // Save to localStorage
      savePreferences(action.payload);
    },
    
    // Clear all preferences (e.g., on logout)
    clearPreferences: (state) => {
      console.log('Clearing all notification preferences');
      state.communityPreferences = {};
      
      // Clear from localStorage
      if (isBrowser) {
        const userId = getUserId();
        if (userId) {
          localStorage.removeItem(`user_${userId}_${NOTIFICATION_PREFS_KEY}`);
        }
      }
    },
    
    // Update a single preference from server data
    updatePreferenceFromServer: (
      state,
      action: PayloadAction<{ communityId: string; enabled: boolean }>
    ) => {
      const { communityId, enabled } = action.payload;
      const enabledBool = Boolean(enabled);
      
      // Only update if we don't already have this preference saved
      if (!(communityId in state.communityPreferences)) {
        console.log(`Updating preference from server (initial load): ${communityId} => ${enabledBool}`);
        state.communityPreferences[communityId] = enabledBool;
        
        // Save to localStorage
        savePreferences(state.communityPreferences);
      } else {
        console.log(`Skipping server update for existing preference: ${communityId} => already set to ${state.communityPreferences[communityId]}`);
      }
    }
  },
  extraReducers: (builder) => {
    // Handle async toggle operation
    builder
      .addCase(toggleNotificationPreference.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        console.log('Toggle notification: PENDING');
      })
      .addCase(toggleNotificationPreference.fulfilled, (state, action) => {
        const { communityId, enabled } = action.payload;
        console.log(`Toggle notification FULFILLED: ${communityId} => ${enabled}`);
        state.communityPreferences[communityId] = enabled;
        state.isLoading = false;
        
        // Save to localStorage
        savePreferences(state.communityPreferences);
      })
      .addCase(toggleNotificationPreference.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        console.error('Toggle notification REJECTED:', action.payload);
      });
  }
});

// Export actions and reducer
export const { 
  setNotificationPreference, 
  initializePreferences,
  clearPreferences,
  updatePreferenceFromServer
} = notificationPreferencesSlice.actions;

export default notificationPreferencesSlice.reducer;