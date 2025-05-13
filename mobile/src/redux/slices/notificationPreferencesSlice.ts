// src/redux/slices/notificationPreferencesSlice.ts - React Native
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Define community notification action interface
interface CommunityNotificationAction {
  communityId: string;
  enabled: boolean;
}

// State interface
interface NotificationPreferencesState {
  preferences: NotificationPreferences;
  communityPreferences: Record<string, boolean>; // Added for per-community settings
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

// Helper to load preferences from AsyncStorage
const loadSavedPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const userId = await getUserId();
    if (!userId) return defaultPreferences;
    
    const savedPrefs = await AsyncStorage.getItem(`user_${userId}_notificationPreferences`);
    if (savedPrefs) {
      return JSON.parse(savedPrefs);
    }
  } catch (error) {
    console.error('Error loading notification preferences:', error);
  }
  
  return defaultPreferences;
};

// Helper to save preferences to AsyncStorage
const savePreferencesToStorage = async (preferences: NotificationPreferences) => {
  try {
    const userId = await getUserId();
    if (userId) {
      await AsyncStorage.setItem(
        `user_${userId}_notificationPreferences`, 
        JSON.stringify(preferences)
      );
    }
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
};

// Async thunk to initialize preferences
export const initializeNotificationPreferences = createAsyncThunk(
  'notificationPreferences/initialize',
  async () => {
    return await loadSavedPreferences();
  }
);

// Initial state
const initialState: NotificationPreferencesState = {
  preferences: defaultPreferences,
  communityPreferences: {}, // Added for per-community settings
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
      
      // Save to AsyncStorage
      savePreferencesToStorage(state.preferences);
    },
    
    // Reset preferences to default
    resetPreferences: (state) => {
      state.preferences = defaultPreferences;
      
      // Save to AsyncStorage
      savePreferencesToStorage(defaultPreferences);
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set notification preference for a specific community
    setNotificationPreference: (state, action: PayloadAction<CommunityNotificationAction>) => {
      const { communityId, enabled } = action.payload;
      state.communityPreferences[communityId] = enabled;
    },
    
    // Toggle notification preference for a specific community
    toggleNotificationPreference: (state, action: PayloadAction<string>) => {
      const communityId = action.payload;
      const currentValue = state.communityPreferences[communityId] ?? false;
      state.communityPreferences[communityId] = !currentValue;
    },
    
    // Update preference from server, only if different from current state
    updatePreferenceFromServer: (state, action: PayloadAction<CommunityNotificationAction>) => {
      const { communityId, enabled } = action.payload;
      const currentValue = state.communityPreferences[communityId];
      
      // Only update if the value is different or not set yet
      if (currentValue === undefined || currentValue !== enabled) {
        console.log(`Updating notification for ${communityId} to ${enabled} (from server)`);
        state.communityPreferences[communityId] = enabled;
      }
    },
  },
  extraReducers: (builder) => {
    // Handle initializeNotificationPreferences
    builder.addCase(initializeNotificationPreferences.fulfilled, (state, action) => {
      state.preferences = action.payload;
    });

    // Handle fetchNotificationPreferences
    builder
      .addCase(fetchNotificationPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
        
        // Save to AsyncStorage
        savePreferencesToStorage(action.payload);
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
        
        // Save to AsyncStorage
        savePreferencesToStorage(action.payload);
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
  clearError,
  setNotificationPreference,     
  toggleNotificationPreference,
  updatePreferenceFromServer     // Added this export
} = notificationPreferencesSlice.actions;

export default notificationPreferencesSlice.reducer;