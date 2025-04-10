// src/redux/slices/notificationPreferencesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { getToken } from '@/utils/tokenUtils';

// Define the state interface
interface NotificationPreferencesState {
  communityPreferences: Record<string, boolean>; // Map of communityId -> notification enabled
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: NotificationPreferencesState = {
  communityPreferences: {},
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
      const currentValue = state.notificationPreferences.communityPreferences[communityId] || false;
      
      // Make API call to toggle on server
      const token = getToken();
      const response = await apiClient.post(
        `/communities/${communityId}/notifications/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token || ''}`,
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        }
      );

      // If API call successful, return the new state
      if (response.data && response.data.success !== false) {
        // Use the server response value if available, otherwise just toggle the current value
        const newValue = response.data.isNotificationsOn !== undefined 
          ? response.data.isNotificationsOn 
          : !currentValue;
          
        return { communityId, enabled: newValue };
      }
      
      return rejectWithValue(response.data?.message || 'Failed to toggle notification preference');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle notification preference');
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
      state.communityPreferences[communityId] = enabled;
    },
    
    // Initialize preferences from localStorage or server data
    initializePreferences: (
      state,
      action: PayloadAction<Record<string, boolean>>
    ) => {
      state.communityPreferences = action.payload;
    },
    
    // Clear all preferences (e.g., on logout)
    clearPreferences: (state) => {
      state.communityPreferences = {};
    }
  },
  extraReducers: (builder) => {
    // Handle async toggle operation
    builder
      .addCase(toggleNotificationPreference.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleNotificationPreference.fulfilled, (state, action) => {
        const { communityId, enabled } = action.payload;
        state.communityPreferences[communityId] = enabled;
        state.isLoading = false;
      })
      .addCase(toggleNotificationPreference.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions and reducer
export const { 
  setNotificationPreference, 
  initializePreferences,
  clearPreferences
} = notificationPreferencesSlice.actions;

export default notificationPreferencesSlice.reducer;