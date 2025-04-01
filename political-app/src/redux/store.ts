import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import userReducer from "./slices/userSlice";
import postReducer from "./slices/postSlice";
import communityReducer from "./slices/communitySlice";
import storage from '../utils/createPersistedStorage'; // Custom storage for SSR compatibility

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

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedCommunityReducer = persistReducer(communitiesPersistConfig, communityReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    posts: postReducer,
    communities: persistedCommunityReducer,
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