// src/redux/store.ts - React Native with redux-persist
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userReducer from "./slices/userSlice";
import postReducer from "./slices/postSlice";
import communityReducer from "./slices/communitySlice";
import notificationPreferencesReducer from "./slices/notificationPreferencesSlice";
import privacySettingsReducer from "./slices/privacySettingsSlice";
import badgeReducer from "./slices/badgeSlice";

// Configure persistence for each reducer
const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
  whitelist: ['id', 'username', 'email', 'displayName', 'bio', 'profileImageUrl', 'isAuthenticated', 'role']
};

const communitiesPersistConfig = {
  key: 'communities',
  storage: AsyncStorage,
  whitelist: ['joinedCommunities', 'featuredCommunities', 'isSidebarOpen']
};

const notificationsPersistConfig = {
  key: 'notificationPreferences',
  storage: AsyncStorage,
  whitelist: ['preferences', 'communityPreferences']
};

const privacyPersistConfig = {
  key: 'privacySettings',
  storage: AsyncStorage,
  whitelist: ['settings']
};

const badgesPersistConfig = {
  key: 'badges',
  storage: AsyncStorage,
  whitelist: ['badges', 'initialized']
};

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedCommunityReducer = persistReducer(communitiesPersistConfig, communityReducer);
const persistedNotificationsReducer = persistReducer(notificationsPersistConfig, notificationPreferencesReducer);
const persistedPrivacyReducer = persistReducer(privacyPersistConfig, privacySettingsReducer);
const persistedBadgeReducer = persistReducer(badgesPersistConfig, badgeReducer);

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
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE', 
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH'
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;