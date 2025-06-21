// src/redux/slices/privacySettingsSlice.ts - React Native
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Helper to load settings from AsyncStorage
const loadSavedSettings = async (): Promise<PrivacySettings> => {
  try {
    const userId = await getUserId();
    if (!userId) return defaultSettings;
    
    const savedSettings = await AsyncStorage.getItem(`user_${userId}_privacySettings`);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error loading privacy settings:', error);
  }
  
  return defaultSettings;
};

// Helper to save settings to AsyncStorage
const saveSettingsToStorage = async (settings: PrivacySettings) => {
  try {
    const userId = await getUserId();
    if (userId) {
      await AsyncStorage.setItem(
        `user_${userId}_privacySettings`, 
        JSON.stringify(settings)
      );
    }
  } catch (error) {
    console.error('Error saving privacy settings:', error);
  }
};

// Async thunk to initialize settings
export const initializePrivacySettings = createAsyncThunk(
  'privacySettings/initialize',
  async () => {
    return await loadSavedSettings();
  }
);

// Initial state
const initialState: PrivacySettingsState = {
  settings: defaultSettings,
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
      
      // Save to AsyncStorage
      saveSettingsToStorage(state.settings);
    },
    
    // Set multiple settings at once
    updateSettings: (state, action: PayloadAction<Partial<PrivacySettings>>) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
      
      // Save to AsyncStorage
      saveSettingsToStorage(state.settings);
    },
    
    // Reset settings to default
    resetSettings: (state) => {
      state.settings = defaultSettings;
      
      // Save to AsyncStorage
      saveSettingsToStorage(defaultSettings);
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle initializePrivacySettings
    builder.addCase(initializePrivacySettings.fulfilled, (state, action) => {
      state.settings = action.payload;
    });

    // Handle fetchPrivacySettings
    builder
      .addCase(fetchPrivacySettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrivacySettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        
        // Save to AsyncStorage
        saveSettingsToStorage(action.payload);
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
        
        // Save to AsyncStorage
        saveSettingsToStorage(action.payload);
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