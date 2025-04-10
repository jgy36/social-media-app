// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import userReducer from "./slices/userSlice";
import postReducer from "./slices/postSlice";
import communityReducer from "./slices/communitySlice";
import notificationPreferencesReducer from "./slices/notificationPreferencesSlice";
import storage from '../utils/createPersistedStorage';

// Configure persistence for each reducer
const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['id', 'username', 'email', 'displayName', 'bio', 'profileImageUrl', 'isAuthenticated']
};

const communitiesPersistConfig = {
  key: 'communities',
  storage,
  whitelist: ['joinedCommunities', 'featuredCommunities']
};

const notificationsPersistConfig = {
  key: 'notificationPreferences',
  storage,
  whitelist: ['communityPreferences']
};

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedCommunityReducer = persistReducer(communitiesPersistConfig, communityReducer);
const persistedNotificationsReducer = persistReducer(notificationsPersistConfig, notificationPreferencesReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    posts: postReducer,
    communities: persistedCommunityReducer,
    notificationPreferences: persistedNotificationsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;