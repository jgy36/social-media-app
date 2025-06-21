// src/redux/slices/privacySettingsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/api/apiClient";
import { getUserId } from "@/utils/tokenUtils";

// Define the privacy settings interface
export interface PrivacySettings {
  publicProfile: boolean;
  showPoliticalAffiliation: boolean;
  showPostHistory: boolean;
  showVotingRecord: boolean;
  allowDirectMessages: boolean;
  allowFollowers: boolean;
  allowSearchIndexing: boolean;
  dataSharing: boolean;
}

// State interface
interface PrivacySettingsState {
  settings: PrivacySettings;
  isLoading: boolean;
  error: string | null;
}

// Default settings
const defaultSettings: PrivacySettings = {
  publicProfile: true,
  showPoliticalAffiliation: false,
  showPostHistory: true,
  showVotingRecord: false,
  allowDirectMessages: true,
  allowFollowers: true,
  allowSearchIndexing: true,
  dataSharing: false,
};

// Helper to load settings from localStorage
const loadSavedSettings = (): PrivacySettings => {
  if (typeof window === 'undefined') return defaultSettings;
  
  try {
    const userId = getUserId();
    if (!userId) return defaultSettings;
    
    const savedSettings = localStorage.getItem(`user_${userId}_privacySettings`);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error loading privacy settings:', error);
  }
  
  return defaultSettings;
};

// Initial state
const initialState: PrivacySettingsState = {
  settings: loadSavedSettings(),
  isLoading: false,
  error: null,
};

// Async thunk to fetch privacy settings
export const fetchPrivacySettings = createAsyncThunk(
  'privacySettings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<PrivacySettings>('/users/privacy-settings');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch privacy settings');
    }
  }
);

// Async thunk to update privacy settings
export const updatePrivacySettings = createAsyncThunk(
  'privacySettings/update',
  async (settings: PrivacySettings, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<{ success: boolean }>('/users/privacy-settings', settings);
      
      if (response.data.success) {
        return settings;
      } else {
        return rejectWithValue('Failed to update privacy settings');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update privacy settings');
    }
  }
);

// Create the slice
const privacySettingsSlice = createSlice({
  name: 'privacySettings',
  initialState,
  reducers: {
    // Direct update for a single setting
    toggleSetting: (state, action: PayloadAction<{ key: keyof PrivacySettings }>) => {
      const { key } = action.payload;
      state.settings[key] = !state.settings[key];
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        const userId = getUserId();
        if (userId) {
          localStorage.setItem(
            `user_${userId}_privacySettings`, 
            JSON.stringify(state.settings)
          );
        }
      }
    },
    
    // Set multiple settings at once
    updateSettings: (state, action: PayloadAction<Partial<PrivacySettings>>) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        const userId = getUserId();
        if (userId) {
          localStorage.setItem(
            `user_${userId}_privacySettings`, 
            JSON.stringify(state.settings)
          );
        }
      }
    },
    
    // Reset settings to default
    resetSettings: (state) => {
      state.settings = defaultSettings;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        const userId = getUserId();
        if (userId) {
          localStorage.setItem(
            `user_${userId}_privacySettings`, 
            JSON.stringify(defaultSettings)
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
    // Handle fetchPrivacySettings
    builder
      .addCase(fetchPrivacySettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrivacySettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          const userId = getUserId();
          if (userId) {
            localStorage.setItem(
              `user_${userId}_privacySettings`, 
              JSON.stringify(action.payload)
            );
          }
        }
      })
      .addCase(fetchPrivacySettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Handle updatePrivacySettings
    builder
      .addCase(updatePrivacySettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePrivacySettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          const userId = getUserId();
          if (userId) {
            localStorage.setItem(
              `user_${userId}_privacySettings`, 
              JSON.stringify(action.payload)
            );
          }
        }
      })
      .addCase(updatePrivacySettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { 
  toggleSetting, 
  updateSettings,
  resetSettings,
  clearError
} = privacySettingsSlice.actions;

export default privacySettingsSlice.reducer;