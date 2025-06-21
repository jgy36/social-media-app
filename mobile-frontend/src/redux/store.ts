// src/redux/store.ts - React Native with redux-persist
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userReducer from "./slices/userSlice";
import postReducer from "./slices/postSlice";
import communityReducer from "./slices/communitySlice";
import notificationPreferencesReducer from "./slices/notificationPreferencesSlice";
import privacySettingsReducer from "./slices/privacySettingsSlice";
import badgeReducer from "./slices/badgeSlice";

// Debug transform to log data being persisted
const DebugTransform = createTransform(
  // transform state on its way to being serialized and persisted
  (inboundState, key) => {
    console.log(`Redux-Persist: Saving state for ${key}`, 
                JSON.stringify(inboundState).substring(0, 50) + "...");
    return inboundState;
  },
  // transform state being rehydrated
  (outboundState, key) => {
    console.log(`Redux-Persist: Loaded state for ${key}`, 
                JSON.stringify(outboundState).substring(0, 50) + "...");
    return outboundState;
  }
);

// Configure persistence for each reducer
const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
  whitelist: ['id', 'username', 'email', 'displayName', 'bio', 'profileImageUrl', 'isAuthenticated', 'role'],
  transforms: [DebugTransform], // Add debug transform
  debug: true, // Enable debug logging
  timeout: 30000, // 30 seconds timeout
};

const communitiesPersistConfig = {
  key: 'communities',
  storage: AsyncStorage,
  whitelist: ['joinedCommunities', 'featuredCommunities', 'isSidebarOpen'],
  debug: true,
  timeout: 30000,
};

const notificationsPersistConfig = {
  key: 'notificationPreferences',
  storage: AsyncStorage,
  whitelist: ['preferences', 'communityPreferences'],
  debug: true,
  timeout: 30000,
};

const privacyPersistConfig = {
  key: 'privacySettings',
  storage: AsyncStorage,
  whitelist: ['settings'],
  debug: true,
  timeout: 30000,
};

const badgesPersistConfig = {
  key: 'badges',
  storage: AsyncStorage,
  whitelist: ['badges', 'initialized'],
  debug: true,
  timeout: 30000, // Increased timeout for badges
};

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedCommunityReducer = persistReducer(communitiesPersistConfig, communityReducer);
const persistedNotificationsReducer = persistReducer(notificationsPersistConfig, notificationPreferencesReducer);
const persistedPrivacyReducer = persistReducer(privacyPersistConfig, privacySettingsReducer);
const persistedBadgeReducer = persistReducer(badgesPersistConfig, badgeReducer);

// Log when store is being configured
console.log("Configuring Redux store...");

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    posts: postReducer, // Don't persist posts
    communities: persistedCommunityReducer,
    notificationPreferences: persistedNotificationsReducer,
    privacySettings: persistedPrivacyReducer,
    badges: persistedBadgeReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // TEMPORARILY DISABLE these checks for debugging
      serializableCheck: false,
      immutableCheck: false,
      thunk: {
        extraArgument: undefined,
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

console.log("Store configuration complete, initializing persistor...");

// Create persistor with config options
export const persistor = persistStore(store, {
  // No options needed here
}, () => {
  console.log("Redux store has been persisted and rehydrated");
  console.log("Current store state:", 
              JSON.stringify(store.getState().user).substring(0, 100) + "...");
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Log once everything is set up
console.log("Redux setup complete");